import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { ProgressIndicator } from "@/components/ui/FormComponents"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"

// Mock assessment data
const assessmentSteps = [
  "Project Details",
  "Contract Info", 
  "Timeline",
  "Payment Status",
  "Results"
]

interface AssessmentQuestion {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'text' | 'date'
  options?: string[]
  helpText?: string
  required?: boolean
}

const sampleQuestions: AssessmentQuestion[] = [
  {
    id: 'project_type',
    question: 'What type of construction project is this?',
    type: 'radio',
    options: [
      'Residential (single-family home)',
      'Residential (multi-family/apartment)',
      'Commercial building',
      'Industrial facility',
      'Public/government project',
      'Other'
    ],
    helpText: 'The project type affects which lien laws apply and filing requirements.',
    required: true
  },
  {
    id: 'contract_party',
    question: 'Who did you contract with directly?',
    type: 'radio', 
    options: [
      'Property owner',
      'General contractor',
      'Another subcontractor',
      'Property management company',
      'Not sure'
    ],
    helpText: 'Your relationship to the property owner determines your lien rights.',
    required: true
  },
  {
    id: 'work_start_date',
    question: 'When did you first start work or deliver materials?',
    type: 'date',
    helpText: 'This date starts many important deadlines under Texas lien law.',
    required: true
  }
]

export function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showHelp, setShowHelp] = useState(false)

  const currentQuestion = sampleQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === sampleQuestions.length - 1
  const canProceed = currentQuestion?.required ? answers[currentQuestion.id] : true

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Go to results
      setCurrentStep(5)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const renderQuestion = (question: AssessmentQuestion) => {
    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
          />
        )
      
      default:
        return null
    }
  }

  if (currentStep === 5) {
    // Results page
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="text-center">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="h-20 w-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-10 w-10 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  Your Lien Assessment Results
                </h1>
                <p className="text-xl text-slate-600">
                  Based on your answers, here's what we found about your lien rights.
                </p>
              </div>

              <div className="bg-brand-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-brand-900 mb-3">You Can File These Liens:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-brand-800">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mechanics and Materialmen's Lien
                  </li>
                  <li className="flex items-center text-brand-800">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Preliminary Notice (recommended)
                  </li>
                </ul>
              </div>

              <Alert variant="warning" className="mb-8 text-left">
                <AlertDescription>
                  <strong>Important:</strong> You have 65 days from your last work date to file your mechanics lien. 
                  Don't wait - deadlines are strict in Texas!
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Get Your Lien Kit - $199
                </Button>
                <Button variant="secondary" size="lg">
                  Download Free Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Texas Lien Assessment</h1>
            <Button variant="ghost" onClick={() => setShowHelp(!showHelp)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={5}
            steps={assessmentSteps}
          />
        </div>

        {/* Help Alert */}
        {showHelp && (
          <Alert className="mb-6" dismissible onDismiss={() => setShowHelp(false)}>
            <AlertDescription>
              This assessment will analyze your specific situation to determine what lien rights you have 
              under Texas law. All information is confidential and used only to provide your personalized results.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                {currentQuestion?.question}
              </h2>
              {currentQuestion?.helpText && (
                <p className="text-slate-600 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <HelpCircle className="h-4 w-4 inline mr-2" />
                  {currentQuestion.helpText}
                </p>
              )}
            </div>
            
            {currentQuestion && renderQuestion(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLastQuestion ? 'Get Results' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Question Progress */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </div>
      </div>
    </div>
  )
}
