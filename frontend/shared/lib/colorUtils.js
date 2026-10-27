/**
 * Color utility for resolving exact hex codes from color objects or color names.
 * Corrects dummy default black (#000000) hex codes when color name clearly indicates another shade.
 */
export const resolveColorHex = (col) => {
  if (!col) return '#111111';

  if (typeof col === 'string') {
    if (col.startsWith('#')) return col;
    const name = col.toLowerCase().trim();
    if (name.includes('white') || name.includes('optic') || name.includes('snow') || name.includes('cream')) return '#FFFFFF';
    if (name.includes('black') || name.includes('noir') || name.includes('dark')) return '#111111';
    if (name.includes('grey') || name.includes('gray') || name.includes('heather')) return '#9E9E9E';
    if (name.includes('navy') || name.includes('blue')) return '#1E3A8A';
    if (name.includes('red') || name.includes('maroon') || name.includes('crimson') || name.includes('burgundy')) return '#991B1B';
    if (name.includes('green') || name.includes('olive') || name.includes('sage') || name.includes('forest')) return '#3F6212';
    if (name.includes('beige') || name.includes('sand') || name.includes('khaki') || name.includes('tan')) return '#D4B996';
    if (name.includes('brown') || name.includes('coffee') || name.includes('chocolate')) return '#451A03';
    if (name.includes('yellow') || name.includes('gold')) return '#EAB308';
    if (name.includes('orange') || name.includes('rust')) return '#EA580C';
    if (name.includes('purple') || name.includes('violet')) return '#7E22CE';
    if (name.includes('pink') || name.includes('rose')) return '#EC4899';
    return '#E5E5E5';
  }

  const name = (col?.name || '').toLowerCase().trim();
  const rawHex = col?.hex || col?.code;

  // Correct dummy #000000 default when color name is non-black
  if (rawHex && (rawHex === '#000000' || rawHex === '#000')) {
    if (name.includes('white') || name.includes('optic') || name.includes('cream') || name.includes('snow') || name.includes('ivory')) {
      return '#FFFFFF';
    }
    if (name.includes('grey') || name.includes('gray') || name.includes('heather')) {
      return '#9E9E9E';
    }
    if (name.includes('navy') || name.includes('blue')) {
      return '#1E3A8A';
    }
    if (name.includes('red') || name.includes('maroon') || name.includes('crimson')) {
      return '#991B1B';
    }
    if (name.includes('olive') || name.includes('green') || name.includes('sage')) {
      return '#3F6212';
    }
    if (name.includes('beige') || name.includes('sand') || name.includes('khaki') || name.includes('tan')) {
      return '#D4B996';
    }
    if (name.includes('brown')) {
      return '#451A03';
    }
    if (name.includes('yellow')) {
      return '#EAB308';
    }
    if (name.includes('pink')) {
      return '#EC4899';
    }
    if (name.includes('purple')) {
      return '#7E22CE';
    }
    if (name.includes('orange')) {
      return '#EA580C';
    }
  }

  if (rawHex && rawHex.startsWith('#') && rawHex.length >= 4) {
    return rawHex;
  }

  // Fallback by name
  if (name.includes('white') || name.includes('optic') || name.includes('cream')) return '#FFFFFF';
  if (name.includes('black')) return '#111111';
  if (name.includes('grey') || name.includes('gray')) return '#9E9E9E';
  if (name.includes('navy') || name.includes('blue')) return '#1E3A8A';
  if (name.includes('red') || name.includes('maroon')) return '#991B1B';
  if (name.includes('green') || name.includes('olive')) return '#3F6212';
  if (name.includes('beige') || name.includes('sand')) return '#D4B996';
  if (name.includes('brown')) return '#451A03';
  if (name.includes('yellow')) return '#EAB308';
  if (name.includes('pink')) return '#EC4899';
  if (name.includes('purple')) return '#7E22CE';
  if (name.includes('orange')) return '#EA580C';

  return '#111111';
};
