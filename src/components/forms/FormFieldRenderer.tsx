import React from 'react';
import { FormField } from '@/types/forms';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';

interface FormFieldRendererProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
    field,
    value,
    onChange,
    error,
}) => {
    const renderField = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'number':
                return (
                    <Input
                        id={field.id}
                        name={field.id}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'tel'}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={error ? 'border-red-500' : ''}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        id={field.id}
                        name={field.id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : ''}`}
                    />
                );

            case 'select':
                return (
                    <select
                        id={field.id}
                        name={field.id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : ''}`}
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`${field.id}-${option.value}`}
                                    name={field.id}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => onChange(e.target.value)}
                                    required={field.required}
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor={`${field.id}-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => {
                            const values = Array.isArray(value) ? value : [];
                            return (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`${field.id}-${option.value}`}
                                        name={field.id}
                                        value={option.value}
                                        checked={values.includes(option.value)}
                                        onChange={(e) => {
                                            const newValues = e.target.checked
                                                ? [...values, option.value]
                                                : values.filter((v) => v !== option.value);
                                            onChange(newValues);
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor={`${field.id}-${option.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                );

            case 'date':
                return (
                    <Input
                        id={field.id}
                        name={field.id}
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className={error ? 'border-red-500' : ''}
                    />
                );

            case 'signature':
                return (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <p className="text-sm text-gray-500">
                            Signature field - Implementation coming soon
                        </p>
                        <Input
                            id={field.id}
                            name={field.id}
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Type your name to sign"
                            required={field.required}
                            className={`mt-2 ${error ? 'border-red-500' : ''}`}
                        />
                    </div>
                );

            default:
                return (
                    <Input
                        id={field.id}
                        name={field.id}
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={error ? 'border-red-500' : ''}
                    />
                );
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {renderField()}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};
