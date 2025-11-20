import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { hasCompletedAssessment } from '@/lib/assessmentCookie';

interface AssessmentCTAProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function AssessmentCTA({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  showIcon = true 
}: AssessmentCTAProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(hasCompletedAssessment());
  }, []);

  if (completed) {
    return (
      <Link to="/assessment">
        <Button variant={variant} size={size} className={className}>
          <CheckCircle className={showIcon ? "mr-2 h-4 w-4" : "hidden"} />
          Review Your Results
          {showIcon && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </Link>
    );
  }

  return (
    <Link to="/assessment">
      <Button variant={variant} size={size} className={className}>
        Start Free Assessment
        {showIcon && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </Link>
  );
}

interface AssessmentLinkProps {
  className?: string;
  children?: React.ReactNode;
}

export function AssessmentLink({ className = '', children }: AssessmentLinkProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(hasCompletedAssessment());
  }, []);

  if (children) {
    return (
      <Link to="/assessment" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/assessment" className={className}>
      {completed ? 'Review Your Results' : 'Start Free Assessment'}
    </Link>
  );
}
