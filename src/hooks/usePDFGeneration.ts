import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface PDFGenerationRequest {
    formResponseId: string;
}

export interface PDFGenerationResult {
    success: boolean;
    pdfUrl?: string;
    message?: string;
    error?: string;
}

/**
 * Calls the Supabase Edge Function to generate a PDF from a form response
 */
export async function generatePDF(
    formResponseId: string
): Promise<PDFGenerationResult> {
    try {
        // Get the current session
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('Not authenticated');
        }

        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('generate-pdf', {
            body: { formResponseId },
        });

        if (error) {
            throw error;
        }

        return data as PDFGenerationResult;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
}

/**
 * React Query hook for PDF generation
 */
export function useGeneratePDF() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: generatePDF,
        onSuccess: (_data, formResponseId) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['formResponses'] });
            queryClient.invalidateQueries({
                queryKey: ['formResponse', formResponseId],
            });
            queryClient.invalidateQueries({ queryKey: ['projectDocuments'] });
            queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
        },
    });
}

/**
 * Alternative: Direct API call for PDF generation without React Query
 */
export async function generatePDFDirect(
    formResponseId: string
): Promise<PDFGenerationResult> {
    return generatePDF(formResponseId);
}

/**
 * Save form response data
 */
export async function saveFormResponse(
    formResponseId: string | undefined,
    data: {
        userId: string;
        projectId: string;
        formId: string;
        formName: string;
        fieldValues: Record<string, any>;
        status: 'draft' | 'completed' | 'submitted' | 'filed';
    }
) {
    try {
        if (formResponseId) {
            // Update existing response
            const { data: response, error } = await supabase
                .from('form_responses')
                .update({
                    field_values: data.fieldValues,
                    status: data.status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', formResponseId)
                .select()
                .single();

            if (error) throw error;
            return response;
        } else {
            // Create new response
            const { data: response, error } = await supabase
                .from('form_responses')
                .insert({
                    user_id: data.userId,
                    project_id: data.projectId,
                    form_id: data.formId,
                    form_name: data.formName,
                    field_values: data.fieldValues,
                    status: data.status,
                })
                .select()
                .single();

            if (error) throw error;
            return response;
        }
    } catch (error) {
        console.error('Error saving form response:', error);
        throw error;
    }
}

/**
 * React Query hook for saving form responses
 */
export function useSaveFormResponse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            formResponseId,
            data,
        }: {
            formResponseId?: string;
            data: Parameters<typeof saveFormResponse>[1];
        }) => saveFormResponse(formResponseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['formResponses'] });
        },
    });
}
