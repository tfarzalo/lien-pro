import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight, Home, Building2, AlertTriangle, CheckCircle, XCircle, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ResidentialVsCommercialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-2">
              <Home className="h-8 w-8" />
              <Building2 className="h-8 w-8" />
            </div>
            <Badge variant="secondary" className="text-brand-700">
              Property Types
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Residential vs. Commercial Property Liens
          </h1>
          <p className="text-xl text-brand-100 max-w-3xl">
            Understanding the critical differences between residential homestead and commercial property 
            lien requirements in Texas - getting this wrong can cost you your lien rights.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Quick Decision Tool */}
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-brand-600" />
              Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              Whether a property is classified as "residential" or "commercial" determines:
            </p>
            <ul className="space-y-2">
              {[
                'Which preliminary notice form you must use',
                'Your lien filing deadlines',
                'Whether constitutional or statutory lien rules apply',
                'The level of protection available',
              ].map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Definition Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            How Texas Defines Each Property Type
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Residential */}
            <Card className="border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Home className="h-6 w-6 text-blue-600" />
                  Residential Property
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="font-semibold text-slate-900">
                  A property is "residential" if ALL of the following are true:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Designed for Residential Use',
                      description: 'The property must be designed or adapted for use as a residence (home, apartment, condo).'
                    },
                    {
                      title: 'Owned by Natural Person',
                      description: 'Must be owned by an individual person, not a corporation, LLC, trust, or other entity.'
                    },
                    {
                      title: 'Family Size Limit',
                      description: 'Designed for occupancy by not more than four families (e.g., single-family home, duplex, triplex, or fourplex).'
                    },
                  ].map((criterion, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{criterion.title}</h4>
                      <p className="text-slate-600 text-sm mt-1">{criterion.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded p-3 mt-4">
                  <p className="text-sm text-blue-900">
                    <strong>Key Point:</strong> Even one failure of these tests means the property 
                    is commercial for lien purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card className="border-purple-300">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  Commercial Property
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="font-semibold text-slate-900">
                  A property is "commercial" if ANY of the following apply:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Business/Investment Property',
                      description: 'Office buildings, retail stores, warehouses, industrial facilities, etc.'
                    },
                    {
                      title: 'Entity-Owned Residential',
                      description: 'Residential property owned by a corporation, LLC, partnership, or trust.'
                    },
                    {
                      title: 'Large Multi-Family',
                      description: 'Apartment complexes with more than 4 units (even if individually owned condos).'
                    },
                    {
                      title: 'Investment/Rental Property',
                      description: 'Residential property owned by an individual but not used as their primary residence.'
                    },
                  ].map((criterion, index) => (
                    <div key={index} className="border-l-4 border-purple-400 pl-4 py-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{criterion.title}</h4>
                      <p className="text-slate-600 text-sm mt-1">{criterion.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 rounded p-3 mt-4">
                  <p className="text-sm text-purple-900">
                    <strong>Key Point:</strong> "Commercial" is the default. When in doubt, 
                    treat it as commercial for safer compliance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real-World Examples
          </h2>

          <div className="space-y-4">
            {/* Residential Examples */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Residential (Homestead) Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Single-family home owned by John Smith (individual) and used as his primary residence',
                    'Duplex owned by Jane Doe (individual) who lives in one unit',
                    'Townhouse owned by married couple in their individual names',
                    'Small fourplex owned by an individual (not through an LLC)',
                  ].map((example, index) => (
                    <li key={index} className="flex gap-3 items-start text-slate-700">
                      <Home className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Commercial Examples */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Building2 className="h-6 w-6 text-orange-600" />
                  Commercial Property Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Office building, retail store, or warehouse',
                    'Apartment complex with 20 units',
                    'Single-family rental home owned by "Smith Properties, LLC"',
                    'House owned by individual but being renovated for resale (investment)',
                    'Any property owned by a corporation, LLC, partnership, or trust',
                    'Hotel, restaurant, or other commercial facility',
                  ].map((example, index) => (
                    <li key={index} className="flex gap-3 items-start text-slate-700">
                      <Building2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Differences Table */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Critical Differences in Requirements
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Requirement</th>
                  <th className="border border-slate-300 px-4 py-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      Residential
                    </div>
                  </th>
                  <th className="border border-slate-300 px-4 py-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Commercial
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    requirement: 'Preliminary Notice Deadline',
                    residential: '15th day of 2nd month (same)',
                    commercial: '15th day of 2nd month',
                  },
                  {
                    requirement: 'Lien Filing Deadline',
                    residential: '15th day of 3rd month after last work',
                    commercial: '15th day of 4th month after last work',
                    highlight: true
                  },
                  {
                    requirement: 'Notice Form',
                    residential: 'Specific statutory form with consumer warnings',
                    commercial: 'Standard preliminary notice',
                    highlight: true
                  },
                  {
                    requirement: 'Constitutional Lien Available?',
                    residential: 'Yes (if contracted with owner)',
                    commercial: 'No',
                  },
                  {
                    requirement: 'Affidavit of Lien Form',
                    residential: 'Must include constitutional lien language',
                    commercial: 'Standard statutory form',
                  },
                  {
                    requirement: 'Retainage Notice',
                    residential: 'Generally not applicable',
                    commercial: '30 days before filing if claiming retainage',
                  },
                ].map((row, index) => (
                  <tr key={index} className={row.highlight ? 'bg-yellow-50' : ''}>
                    <td className="border border-slate-300 px-4 py-3 font-medium">{row.requirement}</td>
                    <td className="border border-slate-300 px-4 py-3">{row.residential}</td>
                    <td className="border border-slate-300 px-4 py-3">{row.commercial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Most Critical Difference:</strong> Residential properties have a 
              shorter lien filing deadline (3rd month vs. 4th month) and require different notice forms.
            </p>
          </div>
        </section>

        {/* Common Mistakes */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Common Classification Mistakes
          </h2>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <XCircle className="h-6 w-6 text-red-600" />
                Mistakes That Cost Lien Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    mistake: 'Assuming Single-Family = Residential',
                    reality: 'If owned by an LLC, it\'s commercial even if it\'s a single-family home.'
                  },
                  {
                    mistake: 'Using Commercial Rules for Homestead',
                    reality: 'If you file late using the 4th month deadline on a residential property, your lien is invalid.'
                  },
                  {
                    mistake: 'Ignoring Constitutional Lien',
                    reality: 'For residential properties where you contracted with the owner, you MUST file a constitutional lien affidavit or lose those rights.'
                  },
                  {
                    mistake: 'Wrong Notice Form',
                    reality: 'Using a commercial preliminary notice on a residential project may invalidate your lien rights.'
                  },
                ].map((item, index) => (
                  <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                    <h4 className="font-semibold text-red-900 text-sm mb-1">
                      ❌ {item.mistake}
                    </h4>
                    <p className="text-red-800 text-sm">
                      <strong>Reality:</strong> {item.reality}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* When Unsure */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            When You're Not Sure
          </h2>

          <Card className="border-brand-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-brand-600" />
                Best Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you're uncertain whether a property is residential or commercial, here's the safest approach:
              </p>

              <ol className="space-y-3">
                {[
                  {
                    step: 'Ask the Owner or GC',
                    description: 'Directly inquire about the ownership structure and use of the property.'
                  },
                  {
                    step: 'Check Property Records',
                    description: 'County appraisal district records show ownership and property classification.'
                  },
                  {
                    step: 'Default to Residential Rules if Homestead',
                    description: 'If it\'s someone\'s home and owned individually, use residential rules (shorter deadline, special forms).'
                  },
                  {
                    step: 'Use Commercial Rules for Everything Else',
                    description: 'When in doubt, commercial rules provide more time and are safer if you guess wrong.'
                  },
                ].map((item, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.step}</h4>
                      <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="bg-brand-50 rounded p-4 mt-4">
                <p className="text-sm text-brand-900">
                  <strong>💡 Pro Tip:</strong> For residential projects, always comply with BOTH 
                  constitutional and statutory lien requirements to maximize your protection.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Let Us Determine Your Property Type
            </h3>
            <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
              Our assessment will ask the right questions to classify your property correctly 
              and provide the appropriate forms, deadlines, and requirements for your specific situation.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/assessment" className="inline-flex items-center gap-2">
                Start Your Assessment
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/learn/preliminary-notice">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Pre-Lien Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Learn about preliminary notice requirements.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/learn/deadlines">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Critical Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Understand all lien filing deadlines.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/learn/residential-liens">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Residential Liens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Deep dive into homestead lien rules.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
