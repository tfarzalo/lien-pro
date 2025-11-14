import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { KitCard } from "@/components/ui/SpecializedCards"
import { Badge } from "@/components/ui/Badge"
import { ArrowRight, CheckCircle, Clock, FileText, Scale, Shield, Star } from "lucide-react"

// Mock data for popular kits
const popularKits = [
  {
    title: "Texas Residential Lien Kit",
    description: "Complete forms and guidance for residential construction projects",
    price: 199,
    features: [
      "Preliminary Notice templates",
      "Mechanics Lien affidavit",
      "Notice to Owner forms",
      "Step-by-step filing guide"
    ],
    popular: true
  },
  {
    title: "Commercial Lien Package",
    description: "Comprehensive toolkit for commercial construction liens",
    price: 299,
    features: [
      "Complex project templates",
      "Multiple party notices",
      "Bond claim forms",
      "Attorney review included"
    ]
  },
  {
    title: "Subcontractor Essentials",
    description: "Essential lien forms specifically for subcontractors",
    price: 149,
    features: [
      "Quick-start templates",
      "Deadline calculator",
      "Preliminary notices",
      "Payment demand letters"
    ]
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "General Contractor",
    company: "Johnson Construction",
    content: "The assessment tool helped me understand exactly what liens I could file. Saved me thousands in attorney fees.",
    rating: 5
  },
  {
    name: "Mike Rodriguez", 
    role: "Subcontractor",
    company: "Rodriguez Electric",
    content: "Finally, a tool that makes Texas lien law understandable. The step-by-step guidance is invaluable.",
    rating: 5
  }
]

function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <Badge variant="primary" className="mb-6">
            Trusted by 1,000+ Texas Contractors
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Protect Your Payment Rights with
            <span className="text-brand-600 block">Texas Lien Law</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Take our free assessment to discover what liens you can file, then get the professional 
            forms and guidance you need to secure payment for your construction work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              Browse Lien Kits
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-slate-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
              No upfront cost
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-success-600 mr-2" />
              Attorney-drafted forms
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-success-600 mr-2" />
              Complete in 10 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      icon: FileText,
      title: "Take the Assessment",
      description: "Answer questions about your project, contract, and timeline to understand your lien rights."
    },
    {
      icon: Scale,
      title: "Get Your Results",
      description: "Receive a detailed analysis of what liens you can file and key deadlines to remember."
    },
    {
      icon: Shield,
      title: "Purchase Your Kit", 
      description: "Buy the professional forms and step-by-step guidance needed to protect your payment."
    }
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our simple 3-step process helps you understand and exercise your lien rights under Texas law.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} variant="elevated" className="text-center">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function PopularKitsSection() {
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Popular Lien Kits
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Attorney-drafted forms and comprehensive guidance for Texas construction liens.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularKits.map((kit, index) => (
            <KitCard
              key={index}
              title={kit.title}
              description={kit.description}
              price={kit.price}
              features={kit.features}
              popular={kit.popular}
              onSelect={() => console.log('Select kit:', kit.title)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TestimonialsSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            What Contractors Are Saying
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function CTASection() {
  return (
    <div className="bg-brand-600 py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Protect Your Payment Rights?
        </h2>
        <p className="text-xl text-brand-100 mb-8">
          Take our free assessment and discover what liens you can file on your Texas construction project.
        </p>
        <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
          Start Free Assessment
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-brand-600 mr-2" />
              <span className="text-xl font-bold text-slate-900">Lien Professor</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#assessment" className="text-slate-600 hover:text-slate-900">Assessment</a>
              <a href="#kits" className="text-slate-600 hover:text-slate-900">Lien Kits</a>
              <a href="#about" className="text-slate-600 hover:text-slate-900">About</a>
              <Button variant="secondary">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Sections */}
      <HeroSection />
      <HowItWorksSection />
      <PopularKitsSection />
      <TestimonialsSection />
      <CTASection />
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Scale className="h-6 w-6 text-brand-400 mr-2" />
              <span className="text-lg font-semibold text-white">Lien Professor</span>
            </div>
            <p className="text-slate-400">
              © 2025 Lovein Ribman P.C. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
