import type { ContentRenderer } from './BaseContentRenderer';
import { localFootTrafficRenderer } from './LocalFootTrafficRenderer';
import { socialMediaRenderer } from './SocialMediaRenderer';

// Registry of content renderers by track slug
const contentRenderers: Record<string, ContentRenderer> = {
  'local-foot-traffic': localFootTrafficRenderer,
  'social-media-strategy': socialMediaRenderer,
};

// Get content renderer for a track
export function getContentRenderer(trackSlug: string): ContentRenderer {
  return contentRenderers[trackSlug] || localFootTrafficRenderer; // fallback to local foot traffic
}

// Get content renderer by goal title (for backward compatibility)
export function getContentRendererByTitle(title: string): ContentRenderer {
  const slug = Object.keys(contentRenderers).find(key => 
    title.toLowerCase().includes(key.replace('-', ' '))
  );
  return slug ? contentRenderers[slug] : localFootTrafficRenderer;
}

// Export individual renderers
export { localFootTrafficRenderer, socialMediaRenderer };
export type { ContentRenderer };
