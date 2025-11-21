import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useLienKits } from '@/hooks/useLienKits'
import { useProcessTestPayment } from '@/hooks/useCheckout'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, CreditCard, Lock, Check, AlertCircle } from 'lucide-react'
import type { LienKit } from '@/types/database'
import type { CheckoutItem, TestPaymentDetails } from '@/types/stripe'
import { DEFAULT_TEST_PAYMENT } from '@/types/stripe'

export function CheckoutPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { data: allKits } = useLienKits()
    const processPayment = useProcessTestPayment()

    // Get kit IDs from URL
    const kitParam = searchParams.get('kit')
    const kitsParam = searchParams.get('kits')

    const [selectedKitIds, setSelectedKitIds] = useState<string[]>([])
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([])
    const [paymentDetails, setPaymentDetails] = useState<TestPaymentDetails>(DEFAULT_TEST_PAYMENT)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string>('')

    // Parse kit IDs from URL
    useEffect(() => {
        const ids: string[] = []

        if (kitParam) {
            ids.push(kitParam)
        } else if (kitsParam) {
            ids.push(...kitsParam.split(','))
        }

        setSelectedKitIds(ids)
    }, [kitParam, kitsParam])

    // Build checkout items from selected kits
    useEffect(() => {
        if (!allKits || selectedKitIds.length === 0) return

        const items: CheckoutItem[] = selectedKitIds
            .map((id) => {
                const kit = allKits.find((k: LienKit) => k.id === id)
                if (!kit) return null

                const item: CheckoutItem = {
                    kitId: kit.id,
                    name: kit.name,
                    price: kit.price_cents / 100,
                    quantity: 1,
                }

                // Only add features if they exist
                if (kit.features && kit.features.length > 0) {
                    item.features = kit.features
                }

                return item
            })
            .filter((item): item is CheckoutItem => item !== null)

        setCheckoutItems(items)
    }, [allKits, selectedKitIds])

    // Calculate totals
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = 0 // Texas has no state income tax, but localities may have sales tax
    const total = subtotal + tax

    // Handle payment input changes
    const handlePaymentChange = (field: keyof TestPaymentDetails, value: string) => {
        setPaymentDetails((prev) => ({ ...prev, [field]: value }))
    }

    // Handle checkout
    const handleCheckout = async () => {
        if (checkoutItems.length === 0) {
            setError('Please select at least one kit to purchase')
            return
        }

        // Validate payment details
        if (!paymentDetails.cardNumber || !paymentDetails.name || !paymentDetails.email) {
            setError('Please fill in all required payment details')
            return
        }

        setIsProcessing(true)
        setError('')

        try {
            // Process payment (works for both authenticated and guest users in test mode)
            const order = await processPayment.mutateAsync(selectedKitIds)

            // Redirect to success page
            navigate(`/checkout/success?order=${order.id}`)
        } catch (err) {
            console.error('Payment failed:', err)
            setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (checkoutItems.length === 0) {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto py-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                    <p className="text-slate-600 mb-6">
                        Browse our lien kits or take the assessment to find the right kit for you.
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <Button variant="secondary" onClick={() => navigate('/kits')}>
                            Browse Kits
                        </Button>
                        <Button onClick={() => navigate('/assessment')}>
                            Take Assessment
                        </Button>
                    </div>
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Order Summary & Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Test Mode Notice */}
                        <Alert className="bg-warning-50 border-warning-200">
                            <AlertCircle className="h-4 w-4 text-warning-600" />
                            <AlertDescription className="text-warning-800">
                                <strong>Test Mode:</strong> This is a test checkout. No real charges will be made.
                                Use the pre-filled test card for development.
                            </AlertDescription>
                        </Alert>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ShoppingCart className="mr-2 h-5 w-5 text-brand-600" />
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {checkoutItems.map((item) => (
                                        <div
                                            key={item.kitId}
                                            className="flex items-start justify-between p-4 bg-slate-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900 mb-1">{item.name}</h3>
                                                {item.features && item.features.length > 0 && (
                                                    <ul className="text-sm text-slate-600 space-y-1">
                                                        {item.features.slice(0, 3).map((feature, idx) => (
                                                            <li key={idx} className="flex items-center">
                                                                <Check className="h-3 w-3 mr-1 text-success-600" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 ml-4 text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    ${item.price.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5 text-brand-600" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Card Number */}
                                <div>
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input
                                        id="cardNumber"
                                        type="text"
                                        value={paymentDetails.cardNumber}
                                        onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                                        placeholder="4242 4242 4242 4242"
                                        maxLength={16}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Use test card: 4242 4242 4242 4242
                                    </p>
                                </div>

                                {/* Expiry & CVC */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="expiryMonth">Month</Label>
                                        <Input
                                            id="expiryMonth"
                                            type="text"
                                            value={paymentDetails.expiryMonth}
                                            onChange={(e) => handlePaymentChange('expiryMonth', e.target.value)}
                                            placeholder="MM"
                                            maxLength={2}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expiryYear">Year</Label>
                                        <Input
                                            id="expiryYear"
                                            type="text"
                                            value={paymentDetails.expiryYear}
                                            onChange={(e) => handlePaymentChange('expiryYear', e.target.value)}
                                            placeholder="YYYY"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input
                                            id="cvc"
                                            type="text"
                                            value={paymentDetails.cvc}
                                            onChange={(e) => handlePaymentChange('cvc', e.target.value)}
                                            placeholder="123"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>

                                {/* Name on Card */}
                                <div>
                                    <Label htmlFor="name">Name on Card</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={paymentDetails.name}
                                        onChange={(e) => handlePaymentChange('name', e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={paymentDetails.email}
                                        onChange={(e) => handlePaymentChange('email', e.target.value)}
                                        placeholder="john@example.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Receipt will be sent to this email
                                    </p>
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <Label htmlFor="zipCode">Zip Code</Label>
                                    <Input
                                        id="zipCode"
                                        type="text"
                                        value={paymentDetails.zipCode}
                                        onChange={(e) => handlePaymentChange('zipCode', e.target.value)}
                                        placeholder="78701"
                                        maxLength={10}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Options */}
                        {!user && (
                            <Card className="border-brand-200 bg-brand-50/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-brand-900">
                                        <Check className="mr-2 h-5 w-5 text-brand-600" />
                                        Create Your Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-700">
                                        Create an account to access your purchased kits, learning center, and optional management tools.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-start p-3 bg-white rounded-lg border border-slate-200">
                                            <input type="radio" name="accountType" id="basic" className="mt-1 mr-3" defaultChecked />
                                            <div className="flex-1">
                                                <label htmlFor="basic" className="font-semibold text-slate-900 cursor-pointer">
                                                    Basic Access (Free)
                                                </label>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    • Download your purchased kits<br />
                                                    • Full learning center access<br />
                                                    • Resource library
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 bg-white rounded-lg border-2 border-brand-300">
                                            <input type="radio" name="accountType" id="premium" className="mt-1 mr-3" />
                                            <div className="flex-1">
                                                <label htmlFor="premium" className="font-semibold text-slate-900 cursor-pointer">
                                                    + Lien Management Tool
                                                    <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                                        +$19/month
                                                    </span>
                                                </label>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    • Everything in Basic, plus:<br />
                                                    • Automated deadline tracking<br />
                                                    • Document management<br />
                                                    • Email reminders
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Create Password (optional)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Leave blank to receive a setup link via email"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Or we'll email you a secure link to set your password after purchase
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert variant="danger">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Sidebar - Price Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Price Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-slate-700">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                {/* Tax */}
                                <div className="flex items-center justify-between text-slate-700">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Complete Purchase
                                        </>
                                    )}
                                </Button>

                                {/* Security Info */}
                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex items-start space-x-2 text-xs text-slate-600">
                                        <Lock className="h-4 w-4 text-success-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-700 mb-1">Secure Checkout</p>
                                            <p>
                                                Your payment information is encrypted and secure. We never store your card
                                                details.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Included Features */}
                                <div className="pt-4 border-t border-slate-200">
                                    <h4 className="font-semibold text-slate-900 mb-2">What's Included:</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center">
                                            <Check className="h-4 w-4 mr-2 text-success-600" />
                                            Instant access to all forms
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-4 w-4 mr-2 text-success-600" />
                                            Step-by-step instructions
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-4 w-4 mr-2 text-success-600" />
                                            Lifetime updates
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-4 w-4 mr-2 text-success-600" />
                                            Email support
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
