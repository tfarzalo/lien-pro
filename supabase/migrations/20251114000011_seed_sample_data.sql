-- =====================================================
-- Migration: Seed Sample Data
-- Description: Initial data for development and testing
-- =====================================================

-- Insert sample lien kits
INSERT INTO lien_kits (name, slug, description, long_description, price_cents, category, is_active, is_popular, features, includes_attorney_review, sort_order) VALUES
(
    'Texas Residential Lien Kit',
    'texas-residential-lien-kit',
    'Complete forms and guidance for residential construction projects',
    'This comprehensive kit includes all the forms and step-by-step guidance needed to file a mechanics lien on a residential construction project in Texas. Perfect for contractors, subcontractors, and suppliers working on single-family homes.',
    19900,
    'residential',
    true,
    true,
    '["Preliminary Notice templates", "Mechanics Lien affidavit", "Notice to Owner forms", "Step-by-step filing guide", "Deadline calculator", "County-specific requirements"]'::jsonb,
    false,
    1
),
(
    'Commercial Lien Package',
    'commercial-lien-package',
    'Comprehensive toolkit for commercial construction liens',
    'Designed for larger commercial construction projects, this package includes advanced forms for complex projects, multiple party notices, and bond claim procedures. Includes attorney review of your completed forms.',
    29900,
    'commercial',
    true,
    true,
    '["Complex project templates", "Multiple party notices", "Bond claim forms", "Attorney review included", "Lien release templates", "Payment demand letters"]'::jsonb,
    true,
    2
),
(
    'Subcontractor Essentials',
    'subcontractor-essentials',
    'Essential lien forms specifically for subcontractors',
    'Streamlined package designed specifically for subcontractors. Quick-start templates help you protect your payment rights without the complexity of full packages.',
    14900,
    'subcontractor',
    true,
    true,
    '["Quick-start templates", "Deadline calculator", "Preliminary notices", "Payment demand letters", "Lien waiver forms"]'::jsonb,
    false,
    3
),
(
    'Texas Lien Release Kit',
    'texas-lien-release-kit',
    'Forms for releasing and settling liens',
    'Everything you need to properly release a lien once payment has been received, including conditional and unconditional release forms for partial and final payments.',
    9900,
    'specialty',
    true,
    false,
    '["Conditional lien releases", "Unconditional lien releases", "Partial payment releases", "Final payment releases", "Notarization guidance"]'::jsonb,
    false,
    4
),
(
    'Bond Claim Specialist Package',
    'bond-claim-specialist-package',
    'Advanced package for filing bond claims on public projects',
    'Specialized forms and guidance for filing bond claims on projects with payment bonds. Includes Miller Act and Little Miller Act claim procedures.',
    24900,
    'specialty',
    true,
    false,
    '["Bond claim notices", "Miller Act procedures", "Little Miller Act forms", "Federal project guidance", "State project guidance", "Attorney consultation"]'::jsonb,
    true,
    5
),
(
    'Complete Lien Pro Suite',
    'complete-lien-pro-suite',
    'All-inclusive package for construction professionals',
    'Our most comprehensive offering includes every form and template we offer, unlimited assessments, priority attorney support, and access to our legal hotline.',
    49900,
    'commercial',
    true,
    true,
    '["All form templates", "Unlimited assessments", "Priority attorney support", "Legal hotline access", "Document review service", "Quarterly law updates", "Custom form creation"]'::jsonb,
    true,
    6
);

-- Insert sample form templates
INSERT INTO forms (name, slug, description, category, jurisdiction, version, field_definitions, instructions, is_active) VALUES
(
    'Texas Preliminary Notice (Original Contractor)',
    'tx-preliminary-notice-original',
    'Preliminary notice form for original contractors under Texas Property Code §53.056',
    'preliminary_notice',
    'texas',
    '1.0',
    '{
        "fields": [
            {"id": "property_owner_name", "label": "Property Owner Name", "type": "text", "required": true},
            {"id": "property_address", "label": "Property Address", "type": "address", "required": true},
            {"id": "contractor_name", "label": "Your Company Name", "type": "text", "required": true},
            {"id": "contractor_address", "label": "Your Business Address", "type": "address", "required": true},
            {"id": "contract_date", "label": "Contract Date", "type": "date", "required": true},
            {"id": "contract_amount", "label": "Contract Amount", "type": "currency", "required": true},
            {"id": "work_description", "label": "Description of Work", "type": "textarea", "required": true},
            {"id": "first_delivery_date", "label": "Date of First Delivery/Work", "type": "date", "required": true}
        ]
    }'::jsonb,
    'This preliminary notice should be sent to the property owner within 15 days of first delivering materials or performing work. Send via certified mail with return receipt requested.',
    true
),
(
    'Texas Affidavit Claiming Lien',
    'tx-affidavit-claiming-lien',
    'Sworn affidavit to file a mechanics lien under Texas Property Code Chapter 53',
    'affidavit',
    'texas',
    '1.0',
    '{
        "fields": [
            {"id": "claimant_name", "label": "Claimant Name", "type": "text", "required": true},
            {"id": "claimant_address", "label": "Claimant Address", "type": "address", "required": true},
            {"id": "property_owner_name", "label": "Property Owner Name", "type": "text", "required": true},
            {"id": "property_address", "label": "Property Address", "type": "address", "required": true},
            {"id": "amount_claimed", "label": "Amount Claimed", "type": "currency", "required": true},
            {"id": "work_description", "label": "Description of Labor/Materials", "type": "textarea", "required": true},
            {"id": "last_delivery_date", "label": "Date of Last Delivery/Work", "type": "date", "required": true},
            {"id": "contract_party", "label": "Party You Contracted With", "type": "text", "required": true}
        ]
    }'::jsonb,
    'This affidavit must be filed with the county clerk where the property is located no later than the 15th day of the 4th month after the month in which the work was completed or materials were last delivered. Must be notarized.',
    true
),
(
    'Texas Conditional Lien Waiver (Progress Payment)',
    'tx-conditional-waiver-progress',
    'Conditional waiver of lien rights for progress payments',
    'release',
    'texas',
    '1.0',
    '{
        "fields": [
            {"id": "contractor_name", "label": "Contractor/Claimant Name", "type": "text", "required": true},
            {"id": "project_name", "label": "Project Name", "type": "text", "required": true},
            {"id": "property_address", "label": "Property Address", "type": "address", "required": true},
            {"id": "owner_name", "label": "Owner Name", "type": "text", "required": true},
            {"id": "payment_amount", "label": "Payment Amount", "type": "currency", "required": true},
            {"id": "payment_through_date", "label": "Payment Through Date", "type": "date", "required": true},
            {"id": "check_number", "label": "Check/Payment Reference Number", "type": "text", "required": false}
        ]
    }'::jsonb,
    'Use this form for progress payments. This waiver becomes effective only upon receipt and clearance of the payment specified. Sign and exchange for payment.',
    true
);

-- Note: In production, you would NOT insert sample users here
-- Users are created through Supabase Auth
-- This is just for reference on how data would be structured

COMMENT ON TABLE lien_kits IS 'Product catalog for purchasable lien form packages';
COMMENT ON TABLE forms IS 'Form templates used across different lien kits';
COMMENT ON TABLE profiles IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE projects IS 'User construction projects/cases';
COMMENT ON TABLE orders IS 'Customer purchase orders';
COMMENT ON TABLE order_items IS 'Line items for orders';
COMMENT ON TABLE user_kits IS 'Tracks which users have access to which kits';
COMMENT ON TABLE assessments IS 'Lien eligibility assessment sessions';
COMMENT ON TABLE assessment_answers IS 'Individual answers within assessments';
COMMENT ON TABLE form_responses IS 'User-filled form instances';
COMMENT ON TABLE deadlines IS 'Critical dates and reminders for projects';
COMMENT ON TABLE uploads IS 'Document and file uploads';
COMMENT ON TABLE attorney_notes IS 'Internal attorney notes on projects';
COMMENT ON TABLE case_status_updates IS 'Timeline of project status changes';
