// Input Micro Service
// Schema + coercion + unicode normalize (NFKC) + strict enum guards

interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'integer' | 'date' | 'email' | 'url';
  required?: boolean;
  enum?: any[];
  min?: number;
  max?: number;
  pattern?: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  default?: any;
}

interface Schema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
  data?: any;
}

class InputService {
  /**
   * Validate input against schema
   */
  validate(input: any, schema: Schema): ValidationResult {
    const errors: Array<{ path: string; message: string }> = [];
    const data = this.coerce(input, schema);

    this.validateObject(data, schema, '', errors);

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : undefined,
    };
  }

  /**
   * Coerce input to match schema types
   */
  coerce(input: any, schema: Schema): any {
    if (input === null || input === undefined) {
      return input;
    }

    if (typeof input !== 'object') {
      return input;
    }

    const result: any = {};

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (input[key] === undefined || input[key] === null) {
        if (propSchema.required) {
          result[key] = propSchema.default;
        }
        continue;
      }

      result[key] = this.coerceValue(input[key], propSchema);
    }

    return result;
  }

  /**
   * Coerce single value
   */
  private coerceValue(value: any, schema: SchemaProperty): any {
    switch (schema.type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'integer':
        return Math.floor(Number(value));
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value);
      case 'email':
        return String(value).toLowerCase().trim();
      case 'url':
        return String(value).trim();
      case 'array':
        if (!Array.isArray(value)) {
          return [value];
        }
        if (schema.items) {
          return value.map(item => this.coerceValue(item, schema.items!));
        }
        return value;
      case 'object':
        if (typeof value !== 'object' || value === null) {
          return {};
        }
        if (schema.properties) {
          return this.coerce(value, schema as unknown as Schema);
        }
        return value;
      default:
        return value;
    }
  }

  /**
   * Validate object against schema
   */
  private validateObject(
    obj: any,
    schema: Schema,
    path: string,
    errors: Array<{ path: string; message: string }>
  ): void {
    if (obj === null || typeof obj !== 'object') {
      errors.push({ path, message: 'Expected object' });
      return;
    }

    // Check required fields
    for (const required of schema.required || []) {
      if (obj[required] === undefined || obj[required] === null) {
        errors.push({ path: `${path}.${required}`, message: 'Required field missing' });
      }
    }

    // Validate each property
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (obj[key] === undefined || obj[key] === null) {
        continue;
      }

      this.validateProperty(obj[key], propSchema, `${path}.${key}`, errors);
    }
  }

  /**
   * Validate single property
   */
  private validateProperty(
    value: any,
    schema: SchemaProperty,
    path: string,
    errors: Array<{ path: string; message: string }>
  ): void {
    // Type check
    if (!this.checkType(value, schema.type)) {
      errors.push({ path, message: `Expected type ${schema.type}` });
      return;
    }

    // Enum check
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({ path, message: `Value must be one of: ${schema.enum.join(', ')}` });
    }

    // Min/max check for numbers
    if (schema.type === 'number' || schema.type === 'integer') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push({ path, message: `Value must be >= ${schema.min}` });
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push({ path, message: `Value must be <= ${schema.max}` });
      }
    }

    // String length check
    if (schema.type === 'string') {
      if (schema.min !== undefined && value.length < schema.min) {
        errors.push({ path, message: `Length must be >= ${schema.min}` });
      }
      if (schema.max !== undefined && value.length > schema.max) {
        errors.push({ path, message: `Length must be <= ${schema.max}` });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({ path, message: 'Pattern mismatch' });
      }
    }

    // Email validation
    if (schema.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push({ path, message: 'Invalid email format' });
      }
    }

    // URL validation
    if (schema.type === 'url') {
      try {
        new URL(value);
      } catch {
        errors.push({ path, message: 'Invalid URL format' });
      }
    }

    // Array validation
    if (schema.type === 'array' && Array.isArray(value)) {
      if (schema.min !== undefined && value.length < schema.min) {
        errors.push({ path, message: `Array length must be >= ${schema.min}` });
      }
      if (schema.max !== undefined && value.length > schema.max) {
        errors.push({ path, message: `Array length must be <= ${schema.max}` });
      }
      if (schema.items) {
        value.forEach((item, index) => {
          this.validateProperty(item, schema.items!, `${path}[${index}]`, errors);
        });
      }
    }

    // Object validation
    if (schema.type === 'object' && schema.properties) {
      this.validateObject(value, schema as unknown as Schema, path, errors);
    }
  }

  /**
   * Check type
   */
  private checkType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  /**
   * Normalize unicode string (NFKC)
   */
  normalizeUnicode(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    // NFKC normalization
    return input.normalize('NFKC');
  }

  /**
   * Strict enum guard
   */
  enumGuard<T extends string>(value: string, allowedValues: readonly T[]): T {
    if (!allowedValues.includes(value as T)) {
      throw new Error(`Invalid enum value: ${value}. Allowed: ${allowedValues.join(', ')}`);
    }
    return value as T;
  }

  /**
   * Sanitize input (XSS prevention)
   */
  sanitize(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Trim and normalize string
   */
  normalizeString(input: string): string {
    let result = this.normalizeUnicode(input);
    result = result.trim();
    // Remove multiple spaces
    result = result.replace(/\s+/g, ' ');
    return result;
  }

  /**
   * Validate and coerce with schema
   */
  validateAndCoerce(input: any, schema: Schema): ValidationResult {
    // Normalize strings in input
    const normalized = this.normalizeStringsInInput(input);
    return this.validate(normalized, schema);
  }

  /**
   * Normalize all strings in input recursively
   */
  private normalizeStringsInInput(input: any): any {
    if (typeof input === 'string') {
      return this.normalizeString(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.normalizeStringsInInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.normalizeStringsInInput(value);
      }
      return result;
    }

    return input;
  }

  /**
   * Create schema builder
   */
  createSchemaBuilder() {
    return {
      object: (properties: Record<string, SchemaProperty>, required?: string[]): Schema => ({
        type: 'object',
        properties,
        required,
      }),
      string: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'string',
        ...config,
      }),
      number: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'number',
        ...config,
      }),
      integer: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'integer',
        ...config,
      }),
      boolean: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'boolean',
        ...config,
      }),
      array: (items: SchemaProperty, config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'array',
        items,
        ...config,
      }),
      enum: (values: any[], config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'string',
        enum: values,
        ...config,
      }),
      email: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'email',
        ...config,
      }),
      url: (config?: Partial<SchemaProperty>): SchemaProperty => ({
        type: 'url',
        ...config,
      }),
    };
  }
}

// Singleton instance
const inputService = new InputService();

export default inputService;
export { InputService };
export type { Schema, SchemaProperty, ValidationResult };
