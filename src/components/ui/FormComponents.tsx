import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-medium text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}

export function FormField({ 
  label, 
  required, 
  error, 
  helpText, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-sm text-slate-500">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps?: string[]
  className?: string
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  steps, 
  className 
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
        <div 
          className="bg-brand-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      {steps && (
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center text-xs",
                index < currentStep ? "text-brand-600" : "text-slate-400"
              )}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs",
                  index < currentStep 
                    ? "bg-brand-600 text-white" 
                    : index === currentStep - 1
                    ? "bg-brand-100 text-brand-600 border-2 border-brand-600"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {index + 1}
              </div>
              <span className="hidden sm:inline">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
