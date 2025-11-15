import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormRunner } from '@/components/forms/FormRunner';
import { useGeneratePDF, useSaveFormResponse } from '@/hooks/usePDFGeneration';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { FormTemplate, FormFieldValue, CommonFields } from '@/types/forms';
import { supabase } from '@/lib/supabaseClient';

/**
 * Example page showing how to use FormRunner with PDF generation
 * Route: /projects/:projectId/forms/:formId
 */
export default function FormCompletionPage() {
    const { projectId, formId } = useParams<{ projectId: string; formId: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [formResponseId, setFormResponseId] = useState<string | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<Record<string, FormFieldValue>>({});
    const [commonFields, setCommonFields] = useState<CommonFields | undefined>(undefined);
    const [userId, setUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const generatePDFMutation = useGeneratePDF();
    const saveFormMutation = useSaveFormResponse();

    // Load form template and existing response
    useEffect(() => {
        async function loadFormData() {
            try {
                setIsLoading(true);

                // Get current user
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/auth');
                    return;
                }
                setUserId(user.id);

                // Load form template
                const { data: form, error: formError } = await supabase
                    .from('forms')
                    .select('*')
                    .eq('id', formId)
                    .single();

                if (formError || !form) {
                    console.error('Form not found:', formError);
                    return;
                }

                // Parse the template from the form
                const formTemplate: FormTemplate = {
                    id: form.id,
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                    category: form.category || 'General',
                    jurisdiction: form.jurisdiction || 'California',
                    version: form.version || '1.0',
                    sections: form.sections as any,
                    instructions: form.instructions,
                    pdfTemplate: form.pdf_template_url,
                    isActive: form.is_active,
                    requiredForKitIds: form.required_for_kit_ids || [],
                    createdAt: form.created_at,
                    updatedAt: form.updated_at,
                };

                setTemplate(formTemplate);

                // Load existing form response if it exists
                const { data: existingResponse } = await supabase
                    .from('form_responses')
                    .select('*')
                    .eq('form_id', formId)
                    .eq('project_id', projectId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (existingResponse) {
                    setFormResponseId(existingResponse.id);
                    setInitialValues(existingResponse.field_values as Record<string, FormFieldValue>);
                    setPdfUrl(existingResponse.generated_pdf_url);
                }

                // Load common fields for autofill
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                const { data: project } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (profile && project) {
                    setCommonFields({
                        user: {
                            name: profile.full_name || '',
                            email: user.email || '',
                            phone: profile.phone || '',
                            company: profile.company_name || '',
                            licenseNumber: profile.license_number || '',
                        },
                        project: {
                            name: project.project_name || '',
                            address: project.property_address || '',
                            ownerName: project.owner_name || '',
                            ownerAddress: project.owner_address || '',
                            propertyAddress: project.property_address || '',
                            startDate: project.start_date || '',
                            completionDate: project.completion_date || '',
                        },
                    });
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (formId && projectId) {
            loadFormData();
        }
    }, [formId, projectId, navigate]);

    // Handle form save
    const handleSave = async (values: Record<string, FormFieldValue>) => {
        if (!template || !userId || !projectId) return;

        try {
            const response = await saveFormMutation.mutateAsync({
                formResponseId,
                data: {
                    userId,
                    projectId,
                    formId: template.id,
                    formName: template.name,
                    fieldValues: values,
                    status: 'draft',
                },
            });

            // Update formResponseId if this is a new response
            if (!formResponseId && response.id) {
                setFormResponseId(response.id);
            }
        } catch (error) {
            console.error('Error saving form:', error);
        }
    };

    // Handle PDF generation
    const handleGeneratePDF = async () => {
        if (!formResponseId) {
            alert('Please save the form first');
            return;
        }

        try {
            const result = await generatePDFMutation.mutateAsync(formResponseId);

            if (result.success && result.pdfUrl) {
                setPdfUrl(result.pdfUrl);
                alert('PDF generated successfully!');
            } else {
                alert(result.error || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Handle form completion
    const handleComplete = () => {
        alert('Form completed! You can now generate the PDF.');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading form...</p>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert variant="danger">
                    <AlertDescription>Form not found</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Project
                    </Button>

                    {pdfUrl && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                PDF has been generated!{' '}
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium underline"
                                >
                                    Download PDF
                                </a>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Form Runner */}
                <FormRunner
                    template={template}
                    projectId={projectId!}
                    userId={userId}
                    existingResponseId={formResponseId}
                    initialValues={initialValues}
                    commonFields={commonFields}
                    onSave={handleSave}
                    onGeneratePDF={handleGeneratePDF}
                    onComplete={handleComplete}
                    autoSave={true}
                    autoSaveDelay={2000}
                />

                {/* Additional Actions */}
                {pdfUrl && (
                    <div className="mt-6 flex justify-center">
                        <Button
                            size="lg"
                            onClick={() => window.open(pdfUrl, '_blank')}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Your PDF
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
