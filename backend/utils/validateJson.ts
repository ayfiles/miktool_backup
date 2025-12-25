import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import orderSchema from '../schemas/order-schema.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile schema once at module load
const validate: ValidateFunction = ajv.compile(orderSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

/**
 * Validates JSON data against the order schema
 * @param data - JSON data to validate
 * @returns Validation result with errors if invalid
 */
export function validateOrderJson(data: unknown): ValidationResult {
  const valid = validate(data);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors || [],
    };
  }

  return { valid: true };
}





