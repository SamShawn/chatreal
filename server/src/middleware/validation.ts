import { Request, Response, NextFunction } from 'express';

// Validation error interface
interface ValidationError {
  field: string;
  message: string;
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Generic validation helper
export const validate = (
  schema: Record<string, { required?: boolean; pattern?: RegExp; minLength?: number; maxLength?: number }>,
  data: Record<string, unknown>
): ValidationResult => {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    // Skip other checks if empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Type check for strings
    if (typeof value !== 'string') {
      errors.push({ field, message: `${field} must be a string` });
      continue;
    }

    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, message: `${field} has invalid format` });
    }
  }

  return { valid: errors.length === 0, errors };
};

// Pre-built validation schemas
export const schemas = {
  register: {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    username: { required: true, minLength: 2, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
    password: { required: true, minLength: 6, maxLength: 100 },
  },
  login: {
    email: { required: true },
    password: { required: true },
  },
  message: {
    content: { required: true, maxLength: 10000 },
    conversationId: { required: false },
    channelId: { required: false },
  },
  channel: {
    name: { required: true, minLength: 1, maxLength: 100, pattern: /^[a-zA-Z0-9_-]+$/ },
    description: { required: false, maxLength: 500 },
    type: { required: false },
  },
};

// Validation middleware factory
export const validateBody = (schemaName: keyof typeof schemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validate(schemas[schemaName], req.body);

    if (!result.valid) {
      res.status(400).json({
        success: false,
        errors: result.errors,
      });
      return;
    }

    next();
  };
};
