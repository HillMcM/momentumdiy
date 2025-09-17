import { BaseContentRenderer } from './BaseContentRenderer';
import type { MarketingModule } from '../../types';

export class LocalFootTrafficRenderer extends BaseContentRenderer {
  renderWeeklyLesson(module: MarketingModule): React.ReactNode {
    const sanitized = this.sanitizeHtml(module.content);
    
    // Remove Pro Tip section from the content (it's rendered separately)
    const contentWithoutProTip = sanitized.replace(/<h[1-6]>(Pro Tip:.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/is, '');
    
    // Add Local Foot Traffic specific styling
    const styled = contentWithoutProTip
      .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
      .replace(/(Theme:|Why this matters:)/gi, '<span class="text-[#EF8E81] font-medium">$1</span>')
      .replace(/<p>/gi, '<p class="text-gray-300 mb-4 leading-relaxed">')
      .replace(/<ul>/gi, '<ul class="text-gray-300 mb-4 space-y-2 ml-6">')
      .replace(/<li>/gi, '<li class="list-disc">')
      .replace(/<strong>/gi, '<strong class="text-white font-semibold">')
      .replace(/<em>/gi, '<em class="text-[#EF8E81]">');

    return (
      <div
        className="prose prose-invert max-w-none text-gray-300"
        dangerouslySetInnerHTML={{ __html: styled }}
      />
    );
  }
}

// Export singleton instance
export const localFootTrafficRenderer = new LocalFootTrafficRenderer();
