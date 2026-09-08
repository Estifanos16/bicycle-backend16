/**
 * Shared utility functions for the bicycle backend.
 */

/**
 * Generate a unique order number.
 * @returns {string}
 */
const generateOrderNumber = () =>
    'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

module.exports = { generateOrderNumber };
