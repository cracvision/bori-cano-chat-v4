const { parsePhoneNumber } = require('libphonenumber-js');

/**
 * Normalize phone number to E.164 format
 * @param {string} phone 
 * @param {string} defaultCountry 
 * @returns {string|null}
 */
function normalizePhoneToE164(phone, defaultCountry = 'US') {
  if (!phone) return null;
  
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    return phoneNumber.isValid() ? phoneNumber.format('E.164') : null;
  } catch (error) {
    console.warn('Phone normalization failed:', error.message);
    return null;
  }
}

/**
 * Generate order number (simple incrementing format)
 * @param {number} count 
 * @returns {string}
 */
function generateOrderNumber(count = 0) {
  return `ORDER-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Validate status transition
 * @param {string} fromStatus 
 * @param {string} toStatus 
 * @returns {boolean}
 */
function isValidStatusTransition(fromStatus, toStatus) {
  const { VALID_STATUS_TRANSITIONS } = require('../types/kitchen');
  return VALID_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
}

module.exports = {
  normalizePhoneToE164,
  generateOrderNumber,
  isValidStatusTransition
};
