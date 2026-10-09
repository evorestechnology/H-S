import neckLogoBlackUrl from '../../assets/neck-logos/neck-logo-black.png';
import neckLogoWhiteUrl from '../../assets/neck-logos/neck-logo-white.png';
import neckLogoBlackDataUri from '../../assets/neck-logos/neck-logo-black.png?inline';
import neckLogoWhiteDataUri from '../../assets/neck-logos/neck-logo-white.png?inline';
import { downloadFileWithFallback } from '../utils/downloadUtils';
export const NECK_LOGO_BLACK = {
    color: 'black',
    label: 'Black Logo',
    fileName: 'neck logo black.png',
    dataUri: neckLogoBlackDataUri,
    publicUrl: neckLogoBlackUrl,
};
export const NECK_LOGO_WHITE = {
    color: 'white',
    label: 'White Logo',
    fileName: 'neck logo white.png',
    dataUri: neckLogoWhiteDataUri,
    publicUrl: neckLogoWhiteUrl,
};
export const HARDCODED_NECK_LOGOS = {
    black: NECK_LOGO_BLACK,
    white: NECK_LOGO_WHITE
};
export const downloadHardcodedNeckLogo = async (color) => {
    const asset = HARDCODED_NECK_LOGOS[color];
    const candidateUrls = [
        asset.publicUrl,
        `/assests/neckband logo/${asset.fileName}`,
        encodeURI(`/assests/neckband logo/${asset.fileName}`)
    ];
    await downloadFileWithFallback(candidateUrls, asset.dataUri, asset.fileName);
};
