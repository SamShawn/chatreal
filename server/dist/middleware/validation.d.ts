import { Request, Response, NextFunction } from 'express';
interface ValidationError {
    field: string;
    message: string;
}
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export declare const validate: (schema: Record<string, {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
}>, data: Record<string, unknown>) => ValidationResult;
export declare const schemas: {
    register: {
        email: {
            required: boolean;
            pattern: RegExp;
        };
        username: {
            required: boolean;
            minLength: number;
            maxLength: number;
            pattern: RegExp;
        };
        password: {
            required: boolean;
            minLength: number;
            maxLength: number;
        };
    };
    login: {
        email: {
            required: boolean;
        };
        password: {
            required: boolean;
        };
    };
    message: {
        content: {
            required: boolean;
            maxLength: number;
        };
        conversationId: {
            required: boolean;
        };
        channelId: {
            required: boolean;
        };
    };
    channel: {
        name: {
            required: boolean;
            minLength: number;
            maxLength: number;
            pattern: RegExp;
        };
        description: {
            required: boolean;
            maxLength: number;
        };
        type: {
            required: boolean;
        };
    };
};
export declare const validateBody: (schemaName: keyof typeof schemas) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.d.ts.map