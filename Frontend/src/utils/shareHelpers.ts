/**
 * Utilities for sharing accomplishments and progress to social media
 */

export interface ShareableContent {
  taskName?: string;
  trackName?: string;
  progress?: number;
  weekNumber?: number;
  totalTasks?: number;
  completedTasks?: number;
}

/**
 * Generate a shareable tweet/message for task completion
 */
export function generateTaskShareMessage(content: ShareableContent): string {
  const messages = [
    `✅ Just completed "${content.taskName}"! Progress feels good. 🚀`,
    `🎉 Checked off "${content.taskName}" - small wins add up! 💪`,
    `Just finished "${content.taskName}" - momentum is building! 🌟`,
  ];
  
  if (content.trackName) {
    return `${messages[Math.floor(Math.random() * messages.length)]} Working through my ${content.trackName} marketing journey with @MomentumDIY`;
  }
  
  return `${messages[Math.floor(Math.random() * messages.length)]} #Productivity #SmallBusiness`;
}

/**
 * Generate a shareable message for progress milestone
 */
export function generateProgressShareMessage(content: ShareableContent): string {
  if (!content.trackName || !content.progress) {
    return generateTaskShareMessage(content);
  }
  
  const messages = [
    `I'm ${content.progress}% through my ${content.trackName} marketing track! 🎯 Progress feels amazing.`,
    `${content.progress}% complete on my ${content.trackName} journey. The momentum is real! 🚀`,
    `Just hit ${content.progress}% on my ${content.trackName} track - celebrating the progress! 🎉`,
  ];
  
  if (content.weekNumber) {
    return `${messages[Math.floor(Math.random() * messages.length)]} Currently on Week ${content.weekNumber}! 💪`;
  }
  
  return `${messages[Math.floor(Math.random() * messages.length)]} #MarketingJourney @MomentumDIY`;
}

/**
 * Share content to Twitter/X
 */
export function shareToTwitter(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

/**
 * Share content to Facebook
 */
export function shareToFacebook(text: string, url?: string): void {
  const shareUrl = url || window.location.href;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

/**
 * Share content to LinkedIn
 */
export function shareToLinkedIn(text: string, url?: string): void {
  const shareUrl = url || window.location.href;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`;
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Open share dialog with options
 */
export function openShareDialog(content: ShareableContent, onCopySuccess?: () => void): void {
  const message = content.taskName 
    ? generateTaskShareMessage(content)
    : generateProgressShareMessage(content);
  
  // Check if Web Share API is available (mobile)
  if (navigator.share) {
    navigator.share({
      title: 'My Progress on MomentumDIY',
      text: message,
      url: window.location.href,
    }).catch(() => {
      // User cancelled or error occurred, fall back to copy
      copyToClipboard(message).then((success) => {
        if (success && onCopySuccess) {
          onCopySuccess();
        }
      });
    });
  } else {
    // Desktop: show options or copy to clipboard
    copyToClipboard(message).then((success) => {
      if (success && onCopySuccess) {
        onCopySuccess();
      }
    });
  }
}


