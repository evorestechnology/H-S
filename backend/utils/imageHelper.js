import { supabase } from '../lib/supabase.js';
import crypto from 'crypto';

/**
 * Base64 Data URI Passthrough Utility for Database Storage
 * Ensures images (base64 Data URIs or URLs) are stored directly in PostgreSQL database columns.
 */

export const saveBase64Image = async (dataUrl) => {
  return await uploadBase64ToSupabase(dataUrl);
};

/**
 * Uploads a base64 string to Supabase Storage and returns the public URL.
 * If it's already a URL or not a base64 string, it returns it as-is.
 */
export const uploadBase64ToSupabase = async (val) => {
  if (typeof val !== 'string' || !val.startsWith('data:image/')) {
    return val;
  }

  try {
    const commaIdx = val.indexOf(',');
    if (commaIdx === -1) return val;

    const header = val.substring(0, commaIdx);
    const slashIdx = header.indexOf('/');
    const semiIdx = header.indexOf(';');
    const extension = (slashIdx !== -1 && semiIdx !== -1 && semiIdx > slashIdx)
      ? header.substring(slashIdx + 1, semiIdx).replace('+xml', '')
      : 'png';

    const base64Data = val.substring(commaIdx + 1);
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: `image/${extension}`,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error.message || error);
      return val; // Fallback to storing base64 if upload fails
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadBase64ToSupabase:', error.message || error);
    return val;
  }
};

/**
 * Traverses product payload objects and uploads base64 Data URIs to Supabase.
 * Processes arrays sequentially to prevent concurrent memory buffer spikes.
 */
export const deepSanitizeBase64 = async (val) => {
  if (!val) return val;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return await deepSanitizeBase64(parsed);
      } catch (e) {
        return await uploadBase64ToSupabase(val);
      }
    }
    return await uploadBase64ToSupabase(val);
  }

  if (Array.isArray(val)) {
    // Process items sequentially to avoid memory spikes from concurrent image buffers
    const results = [];
    for (const item of val) {
      results.push(await deepSanitizeBase64(item));
    }
    return results;
  }

  if (typeof val === 'object' && val !== null) {
    const res = {};
    for (const key of Object.keys(val)) {
      res[key] = await deepSanitizeBase64(val[key]);
    }
    return res;
  }

  return val;
};

export const sanitizeProductImageFields = async (data) => {
  return await deepSanitizeBase64(data);
};
