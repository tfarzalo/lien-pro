import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, CheckCircle, DollarSign, FileText, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AssessmentCTA } from '@/components/common/AssessmentCTA';
import { getKitPrice } from '@/lib/kitPricing';

interface LienKit {
    id: string;
    name: string;
    description: string;
    price: number;
    jurisdiction: string;
    category: string;
    features: string[];
    is_popular: boolean;
}

export default function BrowseKitsPage() {
    const navigate = useNavigate();
    const [kits, setKits] = useState<LienKit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKits();
    }, []);

    const loadKits = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('lien_kits')
                .select('*')
                .eq('is_active', true)
                .order('is_popular', { ascending: false })
                .order('name');

            if (error) throw error;
            setKits(data || []);
        } catch (error) {
            console.error('Error loading kits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = (kitId: string) => {
        navigate(`/kits/${kitId}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand-50 to-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Professional Lien Filing Kits
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Get everything you need to file mechanics liens and protect your payment rights.
                        Attorney-reviewed forms, step-by-step guidance, and deadline tracking included.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Kits Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : kits.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Kits Found</h3>
                            <p className="text-slate-600 mb-4">
                                We don't have any lien kits available yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kits.map(kit => (
                            <Card key={kit.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={kit.is_popular ? 'primary' : 'secondary'}>
                                            {kit.is_popular ? 'Popular' : kit.jurisdiction}
                                        </Badge>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900">
                                                ${getKitPrice(kit)}
                                            </div>
                                            <div className="text-sm text-slate-500">one-time</div>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl">{kit.name}</CardTitle>
                                    <p className="text-slate-600 text-sm mt-2">{kit.description}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 mb-6">
                                        {kit.features?.slice(0, 4).map((feature, idx) => (
                                            <div key={idx} className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-success-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-slate-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePurchase(kit.id)}
                                    >
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Trust Section */}
                <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
                        Why Choose Lien Professor?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-brand-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Attorney-Reviewed</h3>
                            <p className="text-slate-600 text-sm">
                                All forms are reviewed by licensed attorneys to ensure compliance with state laws.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-brand-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Complete Packages</h3>
                            <p className="text-slate-600 text-sm">
                                Everything you need in one kit - forms, instructions, deadlines, and support.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="h-8 w-8 text-brand-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Money-Back Guarantee</h3>
                            <p className="text-slate-600 text-sm">
                                Not satisfied? Get a full refund within 30 days, no questions asked.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg shadow-lg p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Not Sure Which Kit You Need?
                    </h2>
                    <p className="text-xl text-brand-50 mb-8 max-w-2xl mx-auto">
                        Take our free assessment to get personalized recommendations based on your project details.
                    </p>
                    <AssessmentCTA
                        variant="secondary"
                        size="lg"
                        className="text-lg px-8 bg-white text-brand-700 hover:bg-slate-100"
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-4">
                        <img src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-icon.png" alt="Lien Professor" className="h-12 w-12" />
                    </div>
                    <p>&copy; 2025 Lien Professor. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
