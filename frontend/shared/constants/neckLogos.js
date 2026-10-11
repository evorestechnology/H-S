import neckLogoBlackUrl from '../../assets/neck-logos/Black Neck Logo.jpeg';
import neckLogoWhiteUrl from '../../assets/neck-logos/White Neck Logo.jpeg';
import neckLogoBlackDataUri from '../../assets/neck-logos/Black Neck Logo.jpeg?inline';
import neckLogoWhiteDataUri from '../../assets/neck-logos/White Neck Logo.jpeg?inline';
import { downloadFileWithFallback } from '../utils/downloadUtils';

export const NECK_LOGO_BLACK = {
    color: 'black',
    label: 'Black Logo',
    fileName: 'Black Neck Logo.jpeg',
    dataUri: neckLogoBlackDataUri,
    publicUrl: '/Black Neck Logo.jpeg',
    assetUrl: neckLogoBlackUrl,
};

export const NECK_LOGO_WHITE = {
    color: 'white',
    label: 'White Logo',
    fileName: 'White Neck Logo.jpeg',
    dataUri: neckLogoWhiteDataUri,
    publicUrl: '/White Neck Logo.jpeg',
    assetUrl: neckLogoWhiteUrl,
};

export const HARDCODED_NECK_LOGOS = {
    black: NECK_LOGO_BLACK,
    white: NECK_LOGO_WHITE
};

/**
 * Helper to determine if a garment color is considered light or dark.
 * Light garments require the Black neck logo.
 * Dark garments require the White neck logo.
 */
export const isLightGarmentColor = (colorStr, hexCode) => {
    // Check hex code first if available
    if (hexCode && typeof hexCode === 'string') {
        const hex = hexCode.replace('#', '').trim();
        if (hex.length === 3 || hex.length === 6) {
            const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
            const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
            const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                // Perceived luminance formula (ITU-R BT.601)
                const luminance = (r * 299 + g * 587 + b * 114) / 1000;
                return luminance >= 140;
            }
        }
    }

    const lower = (colorStr || '').toLowerCase().trim();
    if (!lower) return false;

    // Dark keywords take priority
    const darkKeywords = ['black', 'charcoal', 'navy', 'dark', 'midnight', 'maroon', 'burgundy', 'forest', 'brown', 'chocolate', 'espresso', 'deep', 'pitch', 'slate'];
    for (const dark of darkKeywords) {
        if (lower.includes(dark)) return false;
    }

    // Light keywords
    const lightKeywords = ['white', 'cream', 'ivory', 'beige', 'sand', 'light', 'yellow', 'lemon', 'khaki', 'pale', 'off-white', 'offwhite', 'tan', 'vanilla', 'milk', 'snow', 'ash', 'heather grey', 'light grey', 'light gray'];
    for (const light of lightKeywords) {
        if (lower.includes(light)) return true;
    }

    return false;
};

/**
 * Returns the recommended neck logo color ('black' or 'white') based on the garment color.
 * For light garments -> 'black'
 * For dark garments -> 'white'
 */
export const getRecommendedNeckLogoColor = (colorStr, hexCode) => {
    return isLightGarmentColor(colorStr, hexCode) ? 'black' : 'white';
};

export const downloadHardcodedNeckLogo = async (color) => {
    const key = color === 'white' ? 'white' : 'black';
    const asset = HARDCODED_NECK_LOGOS[key];
    const candidateUrls = [
        encodeURI(asset.publicUrl),
        asset.publicUrl,
        asset.assetUrl,
        encodeURI(`/${asset.fileName}`),
        `/${asset.fileName}`,
        encodeURI(`/assests/neckband logo/${asset.fileName}`),
        asset.dataUri
    ];
    await downloadFileWithFallback(candidateUrls, asset.dataUri, asset.fileName);
};
