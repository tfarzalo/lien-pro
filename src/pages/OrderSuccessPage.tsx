// =====================================================
// Order Success Page
// Displays order confirmation after successful payment
// =====================================================

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useOrderDetails } from '@/hooks/useCheckout'
import { CheckCircle, Download, FileText, Home, AlertCircle } from 'lucide-react'
import type { Order, OrderItem } from '@/types/database'

export function OrderSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order')

    const { data: orderData, isLoading, error } = useOrderDetails(orderId || undefined)

    // Redirect to landing page if no order ID
    useEffect(() => {
        if (!orderId) {
            navigate('/lien-professor')
        }
    }, [orderId, navigate])

    if (isLoading) {
        return (
            <AppShell>
                <div className="max-w-3xl mx-auto py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading order details...</p>
                </div>
            </AppShell>
        )
    }

    if (error || !orderData) {
        return (
            <AppShell>
                <div className="max-w-3xl mx-auto py-12">
                    <Alert variant="danger">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Unable to load order details. Please contact support if you need assistance.
                        </AlertDescription>
                    </Alert>
                    <Button className="mt-6" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </AppShell>
        )
    }

    const order = orderData as Order & { order_items?: Array<OrderItem & { lien_kit?: any }> }
    const totalAmount = order.total_cents / 100

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-success-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-lg text-slate-600">
                        Thank you for your purchase. Your lien kits are now available.
                    </p>
                </div>

                {/* Order Details Card */}
                <Card className="mb-6">
                    <CardHeader className="bg-slate-50">
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Order Number</p>
                                <p className="font-semibold text-slate-900">{order.order_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Order Date</p>
                                <p className="font-semibold text-slate-900">
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Payment Method</p>
                                <p className="font-semibold text-slate-900">
                                    {order.payment_method === 'card' ? 'Credit Card' : order.payment_method}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                <p className="font-semibold text-slate-900 text-xl">
                                    ${totalAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Purchased Items */}
                        {order.order_items && order.order_items.length > 0 && (
                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Purchased Items</h3>
                                <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-brand-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {item.lien_kit?.name || 'Lien Kit'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900">
                                                    ${(item.unit_price_cents / 100).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Next Steps Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>What's Next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-semibold">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Access Your Kits</p>
                                    <p className="text-sm text-slate-600">
                                        Your purchased lien kits are now available in your dashboard. Click the button
                                        below to view them.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-semibold">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Download Forms</p>
                                    <p className="text-sm text-slate-600">
                                        Each kit includes all necessary forms and documents. Download them and follow
                                        the step-by-step instructions.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-semibold">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Get Support</p>
                                    <p className="text-sm text-slate-600">
                                        Need help? Contact our support team at support@lienprofessor.com. We're here to
                                        help you succeed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Confirmation Notice */}
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        A confirmation email with your receipt and order details has been sent to your email
                        address.
                    </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                        size="lg"
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Go to Dashboard
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => navigate('/lien-professor')}
                        className="w-full sm:w-auto"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </div>

                {/* Help Section */}
                <div className="mt-12 text-center">
                    <p className="text-slate-600 mb-2">Need help getting started?</p>
                    <Button variant="link" onClick={() => navigate('/support')}>
                        Visit our Help Center
                    </Button>
                </div>
            </div>
        </AppShell>
    )
}
