/**
 * Unit Conversion Utilities
 * 
 * Utility functions for converting between metric (kg) and imperial (lbs) weight units.
 * Uses standard conversion factor: 1 kg = 2.20462 lbs
 * 
 * @module unitConversion
 */

/**
 * Conversion factor: kilograms to pounds
 * 1 kg = 2.20462 lbs (official conversion factor)
 */
const KG_TO_LBS_FACTOR = 2.20462;

/**
 * Maximum reasonable weight for validation (1000 kg or ~2200 lbs)
 * Prevents obviously incorrect data entry
 */
const MAX_WEIGHT = 1000;

/**
 * Validate that a value is a valid number
 * 
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validate weight input
 * Throws descriptive errors for invalid inputs
 * 
 * @param {number} weight - Weight to validate
 * @throws {Error} If weight is invalid
 */
function validateWeight(weight) {
  if (!isNumber(weight)) {
    throw new Error('Weight must be a valid number');
  }
  if (weight < 0) {
    throw new Error('Weight cannot be negative');
  }
}

/**
 * Round a number to specified decimal places
 * 
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert kilograms to pounds
 * 
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds (rounded to 1 decimal)
 * @throws {Error} If weight is invalid
 * 
 * @example
 * kgToLbs(70) // 154.3
 * kgToLbs(75.5) // 166.4
 * kgToLbs(0.5) // 1.1
 */
export function kgToLbs(kg) {
  validateWeight(kg);
  const lbs = kg * KG_TO_LBS_FACTOR;
  return round(lbs, 1);
}

/**
 * Convert pounds to kilograms
 * 
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms (rounded to 1 decimal)
 * @throws {Error} If weight is invalid
 * 
 * @example
 * lbsToKg(154.3) // 70
 * lbsToKg(166.4) // 75.5
 * lbsToKg(1.1) // 0.5
 */
export function lbsToKg(lbs) {
  validateWeight(lbs);
  const kg = lbs / KG_TO_LBS_FACTOR;
  return round(kg, 1);
}

/**
 * Convert weight between unit systems
 * 
 * @param {number} weight - Weight value
 * @param {string} fromUnit - Source unit system ('metric' or 'imperial')
 * @param {string} toUnit - Target unit system ('metric' or 'imperial')
 * @returns {number} Converted weight
 * @throws {Error} If weight or units are invalid
 * 
 * @example
 * convertWeight(70, 'metric', 'imperial') // 154.3
 * convertWeight(154.3, 'imperial', 'metric') // 70
 * convertWeight(70, 'metric', 'metric') // 70 (no conversion)
 */
export function convertWeight(weight, fromUnit, toUnit) {
  validateWeight(weight);

  const validUnits = ['metric', 'imperial'];
  if (!validUnits.includes(fromUnit) || !validUnits.includes(toUnit)) {
    throw new Error('Invalid unit system: must be "metric" or "imperial"');
  }

  // No conversion needed if units are the same
  if (fromUnit === toUnit) {
    return weight;
  }

  // Convert based on direction
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return kgToLbs(weight);
  } else {
    // fromUnit === 'imperial' && toUnit === 'metric'
    return lbsToKg(weight);
  }
}

/**
 * Check if a weight value is valid
 * 
 * Valid weights:
 * - Must be a number
 * - Must be non-negative
 * - Must be less than or equal to 1000 kg (or ~2200 lbs)
 * 
 * @param {any} weight - Value to validate
 * @returns {boolean} True if valid weight
 * 
 * @example
 * isValidWeight(70) // true
 * isValidWeight(0) // true
 * isValidWeight(-10) // false
 * isValidWeight(null) // false
 * isValidWeight(1001) // false (>1000 kg)
 */
export function isValidWeight(weight) {
  if (!isNumber(weight)) {
    return false;
  }
  if (weight < 0) {
    return false;
  }
  // Check maximum weight based on likely unit
  // If weight is large (>1000), assume it's in lbs, otherwise kg
  if (weight > 1000) {
    // Assume lbs, check if within 2200 lbs limit
    return weight <= MAX_WEIGHT * KG_TO_LBS_FACTOR;
  } else {
    // Assume kg, check if within 1000 kg limit
    return weight <= MAX_WEIGHT;
  }
}

/**
 * Format weight as string with optional unit
 * 
 * @param {number} weight - Weight value
 * @param {string} [unit] - Unit system ('metric' or 'imperial'), optional
 * @returns {string} Formatted weight string
 * @throws {Error} If weight or unit is invalid
 * 
 * @example
 * formatWeight(70) // '70'
 * formatWeight(70.123) // '70.1'
 * formatWeight(70, 'metric') // '70 kg'
 * formatWeight(154.3, 'imperial') // '154.3 lbs'
 */
export function formatWeight(weight, unit) {
  validateWeight(weight);

  if (unit !== undefined) {
    const validUnits = ['metric', 'imperial'];
    if (!validUnits.includes(unit)) {
      throw new Error('Invalid unit system: must be "metric" or "imperial"');
    }
  }

  // Round to 1 decimal place
  let formatted = round(weight, 1);

  // Remove trailing .0
  const formattedStr = formatted.toString();
  const cleanedStr = formattedStr.replace(/\.0$/, '');

  // Add unit if provided
  if (unit === 'metric') {
    return `${cleanedStr} kg`;
  } else if (unit === 'imperial') {
    return `${cleanedStr} lbs`;
  } else {
    return cleanedStr;
  }
}
