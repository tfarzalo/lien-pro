// Utility for generating consistent random prices for kits without prices
// This ensures the same kit always shows the same price until real prices are set

const PRICE_RANGES = {
    basic: { min: 99, max: 149 },
    standard: { min: 149, max: 249 },
    premium: { min: 249, max: 399 },
    enterprise: { min: 399, max: 599 }
};

/**
 * Generate a deterministic "random" price based on kit ID
 * This ensures consistency - same kit ID always gets the same price
 */
function seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    // Normalize to 0-1 range
    return Math.abs(hash) / 2147483647;
}

/**
 * Get a consistent price for a kit, either its real price or a generated one
 */
export function getKitPrice(kit: { id: string; price?: number; name?: string }): number {
    // If kit has a price, use it
    if (kit.price && kit.price > 0) {
        return kit.price;
    }

    // Generate a consistent price based on kit ID
    const seed = kit.id + (kit.name || '');
    const random = seededRandom(seed);

    // Determine price range based on kit name/id
    let range = PRICE_RANGES.standard;
    const lowerName = (kit.name || '').toLowerCase();

    if (lowerName.includes('basic') || lowerName.includes('essential') || lowerName.includes('starter')) {
        range = PRICE_RANGES.basic;
    } else if (lowerName.includes('premium') || lowerName.includes('professional') || lowerName.includes('advanced')) {
        range = PRICE_RANGES.premium;
    } else if (lowerName.includes('enterprise') || lowerName.includes('complete') || lowerName.includes('ultimate')) {
        range = PRICE_RANGES.enterprise;
    }

    // Generate price within range, rounded to nearest $10
    const price = range.min + (random * (range.max - range.min));
    return Math.round(price / 10) * 10;
}

/**
 * Format price as currency string
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Get display price for a kit (formatted)
 */
export function getKitDisplayPrice(kit: { id: string; price?: number; name?: string }): string {
    return formatPrice(getKitPrice(kit));
}
