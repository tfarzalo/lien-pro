import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Shield,
    FileText,
    Clock,
    Package,
    Download,
    Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AssessmentCTA } from '@/components/common/AssessmentCTA';
import { getKitPrice } from '@/lib/kitPricing';

interface KitDetails {
    id: string;
    name: string;
    description: string;
    price: number;
    jurisdiction: string;
    category: string;
    features: string[];
    is_popular: boolean;
    long_description?: string;
    included_documents?: string[];
    support_included?: boolean;
}

export default function KitDetailsPage() {
    const { kitId } = useParams<{ kitId: string }>();
    const navigate = useNavigate();
    const [kit, setKit] = useState<KitDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [kitType, setKitType] = useState<'lien' | 'bond'>('lien');

    useEffect(() => {
        loadKit();
    }, [kitId]);

    const loadKit = async () => {
        if (!kitId) return;

        try {
            setLoading(true);

            // Try lien kits first
            let { data, error } = await supabase
                .from('lien_kits')
                .select('*')
                .eq('id', kitId)
                .single();

            if (error || !data) {
                // Try bond kits
                const bondResult = await supabase
                    .from('bond_kits')
                    .select('*')
                    .eq('id', kitId)
                    .single();

                if (bondResult.data) {
                    data = bondResult.data;
                    setKitType('bond');
                } else {
                    // Use mock data if not found
                    const mockKit = getMockKit(kitId);
                    if (mockKit) {
                        setKit(mockKit);
                        setKitType(mockKit.category === 'bond' ? 'bond' : 'lien');
                    }
                    setLoading(false);
                    return;
                }
            } else {
                setKitType('lien');
            }

            setKit(data as KitDetails);
        } catch (error) {
            console.error('Error loading kit:', error);
            // Try mock data as fallback
            const mockKit = getMockKit(kitId);
            if (mockKit) {
                setKit(mockKit);
                setKitType(mockKit.category === 'bond' ? 'bond' : 'lien');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = () => {
        navigate(`/checkout?kit=${kitId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!kit) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Kit Not Found</h1>
                    <p className="text-slate-600 mb-6">We couldn't find the kit you're looking for.</p>
                    <Button onClick={() => navigate(kitType === 'bond' ? '/bond-kits' : '/kits')}>
                        Browse All Kits
                    </Button>
                </div>
            </div>
        );
    }

    const themeColor = kitType === 'bond' ? 'blue' : 'brand';
    const displayPrice = getKitPrice(kit);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Back Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(kitType === 'bond' ? '/bond-kits' : '/kits')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {kitType === 'bond' ? 'Bond Kits' : 'Lien Kits'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {kit.is_popular && (
                                    <Badge variant="primary" className="text-sm">
                                        Most Popular
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-sm">
                                    {kit.jurisdiction}
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                                {kit.name}
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                {kit.long_description || kit.description}
                            </p>
                        </div>

                        {/* What's Included */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Package className={`h-6 w-6 text-${themeColor}-600`} />
                                    What's Included
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {kit.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle className={`h-5 w-5 text-${themeColor}-600 flex-shrink-0 mt-0.5`} />
                                            <span className="text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents Included */}
                        {kit.included_documents && kit.included_documents.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Download className={`h-6 w-6 text-${themeColor}-600`} />
                                        Included Documents
                                    </h2>
                                    <ul className="space-y-3">
                                        {kit.included_documents.map((doc, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-slate-700">
                                                <FileText className={`h-4 w-4 text-${themeColor}-600`} />
                                                {doc}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* How It Works */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    How It Works
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center font-bold`}>
                                            1
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">Purchase & Download</h3>
                                            <p className="text-slate-600">Complete checkout and instantly download your kit with all forms and instructions.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center font-bold`}>
                                            2
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">Complete Your Forms</h3>
                                            <p className="text-slate-600">Fill out the templates with your project details following our step-by-step guide.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center font-bold`}>
                                            3
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">File & Serve</h3>
                                            <p className="text-slate-600">Follow the filing instructions and deadline reminders to protect your rights.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Purchase Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <div className="text-4xl font-bold text-slate-900 mb-2">
                                        ${displayPrice}
                                    </div>
                                    <p className="text-slate-600">One-time payment</p>
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handlePurchase}
                                >
                                    Purchase Kit
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>

                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                                        <span>30-day money-back guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                                        <span>Reusable on multiple projects</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                                        <span>Instant download access</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                                        <span>Email support included</span>
                                    </div>
                                </div>

                                <div className={`bg-${themeColor}-50 rounded-lg p-4 text-sm`}>
                                    <p className={`text-${themeColor}-900 font-medium mb-1`}>
                                        Need help deciding?
                                    </p>
                                    <p className={`text-${themeColor}-700 mb-3`}>
                                        Take our free assessment for personalized recommendations
                                    </p>
                                    <AssessmentCTA variant="secondary" size="sm" className="w-full" showIcon={false} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Benefits - Full Width */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-${themeColor}-50 flex items-center justify-center mx-auto mb-3`}>
                            <Shield className={`h-8 w-8 text-${themeColor}-600`} />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Attorney-Reviewed</h3>
                        <p className="text-sm text-slate-600">All forms reviewed by licensed construction attorneys</p>
                    </div>
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-${themeColor}-50 flex items-center justify-center mx-auto mb-3`}>
                            <Clock className={`h-8 w-8 text-${themeColor}-600`} />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Instant Access</h3>
                        <p className="text-sm text-slate-600">Download immediately after purchase</p>
                    </div>
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-${themeColor}-50 flex items-center justify-center mx-auto mb-3`}>
                            <Mail className={`h-8 w-8 text-${themeColor}-600`} />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Support Included</h3>
                        <p className="text-sm text-slate-600">Email support for questions about your kit</p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-12">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(kitType === 'bond' ? '/bond-kits' : '/kits')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Kits
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Mock data helper
function getMockKit(kitId: string): KitDetails | null {
    const mockKits: Record<string, KitDetails> = {
        'bond-kit-1': {
            id: 'bond-kit-1',
            name: 'Texas Payment Bond Claim Kit',
            description: 'Complete package for filing payment bond claims on Texas public projects.',
            long_description: 'Complete package for filing payment bond claims on Texas public projects. Includes all required notices, affidavits, and step-by-step filing instructions specifically tailored for Texas state and local government construction projects.',
            price: 129,
            jurisdiction: 'Texas',
            category: 'bond',
            is_popular: true,
            features: [
                'Second Month Notice Templates',
                'Third Month Bond Claim',
                'Deadline Calculator',
                'Certified Mail Instructions',
                'Supporting Affidavits',
                'Service Documentation',
            ],
            included_documents: [
                'Second Month Notice to Contractor',
                'Second Month Notice to Surety',
                'Third Month Bond Claim Letter',
                'Affidavit of Claim',
                'Certified Mail Tracking Forms',
                'Timeline Worksheet',
            ],
            support_included: true,
        },
        // Add more mock kits as needed
    };

    return mockKits[kitId] || null;
}
