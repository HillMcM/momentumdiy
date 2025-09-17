import type { MarketingModule } from '../../types';

export interface ContentRenderer {
  renderWeeklyLesson(module: MarketingModule): React.ReactNode;
  renderProTip(content: string): React.ReactNode;
  extractProTip(content: string): { title: string; content: string } | null;
}

export abstract class BaseContentRenderer implements ContentRenderer {
  // Common HTML sanitization
  protected sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  // Common Pro Tip extraction
  extractProTip(content: string): { title: string; content: string } | null {
    // Try different Pro Tip patterns
    const patterns = [
      /<h[1-6]>(Pro Tip:.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/is,
      /##\s*Pro Tip\s*\n(.*?)(?=\n##|$)/is,
      /\*\*Pro Tip\*\*\s*\n(.*?)(?=\n\*\*|$)/is,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          title: match[1]?.includes('Pro Tip') ? match[1] : 'Pro Tip',
          content: (match[2] || match[1] || '').trim()
        };
      }
    }
    
    return null;
  }

  // Default Pro Tip rendering
  renderProTip(content: string): React.ReactNode {
    const proTip = this.extractProTip(content);
    
    if (!proTip) return null;

    return (
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(104,109,202,0.12)',
        border: '2px dashed rgba(104,109,202,0.4)',
        borderRadius: '12px'
      }}>
        <div style={{ 
          fontWeight: 700, 
          color: '#686DCA', 
          marginBottom: '0.75rem', 
          fontSize: '1.1rem' 
        }}>
          💡 Pro Tip
        </div>
        <div 
          style={{ color: '#FFF1E7', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ 
            __html: this.sanitizeHtml(proTip.content.replace(/\*\*Pro Tip\*\*/g, '').trim()) 
          }}
        />
      </div>
    );
  }

  // Abstract method - each track type implements its own lesson rendering
  abstract renderWeeklyLesson(module: MarketingModule): React.ReactNode;
}
