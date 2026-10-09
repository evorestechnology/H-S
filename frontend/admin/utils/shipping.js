/**
 * Shipping calculation and order weight estimation utilities.
 */
/**
 * Rounds a number to a fixed number of decimal places to avoid floating point drift.
 */
const roundToDecimals = (num, decimals = 3) => {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
};
/**
 * Calculates estimated shipping costs and total shipment weight based on item breakdown
 * and category-level weight rules.
 *
 * @param items Array of items with category/type and quantity
 * @param country Destination country (defaults to "United States")
 * @param blockStepKg Weight bucket step in kilograms (e.g. 5 kg per block)
 * @param ratePerBlock Shipping charge per block step
 * @param rules Database-configured category weight rules
 * @returns Complete ShippingCalculationResult with weight breakdown and charges
 */
export const calculateOrderShipping = (items = [], country = "United States", blockStepKg = 5, ratePerBlock = 5000, rules = []) => {
    const safeCountry = typeof country === "string" ? country.trim().toLowerCase() : "united states";
    const isInternational = safeCountry !== "india";
    const safeItems = Array.isArray(items) ? items : [];
    const safeRules = Array.isArray(rules) ? rules : [];
    const safeBlockStep = typeof blockStepKg === "number" && blockStepKg > 0 && !isNaN(blockStepKg) ? blockStepKg : 5;
    const safeRatePerBlock = typeof ratePerBlock === "number" && ratePerBlock >= 0 && !isNaN(ratePerBlock) ? ratePerBlock : 5000;
    let accumulatedWeightKg = 0;
    const breakdown = [];
    // Create lookup map from rules
    const rulesMap = new Map();
    safeRules.forEach((rule) => {
        if (rule && typeof rule.categoryName === "string") {
            rulesMap.set(rule.categoryName.toLowerCase().trim(), rule);
        }
    });
    safeItems.forEach((item) => {
        if (!item)
            return;
        const rawType = typeof item.type === "string" ? item.type.trim() : "Standard Item";
        const key = rawType.toLowerCase();
        const matchedRule = rulesMap.get(key);
        const unitWeight = matchedRule && typeof matchedRule.weightPerPiece === "number" && !isNaN(matchedRule.weightPerPiece) && matchedRule.weightPerPiece >= 0
            ? matchedRule.weightPerPiece
            : 0.5;
        const name = matchedRule ? matchedRule.categoryName : rawType;
        const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
        const itemTotalWeight = roundToDecimals(quantity * unitWeight, 3);
        accumulatedWeightKg += itemTotalWeight;
        if (quantity > 0) {
            breakdown.push({
                name,
                quantity,
                unitWeightKg: roundToDecimals(unitWeight, 3),
                totalWeightKg: itemTotalWeight
            });
        }
    });
    const totalWeightKg = roundToDecimals(accumulatedWeightKg, 3);
    let blocksCharged = 0;
    let totalShippingCost = 0;
    if (isInternational && totalWeightKg > 0) {
        blocksCharged = Math.ceil(totalWeightKg / safeBlockStep);
        totalShippingCost = blocksCharged * safeRatePerBlock;
    }
    return {
        breakdown,
        totalWeightKg,
        isInternational,
        blockStepKg: safeBlockStep,
        ratePerBlock: safeRatePerBlock,
        blocksCharged,
        totalShippingCost
    };
};
