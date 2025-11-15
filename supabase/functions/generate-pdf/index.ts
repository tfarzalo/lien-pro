// =====================================================
// Supabase Edge Function: generate-pdf
// =====================================================
// Deploy this with: supabase functions deploy generate-pdf
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFGenerationRequest {
    formResponseId: string
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Get the user
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Parse request body
        const { formResponseId }: PDFGenerationRequest = await req.json()

        if (!formResponseId) {
            throw new Error('formResponseId is required')
        }

        // =====================================================
        // 1. Fetch form response data
        // =====================================================
        const { data: formResponse, error: responseError } = await supabaseClient
            .from('form_responses')
            .select('*, forms(*)')
            .eq('id', formResponseId)
            .eq('user_id', user.id)
            .single()

        if (responseError || !formResponse) {
            throw new Error('Form response not found')
        }

        // =====================================================
        // 2. Fetch PDF template
        // =====================================================
        const { data: pdfTemplate, error: templateError } = await supabaseClient
            .from('pdf_templates')
            .select('*')
            .eq('form_id', formResponse.form_id)
            .single()

        if (templateError || !pdfTemplate) {
            throw new Error('PDF template not found for this form')
        }

        // =====================================================
        // 3. Download the PDF template from Storage
        // =====================================================
        const { data: templateBlob, error: downloadError } = await supabaseClient.storage
            .from('pdf-templates')
            .download(pdfTemplate.template_url)

        if (downloadError || !templateBlob) {
            throw new Error('Failed to download PDF template')
        }

        // =====================================================
        // 4. Fill PDF template with form data
        // =====================================================
        // This is where you would use a PDF library like pdf-lib
        // to fill in the form fields with the user's data

        // Import pdf-lib (you'll need to add this to your edge function imports)
        // For now, this is a placeholder showing the concept

        const fieldValues = formResponse.field_values as Record<string, any>
        const fieldMappings = pdfTemplate.field_mappings as Record<string, string>

        // Example using pdf-lib:
        // import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.17.1'
        // const pdfDoc = await PDFDocument.load(await templateBlob.arrayBuffer())
        // const form = pdfDoc.getForm()

        // for (const [fieldId, pdfFieldName] of Object.entries(fieldMappings)) {
        //   const value = fieldValues[fieldId]
        //   if (value !== undefined && value !== null) {
        //     try {
        //       const field = form.getTextField(pdfFieldName)
        //       field.setText(String(value))
        //     } catch (error) {
        //       console.warn(`Field ${pdfFieldName} not found in PDF`)
        //     }
        //   }
        // }

        // const pdfBytes = await pdfDoc.save()

        // For this example, we'll use a placeholder
        const pdfBytes = await templateBlob.arrayBuffer()

        // =====================================================
        // 5. Upload filled PDF to Storage
        // =====================================================
        const fileName = `${user.id}/${formResponseId}_${Date.now()}.pdf`

        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('generated-pdfs')
            .upload(fileName, pdfBytes, {
                contentType: 'application/pdf',
                upsert: false,
            })

        if (uploadError) {
            throw new Error(`Failed to upload PDF: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('generated-pdfs')
            .getPublicUrl(fileName)

        const pdfUrl = urlData.publicUrl

        // =====================================================
        // 6. Update form response with PDF URL
        // =====================================================
        const { error: updateError } = await supabaseClient
            .from('form_responses')
            .update({
                generated_pdf_url: pdfUrl,
                pdf_generated_at: new Date().toISOString(),
                pdf_generation_status: 'completed',
            })
            .eq('id', formResponseId)

        if (updateError) {
            throw new Error(`Failed to update form response: ${updateError.message}`)
        }

        // =====================================================
        // 7. Update PDF generation job
        // =====================================================
        await supabaseClient
            .from('pdf_generation_jobs')
            .update({
                status: 'completed',
                pdf_url: pdfUrl,
                completed_at: new Date().toISOString(),
            })
            .eq('form_response_id', formResponseId)
            .eq('status', 'processing')

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                pdfUrl,
                message: 'PDF generated successfully',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('PDF Generation Error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
