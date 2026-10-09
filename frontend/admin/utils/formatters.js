/**
 * Internationalized formatting utilities for currencies, dates, and measurements.
 */
/**
 * Formats a numeric value into a localized currency string.
 *
 * @param amount The numeric amount to format
 * @param currency ISO 4217 currency code (defaults to 'INR')
 * @param locale BCP 47 language tag (defaults to 'en-IN')
 * @returns Formatted currency string (e.g. '₹1,250.00')
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    const numericValue = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericValue);
    }
    catch {
        // Fallback if Intl.NumberFormat fails
        return `₹${numericValue.toFixed(2)}`;
    }
};
/**
 * Formats a date string, timestamp, or Date object into a readable date string.
 *
 * @param dateInput The date representation to format
 * @param options Intl.DateTimeFormatOptions override
 * @param locale BCP 47 language tag (defaults to 'en-IN')
 * @returns Localized date string or fallback '-' if invalid
 */
export const formatDate = (dateInput, options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
}, locale = 'en-IN') => {
    if (!dateInput) {
        return '-';
    }
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) {
            return '-';
        }
        return new Intl.DateTimeFormat(locale, options).format(date);
    }
    catch {
        return '-';
    }
};
/**
 * Formats a weight in kilograms with localized decimals and unit.
 *
 * @param weightInKg Weight value in kilograms
 * @param decimals Decimal places to display (defaults to 2)
 * @returns Formatted weight string (e.g. '2.50 kg')
 */
export const formatWeight = (weightInKg, decimals = 2) => {
    const value = typeof weightInKg === 'number' && !isNaN(weightInKg) ? Math.max(0, weightInKg) : 0;
    return `${value.toFixed(decimals)} kg`;
};
/**
 * Formats a standard number with thousands separators.
 *
 * @param value The number to format
 * @param decimals Optional decimal places
 * @param locale BCP 47 language tag (defaults to 'en-IN')
 */
export const formatNumber = (value, decimals, locale = 'en-IN') => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    try {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }
    catch {
        return typeof decimals === 'number' ? num.toFixed(decimals) : num.toString();
    }
};
