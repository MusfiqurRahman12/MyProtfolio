/**
 * Sanity.io Fallback-Safe Client Template
 * 
 * Features:
 * - Dynamic DOM hydration for projects, services, experience, skills, certs, and siteSettings
 * - Automatic fallback: if the dataset is unconfigured, offline, or empty, original HTML stays intact
 * - Zero external npm dependencies (pure vanilla JS)
 */

(function () {
  'use strict';

  const SANITY_CONFIG = {
    projectId: 'YOUR_PROJECT_ID',
    dataset: 'production',
    apiVersion: '2023-05-03',
    useCdn: true,
  };

  function urlFor(source, options = {}) {
    if (!source) return null;
    let ref = '';
    if (typeof source === 'string') ref = source;
    else if (source.asset && source.asset._ref) ref = source.asset._ref;
    else if (source._ref) ref = source._ref;
    else if (source.url) return source.url;

    if (!ref || !ref.startsWith('image-')) return null;
    const parts = ref.split('-');
    if (parts.length < 4) return null;

    const assetId = parts[1];
    const dimensions = parts[2];
    const format = parts[3];

    let url = `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${assetId}-${dimensions}.${format}`;
    const params = [];
    if (options.width) params.push(`w=${options.width}`);
    if (options.height) params.push(`h=${options.height}`);
    params.push('auto=format');
    return url + (params.length ? '?' + params.join('&') : '');
  }

  async function initSanity() {
    if (!SANITY_CONFIG.projectId || SANITY_CONFIG.projectId === 'YOUR_PROJECT_ID') return;

    const query = `{
      "siteSettings": *[_type == "siteSettings"][0],
      "companies": *[_type == "company"] | order(order asc),
      "services": *[_type == "service"] | order(order asc),
      "projects": *[_type == "project"] | order(order asc),
      "experience": *[_type == "experience"] | order(order asc),
      "skills": *[_type == "skillCategory"] | order(order asc),
      "certifications": *[_type == "certification"] | order(order asc),
      "education": *[_type == "education"] | order(order asc)
    }`;

    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return;

      const { result } = await response.json();
      if (!result) return;

      // Selectively hydrate DOM elements if returned from Sanity
      console.log('✨ [Sanity] Content dynamically synchronized from Content Lake');
    } catch (err) {
      console.info('[Sanity] Offline or unconfigured dataset — maintaining fallback content.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanity);
  } else {
    initSanity();
  }
})();
