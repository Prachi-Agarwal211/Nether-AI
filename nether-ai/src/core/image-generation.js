// src/core/image-generation.js
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

export async function generateImagePublicUrl({ keywords = [] }) {
  if (!PEXELS_API_KEY || keywords.length === 0) {
    return null;
  }
  const query = encodeURIComponent(keywords.join(' '));
  const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`;

  try {
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large2x || photo?.src?.large || null;
  } catch (e) {
    console.error('Pexels API fetch failed:', e);
    return null;
  }
}
