import React from 'react';

/**
 * Enhanced content renderer for marketing track content
 * Supports basic markdown formatting for better readability
 */
export function renderMarketingContent(text: string, options: {
  maxLines?: number;
  showEllipsis?: boolean;
  className?: string;
} = {}): React.ReactNode {
  if (!text) return null;
  
  const { maxLines, showEllipsis = true, className = '' } = options;
  
  // Split content into lines and optionally limit
  let lines = text.split('\n');
  const isLimited = maxLines && lines.length > maxLines;
  
  if (isLimited) {
    lines = lines.slice(0, maxLines);
  }
  
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  
  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={`list-${out.length}`} className="ml-5 my-2 space-y-1">
          {list.map((li, i) => (
            <li key={`li-${i}`} className="text-gray-300">
              {renderInlineFormatting(li)}
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  
  const flushCodeBlock = () => {
    if (codeLines.length) {
      out.push(
        <pre key={`code-${out.length}`} className="bg-gray-800 rounded-lg p-3 my-3 overflow-x-auto">
          <code className="text-green-400 text-sm">
            {codeLines.join('\n')}
          </code>
        </pre>
      );
      codeLines = [];
    }
  };
  
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }
    
    if (inCodeBlock) {
      codeLines.push(raw); // Keep original indentation for code
      return;
    }
    
    // Empty line - add spacing
    if (line.length === 0) {
      flushList();
      out.push(<div key={`sp-${idx}`} className="h-3" />);
      return;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      flushList();
      out.push(
        <h3 key={`h1-${idx}`} className="text-xl font-bold text-white mt-4 mb-2">
          {renderInlineFormatting(line.slice(2))}
        </h3>
      );
      return;
    }
    
    if (line.startsWith('## ')) {
      flushList();
      out.push(
        <h4 key={`h2-${idx}`} className="text-lg font-semibold text-gray-200 mt-3 mb-2">
          {renderInlineFormatting(line.slice(3))}
        </h4>
      );
      return;
    }
    
    if (line.startsWith('### ')) {
      flushList();
      out.push(
        <h5 key={`h3-${idx}`} className="text-base font-medium text-gray-300 mt-2 mb-1">
          {renderInlineFormatting(line.slice(4))}
        </h5>
      );
      return;
    }
    
    // Lists
    if (/^(-|\*|•|–|\d+\.)\s/.test(line)) {
      const listItem = line.replace(/^(-|\*|•|–|\d+\.)\s/, '');
      list.push(listItem);
      return;
    }
    
    // Blockquotes
    if (line.startsWith('> ')) {
      flushList();
      out.push(
        <blockquote key={`quote-${idx}`} className="border-l-4 border-orange-500 pl-4 my-2 italic text-gray-300">
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      return;
    }
    
    // Regular paragraphs
    flushList();
    out.push(
      <p key={`p-${idx}`} className="text-gray-300 mb-2 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  });
  
  // Flush any remaining lists or code
  flushList();
  flushCodeBlock();
  
  // Add ellipsis if content was truncated
  if (isLimited && showEllipsis) {
    out.push(
      <div key="ellipsis" className="text-gray-400 text-sm mt-2">
        ...
      </div>
    );
  }
  
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {out}
    </div>
  );
}

/**
 * Render inline formatting like **bold**, *italic*, `code`, etc.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return text;
  
  // Split by formatting markers while preserving them
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
  
  return parts.map((part, idx) => {
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    
    // Italic text
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    
    // Inline code
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    
    // Links
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a 
          key={idx} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    
    return part;
  });
}

/**
 * Simplified version for preview/summary display
 * Renders markdown formatting but limits the number of meaningful content lines
 */
export function renderContentPreview(text: string, maxLines: number = 3): React.ReactNode {
  if (!text) return null;
  
  // Split into lines and filter out empty lines for counting meaningful content
  const lines = text.split('\n');
  const meaningfulLines: string[] = [];
  let lineCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Always include the current line if we haven't hit the limit
    if (lineCount < maxLines) {
      meaningfulLines.push(line);
      
      // Only count non-empty lines toward our limit
      if (trimmedLine.length > 0) {
        lineCount++;
      }
    } else {
      // If we've hit the limit, stop processing
      break;
    }
  }
  
  // Join the limited lines and render with full markdown support
  const limitedText = meaningfulLines.join('\n');
  const hasMore = lines.length > meaningfulLines.length || 
                  (lines.length === meaningfulLines.length && lines[lines.length - 1].trim() !== '');
  
  return (
    <div className="text-sm">
      {renderMarketingContent(limitedText, { 
        maxLines: undefined, // Don't double-limit since we already limited above
        showEllipsis: false, // We'll add our own ellipsis
        className: "" 
      })}
      {hasMore && (
        <div className="text-gray-400 text-xs mt-1">
          ...
        </div>
      )}
    </div>
  );
}
