import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, CheckCircle, FileText, Shield, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AssessmentCTA } from '@/components/common/AssessmentCTA';
import { getKitPrice } from '@/lib/kitPricing';

interface Kit {
    id: string;
    name: string;
    description: string;
    price: number;
    jurisdiction: string;
    category: string;
    features: string[];
    is_popular: boolean;
    kit_type?: 'lien' | 'bond';
}

export default function AllKitsPage() {
    const navigate = useNavigate();
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'lien' | 'bond'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        loadAllKits();
    }, []);

    const loadAllKits = async () => {
        setLoading(true);
        try {
            // Load lien kits
            const { data: lienKits, error: lienError } = await supabase
                .from('lien_kits')
                .select('*')
                .order('is_popular', { ascending: false });

            // Load bond kits
            const { data: bondKits, error: bondError } = await supabase
                .from('bond_kits')
                .select('*')
                .order('is_popular', { ascending: false});

            const allKits: Kit[] = [];

            if (lienKits && !lienError) {
                allKits.push(...lienKits.map(kit => ({ ...kit, kit_type: 'lien' as const })));
            }

            if (bondKits && !bondError) {
                allKits.push(...bondKits.map(kit => ({ ...kit, kit_type: 'bond' as const })));
            }

            // Add mock kits if no data
            if (allKits.length === 0) {
                allKits.push(...getMockKits());
            }

            setKits(allKits);
        } catch (error) {
            console.error('Error loading kits:', error);
            setKits(getMockKits());
        } finally {
            setLoading(false);
        }
    };

    const getMockKits = (): Kit[] => [
        {
            id: 'lien-kit-1',
            name: 'Texas Residential Lien Kit',
            description: 'Complete package for filing mechanics liens on residential projects',
            price: 199,
            jurisdiction: 'Texas',
            category: 'residential',
            kit_type: 'lien',
            is_popular: true,
            features: [
                'Preliminary Notice Templates',
                'Mechanics Lien Affidavit',
                'Notice to Owner',
                'Step-by-step Filing Guide'
            ]
        },
        {
            id: 'lien-kit-2',
            name: 'Texas Commercial Lien Kit',
            description: 'Comprehensive toolkit for commercial construction liens',
            price: 299,
            jurisdiction: 'Texas',
            category: 'commercial',
            kit_type: 'lien',
            is_popular: true,
            features: [
                'Complex Project Templates',
                'Multiple Party Notices',
                'Deadline Calculator',
                'Priority Documentation'
            ]
        },
        {
            id: 'bond-kit-1',
            name: 'Texas Payment Bond Claim Kit',
            description: 'Complete package for filing payment bond claims on Texas public projects',
            price: 179,
            jurisdiction: 'Texas',
            category: 'state',
            kit_type: 'bond',
            is_popular: true,
            features: [
                'Second Month Notice Templates',
                'Third Month Bond Claim',
                'Deadline Calculator',
                'Certified Mail Instructions'
            ]
        },
        {
            id: 'bond-kit-2',
            name: 'Federal Miller Act Bond Claim Kit',
            description: 'Essential documents for making payment bond claims on federal government projects',
            price: 219,
            jurisdiction: 'Federal',
            category: 'federal',
            kit_type: 'bond',
            is_popular: true,
            features: [
                '90-Day Notice Templates',
                'Miller Act Claim Documents',
                'Federal Timeline Tracking',
                'Service Requirements Guide'
            ]
        }
    ];

    const filteredKits = kits.filter(kit => {
        if (filterType !== 'all' && kit.kit_type !== filterType) return false;
        if (filterCategory !== 'all' && kit.category !== filterCategory) return false;
        return true;
    });

    const categories = ['all', ...new Set(kits.map(k => k.category))];

    const handleViewKit = (kitId: string) => {
        navigate(`/kits/${kitId}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Texas Lien & Bond Kits
                        </h1>
                        <p className="text-xl text-slate-600">
                            Attorney-drafted forms and step-by-step guidance for protecting your payment rights
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">Filter by:</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant={filterType === 'all' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                            >
                                All Kits
                            </Button>
                            <Button
                                variant={filterType === 'lien' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilterType('lien')}
                            >
                                Lien Kits
                            </Button>
                            <Button
                                variant={filterType === 'bond' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilterType('bond')}
                            >
                                Bond Kits
                            </Button>
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Kits Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading kits...</p>
                    </div>
                ) : filteredKits.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No kits found</h3>
                        <p className="text-slate-600 mb-6">Try adjusting your filters</p>
                        <Button onClick={() => { setFilterType('all'); setFilterCategory('all'); }}>
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredKits.map(kit => (
                            <Card key={kit.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {kit.is_popular && (
                                                <Badge variant="primary">Popular</Badge>
                                            )}
                                            <Badge variant={kit.kit_type === 'bond' ? 'secondary' : 'default'}>
                                                {kit.kit_type === 'bond' ? 'Bond Kit' : 'Lien Kit'}
                                            </Badge>
                                        </div>
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
                                                <CheckCircle className="h-4 w-4 text-success-600 mt-0.5 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-slate-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleViewKit(kit.id)}
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
                                All forms are reviewed by licensed attorneys to ensure compliance with Texas laws.
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
                                <CheckCircle className="h-8 w-8 text-brand-600" />
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
        </div>
    );
}
