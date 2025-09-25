import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mb-3 mt-5 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">{children}</h4>
          ),
          // Customize paragraph styles
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
          ),
          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300">{children}</li>
          ),
          // Customize code styles
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[#2A243E] text-[#EF8E81] px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-[#1B1628] text-gray-300 p-4 rounded-lg border border-[#2A243E] overflow-x-auto text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#1B1628] p-4 rounded-lg border border-[#2A243E] overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          // Customize blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#EF8E81] pl-4 italic text-gray-400 mb-4">
              {children}
            </blockquote>
          ),
          // Customize link styles
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-[#EF8E81] hover:text-[#D4AF37] underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Customize strong/bold styles
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          // Customize emphasis/italic styles
          em: ({ children }) => (
            <em className="italic text-gray-200">{children}</em>
          ),
          // Customize table styles
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-[#2A243E] rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#2A243E]">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-[#1B1628]">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-[#2A243E]">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-300">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
