import { BaseContentRenderer } from './BaseContentRenderer';
import type { MarketingModule } from '../../types';

export class SocialMediaRenderer extends BaseContentRenderer {
  
  // Extract tasks from Social Media markdown content
  extractTasks(content: string): any[] {
    const tasks: any[] = [];
    
    // Look for the "What to do this week:" section and extract tasks
    const whatToDoMatch = content.match(/### What to do this week:([\s\S]*?)(?=##|$)/);
    if (whatToDoMatch) {
      const whatToDoContent = whatToDoMatch[1];
      
      // Match each task line: - **Task name:** Description...
      const taskMatches = whatToDoContent.match(/- \*\*([^:*]+):\*\* ([^\n]+)/g);
      
      if (taskMatches) {
        taskMatches.forEach((taskMatch, index) => {
          const match = taskMatch.match(/- \*\*([^:*]+):\*\* ([^\n]+)/);
          if (match) {
            const [, title, description] = match;
            tasks.push({
              id: `social-task-${index + 1}`,
              title: title.trim(),
              description: description.trim(),
              estimatedTime: '20 min', // Default time
              isCompleted: false,
              shortDescription: description.trim()
            });
          }
        });
      }
    }
    
    return tasks;
  }

  renderWeeklyLesson(module: MarketingModule): React.ReactNode {
    const sanitized = this.sanitizeHtml(module.content);
    
    // Remove Pro Tip section from the content (it's rendered separately)
    let contentWithoutProTip = sanitized.replace(/##\s*Pro Tip\s*\n(.*?)(?=\n##|$)/is, '');
    
    // Remove "What to do this week:" section since tasks are now displayed separately
    contentWithoutProTip = contentWithoutProTip.replace(/### What to do this week:([\s\S]*?)(?=##|$)/i, '');
    
    // Parse markdown-style content for Social Media tracks
    const lines = contentWithoutProTip.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="text-gray-300 mb-4 space-y-2 ml-6">
            {currentList.map((item, i) => (
              <li key={i} className="list-disc">
                <span dangerouslySetInnerHTML={{
                  __html: item.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                }} />
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        flushList();
        return;
      }

      // Headers
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h2-${index}`} className="text-lg font-semibold text-white mt-6 mb-3">
            {trimmed.substring(3)}
          </h3>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h3-${index}`} className="text-md font-medium text-[#EF8E81] mt-4 mb-2">
            {trimmed.substring(4)}
          </h4>
        );
      }
      // List items
      else if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.substring(2));
      }
      // Paragraphs
      else {
        flushList();
        elements.push(
          <p key={`p-${index}`} className="text-gray-300 mb-4 leading-relaxed">
            <span dangerouslySetInnerHTML={{
              __html: trimmed
                .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em class="text-[#EF8E81]">$1</em>')
            }} />
          </p>
        );
      }
    });

    flushList(); // Flush any remaining list items

    return (
      <div className="prose prose-invert max-w-none text-gray-300">
        {elements}
      </div>
    );
  }

  // Override Pro Tip rendering for Social Media with different styling
  renderProTip(content: string): React.ReactNode {
    const proTip = this.extractProTip(content);
    
    if (!proTip) return null;

    return (
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(239,142,129,0.12)',
        border: '2px dashed rgba(239,142,129,0.4)',
        borderRadius: '12px'
      }}>
        <div style={{ 
          fontWeight: 700, 
          color: '#EF8E81', 
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
}

// Export singleton instance
export const socialMediaRenderer = new SocialMediaRenderer();
