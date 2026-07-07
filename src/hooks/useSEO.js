import { useEffect } from 'react';

/**
 * A custom hook to dynamically update document metadata and Schema.org scripts.
 * Supports standard tag creation/updation and Open Graph/Twitter sharing configurations.
 * 
 * @param {Object} seoConfig Configuration parameters
 * @param {string} seoConfig.title Page Title
 * @param {string} seoConfig.description Meta Description
 * @param {string} seoConfig.keywords Meta Keywords comma-separated
 * @param {string} seoConfig.canonicalUrl Canonical path
 * @param {Object} seoConfig.schema JSON-LD structured schema object
 */
export default function useSEO({ title, description, keywords, canonicalUrl, schema }) {
  useEffect(() => {
    // 1. Title configuration
    if (title) {
      document.title = title;
      
      // Open Graph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);

      // Twitter Title
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', title);
    }

    // 2. Meta Description configuration
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // Open Graph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', description);

      // Twitter Description
      let twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDesc) {
        twitterDesc = document.createElement('meta');
        twitterDesc.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDesc);
      }
      twitterDesc.setAttribute('content', description);
    }

    // 3. Keywords configuration
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 4. Canonical URL configuration
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);

      // Open Graph URL
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalUrl);
    }

    // 5. Open Graph static metadata (Type & Image fallback)
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      ogType.setAttribute('content', 'website');
      document.head.appendChild(ogType);
    }
    
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      ogImg.setAttribute('content', 'https://aiformsme.co.in/favicon.svg');
      document.head.appendChild(ogImg);
    }

    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      twitterCard.setAttribute('content', 'summary_large_image');
      document.head.appendChild(twitterCard);
    }

    // 6. Schema.org injection
    let schemaScript = document.getElementById('schema-jsonld');
    if (schema) {
      if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schema);
      } else {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        schemaScript.setAttribute('id', 'schema-jsonld');
        schemaScript.textContent = JSON.stringify(schema);
        document.head.appendChild(schemaScript);
      }
    } else if (schemaScript) {
      schemaScript.remove();
    }

    // Cleanup: Avoid leaks when toggling tabs
    return () => {
      const script = document.getElementById('schema-jsonld');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, schema]);
}
