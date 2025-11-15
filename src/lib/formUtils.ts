import { FormField, FormTemplate, FormFieldValue, CommonFields } from '@/types/forms';

/**
 * Validates a form field value against its validation rules
 */
export function validateField(field: FormField, value: FormFieldValue): string | null {
    // Check required fields
    if (field.required && !value) {
        return `${field.label} is required`;
    }

    // Skip validation if field is empty and not required
    if (!value) {
        return null;
    }

    const validation = field.validation;
    if (!validation) {
        return null;
    }

    const stringValue = String(value);
    const numericValue = typeof value === 'number' ? value : parseFloat(stringValue);

    // Min/max length validation
    if (validation.minLength && stringValue.length < validation.minLength) {
        return validation.customMessage || `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && stringValue.length > validation.maxLength) {
        return validation.customMessage || `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    // Min/max value validation
    if (validation.min !== undefined && numericValue < validation.min) {
        return validation.customMessage || `${field.label} must be at least ${validation.min}`;
    }

    if (validation.max !== undefined && numericValue > validation.max) {
        return validation.customMessage || `${field.label} must be no more than ${validation.max}`;
    }

    // Pattern validation
    if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(stringValue)) {
            return validation.customMessage || `${field.label} format is invalid`;
        }
    }

    return null;
}

/**
 * Validates all fields in a form template against the provided values
 */
export function validateForm(
    template: FormTemplate,
    fieldValues: Record<string, FormFieldValue>
): Record<string, string> {
    const errors: Record<string, string> = {};

    template.sections.forEach((section) => {
        section.fields.forEach((field) => {
            const value = fieldValues[field.id];
            const error = validateField(field, value);
            if (error) {
                errors[field.id] = error;
            }
        });
    });

    return errors;
}

/**
 * Autofills a field value from common fields based on the autofill source
 */
export function autofillField(
    field: FormField,
    commonFields: CommonFields
): FormFieldValue | null {
    if (!field.autofill) {
        return null;
    }

    const parts = field.autofill.split('.');
    const [category, fieldName] = parts;

    if (category === 'user' && commonFields.user) {
        return commonFields.user[fieldName as keyof typeof commonFields.user] || null;
    }

    if (category === 'project' && commonFields.project) {
        return commonFields.project[fieldName as keyof typeof commonFields.project] || null;
    }

    return null;
}

/**
 * Autofills all fields in a form template from common fields
 */
export function autofillAllFields(
    template: FormTemplate,
    commonFields: CommonFields
): Record<string, FormFieldValue> {
    const fieldValues: Record<string, FormFieldValue> = {};

    template.sections.forEach((section) => {
        section.fields.forEach((field) => {
            const value = autofillField(field, commonFields);
            if (value !== null) {
                fieldValues[field.id] = value;
            }
        });
    });

    return fieldValues;
}

/**
 * Calculates the completion percentage of a form
 */
export function calculateProgress(
    template: FormTemplate,
    fieldValues: Record<string, FormFieldValue>
): number {
    let totalFields = 0;
    let completedFields = 0;

    template.sections.forEach((section) => {
        section.fields.forEach((field) => {
            if (field.required) {
                totalFields++;
                const value = fieldValues[field.id];
                if (value !== undefined && value !== null && value !== '') {
                    completedFields++;
                }
            }
        });
    });

    if (totalFields === 0) {
        return 0;
    }

    return Math.round((completedFields / totalFields) * 100);
}

/**
 * Checks if a field should be displayed based on conditional logic
 */
export function shouldDisplayField(
    field: FormField,
    fieldValues: Record<string, FormFieldValue>
): boolean {
    if (!field.conditionalDisplay) {
        return true;
    }

    const { field: targetFieldId, operator, value: conditionValue } = field.conditionalDisplay;
    const targetValue = fieldValues[targetFieldId];

    switch (operator) {
        case 'equals':
            return targetValue === conditionValue;
        case 'notEquals':
            return targetValue !== conditionValue;
        case 'contains':
            return String(targetValue).includes(String(conditionValue));
        case 'greaterThan':
            return Number(targetValue) > Number(conditionValue);
        case 'lessThan':
            return Number(targetValue) < Number(conditionValue);
        default:
            return true;
    }
}

/**
 * Formats a field value for display
 */
export function formatFieldValue(field: FormField, value: FormFieldValue): string {
    if (value === null || value === undefined) {
        return '';
    }

    switch (field.type) {
        case 'currency':
            return `$${Number(value).toFixed(2)}`;
        case 'date':
            return new Date(String(value)).toLocaleDateString();
        case 'phone':
            return formatPhoneNumber(String(value));
        case 'checkbox':
            return Array.isArray(value) ? value.join(', ') : String(value);
        default:
            return String(value);
    }
}

/**
 * Formats a phone number
 */
function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

/**
 * Checks if the form is complete (all required fields filled)
 */
export function isFormComplete(
    template: FormTemplate,
    fieldValues: Record<string, FormFieldValue>
): boolean {
    return calculateProgress(template, fieldValues) === 100;
}
