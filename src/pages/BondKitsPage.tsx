import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, CheckCircle, DollarSign, FileText, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AssessmentCTA } from '@/components/common/AssessmentCTA';
import { getKitPrice } from '@/lib/kitPricing';

interface BondKit {
    id: string;
    name: string;
    description: string;
    price: number;
    jurisdiction: string;
    category: string;
    features: string[];
    is_popular: boolean;
}

export default function BondKitsPage() {
    const navigate = useNavigate();
    const [kits, setKits] = useState<BondKit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadKits();
    }, []);

    const loadKits = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bond_kits')
                .select('*')
                .eq('is_active', true)
                .order('is_popular', { ascending: false })
                .order('name');

            if (error) {
                console.log('Bond kits table may not exist yet, using mock data');
                // Use mock data if table doesn't exist
                setKits(mockBondKits);
            } else {
                setKits(data || mockBondKits);
            }
        } catch (error) {
            console.error('Error loading bond kits:', error);
            setKits(mockBondKits);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...Array.from(new Set(kits.map(kit => kit.category)))];
    const filteredKits = selectedCategory === 'all'
        ? kits
        : kits.filter(kit => kit.category === selectedCategory);

    const handlePurchase = (kitId: string) => {
        // Navigate to kit details page instead of forcing checkout
        navigate(`/bond-kits/${kitId}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 to-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Professional Payment Bond Claim Kits
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Get everything you need to file payment bond claims on public projects.
                        Attorney-reviewed forms, step-by-step guidance, and deadline tracking included.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category Filter */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'primary' : 'secondary'}
                            onClick={() => setSelectedCategory(category)}
                            className="capitalize"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Kits Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : filteredKits.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Kits Found</h3>
                            <p className="text-slate-600 mb-4">
                                We don't have any kits in this category yet.
                            </p>
                            <Button onClick={() => setSelectedCategory('all')}>View All Kits</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredKits.map(kit => (
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
                        Why Choose Lien Professor for Bond Claims?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Attorney-Reviewed</h3>
                            <p className="text-slate-600 text-sm">
                                All bond claim forms are reviewed by licensed attorneys familiar with public project requirements.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Complete Packages</h3>
                            <p className="text-slate-600 text-sm">
                                Everything you need in one kit - forms, instructions, deadlines, and certified mail tracking.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Money-Back Guarantee</h3>
                            <p className="text-slate-600 text-sm">
                                Not satisfied? Get a full refund within 30 days, no questions asked.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Not Sure Which Bond Kit You Need?
                    </h2>
                    <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
                        Take our free assessment to get personalized recommendations based on your public project details.
                    </p>
                    <AssessmentCTA
                        variant="secondary"
                        size="lg"
                        className="text-lg px-8 bg-white text-blue-700 hover:bg-slate-100"
                    />
                </div>
            </div>
        </div>
    );
}

// Mock data for bond kits until database table is created
const mockBondKits: BondKit[] = [
    {
        id: 'bond-kit-1',
        name: 'Texas Payment Bond Claim Kit',
        description: 'Complete package for filing payment bond claims on Texas public projects. Includes all required notices, affidavits, and step-by-step filing instructions.',
        price: 129,
        jurisdiction: 'Texas',
        category: 'state',
        is_popular: true,
        features: [
            'Second Month Notice Templates',
            'Third Month Bond Claim',
            'Deadline Calculator',
            'Certified Mail Instructions',
        ],
    },
    {
        id: 'bond-kit-2',
        name: 'Federal Miller Act Bond Claim Kit',
        description: 'Essential documents for making payment bond claims on federal government projects under the Miller Act.',
        price: 149,
        jurisdiction: 'Federal',
        category: 'federal',
        is_popular: true,
        features: [
            '90-Day Notice Templates',
            'Miller Act Claim Documents',
            'Federal Timeline Tracking',
            'Service Requirements Guide',
        ],
    },
    {
        id: 'bond-kit-3',
        name: 'Little Miller Act Claims Bundle',
        description: 'State-specific payment bond claim kits for public projects under state Little Miller Acts.',
        price: 139,
        jurisdiction: 'Multi-State',
        category: 'state',
        is_popular: false,
        features: [
            'State-Specific Notice Forms',
            'Bond Claim Procedures',
            'Deadline Compliance Tools',
            'Multi-Tier Service Guide',
        ],
    },
    {
        id: 'bond-kit-4',
        name: 'Notice of Claim for Retainage',
        description: 'Specialized kit for protecting your retainage on public projects through proper bond claims.',
        price: 79,
        jurisdiction: 'Texas',
        category: 'state',
        is_popular: false,
        features: [
            'Retainage Claim Notice',
            'Supporting Affidavits',
            'Timing Checklist',
            'Service Documentation',
        ],
    },
    {
        id: 'bond-kit-5',
        name: 'Public Works Bond Claim - California',
        description: 'Complete California stop notice and payment bond claim package for public construction projects.',
        price: 149,
        jurisdiction: 'California',
        category: 'state',
        is_popular: false,
        features: [
            'Stop Notice Forms',
            'Bond Claim Documents',
            'California-Specific Requirements',
            'Withholding Release Forms',
        ],
    },
    {
        id: 'bond-kit-6',
        name: 'Public Works Bond Claim - Florida',
        description: 'Florida payment bond claim kit for state and local government construction projects.',
        price: 139,
        jurisdiction: 'Florida',
        category: 'state',
        is_popular: false,
        features: [
            'Notice to Contractor',
            'Notice to Surety',
            'Florida Verified Statement',
            'Timeline Management Tools',
        ],
    },
];
