import type { MarketingModule } from '../../types';

interface LessonCardProps {
  module: MarketingModule;
}

export default function LessonCard({ module }: LessonCardProps) {
  // Simple HTML sanitization - remove script tags and dangerous attributes
  const sanitizeHtml = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  };

  const renderContent = (content: string) => {
    const sanitized = sanitizeHtml(content);

    // Add some basic styling for common patterns
    const styled = sanitized
      .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
      .replace(/(Theme:|Why this matters:|Pro Tip:)/gi, '<span class="text-purple-300 font-medium">$1</span>')
      .replace(/<p>/gi, '<p class="text-gray-300 mb-4 leading-relaxed">')
      .replace(/<ul>/gi, '<ul class="text-gray-300 mb-4 space-y-2 ml-6">')
      .replace(/<li>/gi, '<li class="list-disc">')
      .replace(/<strong>/gi, '<strong class="text-white font-semibold">')
      .replace(/<em>/gi, '<em class="text-purple-300">');

    return styled;
  };

  return (
    <div
      className="prose prose-invert max-w-none text-gray-300"
      dangerouslySetInnerHTML={{ __html: renderContent(module.content) }}
    />
  );
}
