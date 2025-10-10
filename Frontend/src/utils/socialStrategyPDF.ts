import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SocialMediaStrategy } from '../types';

export async function exportStrategyToPDF(strategy: SocialMediaStrategy, businessName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Colors from design system
  const coralColor = '#EF8E81';
  const creamColor = '#FFF1E7';
  const darkBg = '#0F0A1A';
  
  // Cover Page
  doc.setFillColor(15, 10, 26); // #0F0A1A
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
  
  doc.setTextColor(255, 241, 231); // #FFF1E7
  doc.setFontSize(32);
  doc.text('Social Media Strategy', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setTextColor(239, 142, 129); // #EF8E81
  doc.text(businessName, pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(255, 241, 231);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 120, { align: 'center' });
  
  // Add new page for content
  doc.addPage();
  
  let yPos = 20;
  
  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.setTextColor(239, 142, 129); // Coral
    doc.text(title, margin, yPos);
    yPos += 10;
  };
  
  // Helper function to add regular text
  const addText = (text: string, indent = 0) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5 + 3;
  };
  
  // Content Pillars Section
  if (strategy.contentPillars && strategy.contentPillars.length > 0) {
    addSectionHeader('Content Pillars');
    
    strategy.contentPillars.forEach((pillar, index) => {
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`${index + 1}. ${pillar.name}`, margin + 5, yPos);
      yPos += 6;
      
      if (pillar.description) {
        addText(pillar.description, 10);
      }
      
      if (pillar.exampleIdeas && pillar.exampleIdeas.filter(Boolean).length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text('Example Ideas:', margin + 10, yPos);
        yPos += 5;
        
        pillar.exampleIdeas.filter(Boolean).forEach(idea => {
          addText(`• ${idea}`, 15);
        });
      }
      
      yPos += 5;
    });
  }
  
  // Brand Voice Section
  if (strategy.brandVoice && (strategy.brandVoice.tone?.length || strategy.brandVoice.adjectives?.length)) {
    addSectionHeader('Brand Voice');
    
    if (strategy.brandVoice.tone && strategy.brandVoice.tone.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Tone:', margin + 5, yPos);
      yPos += 6;
      addText(strategy.brandVoice.tone.join(', '), 10);
    }
    
    if (strategy.brandVoice.adjectives && strategy.brandVoice.adjectives.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Adjectives:', margin + 5, yPos);
      yPos += 6;
      addText(strategy.brandVoice.adjectives.join(', '), 10);
    }
    
    if (strategy.brandVoice.personalityNotes) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Personality Notes:', margin + 5, yPos);
      yPos += 6;
      addText(strategy.brandVoice.personalityNotes, 10);
    }
    
    if (strategy.brandVoice.styleGuide) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Style Guide:', margin + 5, yPos);
      yPos += 6;
      addText(strategy.brandVoice.styleGuide, 10);
    }
  }
  
  // Visual Style Section
  if (strategy.visualStyle && (strategy.visualStyle.colors?.length || strategy.visualStyle.fonts)) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    addSectionHeader('Visual Style');
    
    if (strategy.visualStyle.colors && strategy.visualStyle.colors.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Brand Colors:', margin + 5, yPos);
      yPos += 6;
      
      strategy.visualStyle.colors.forEach(color => {
        // Draw color square
        const rgb = hexToRgb(color);
        if (rgb) {
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          doc.rect(margin + 10, yPos - 3, 8, 8, 'F');
        }
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(color.toUpperCase(), margin + 22, yPos + 3);
        yPos += 10;
      });
      
      yPos += 5;
    }
    
    if (strategy.visualStyle.fonts && (strategy.visualStyle.fonts.heading || strategy.visualStyle.fonts.body)) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Fonts:', margin + 5, yPos);
      yPos += 6;
      
      if (strategy.visualStyle.fonts.heading) {
        addText(`Heading: ${strategy.visualStyle.fonts.heading}`, 10);
      }
      if (strategy.visualStyle.fonts.body) {
        addText(`Body: ${strategy.visualStyle.fonts.body}`, 10);
      }
    }
    
    if (strategy.visualStyle.imageStyle) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Image Style:', margin + 5, yPos);
      yPos += 6;
      addText(strategy.visualStyle.imageStyle, 10);
    }
  }
  
  // Posting Schedule Section
  if (strategy.postingSchedule && strategy.postingSchedule.days?.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    addSectionHeader('Posting Schedule');
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Posting ${strategy.postingSchedule.frequency || strategy.postingSchedule.days.length} times per week`, margin + 5, yPos);
    yPos += 8;
    
    // Create table data
    const scheduleData = strategy.postingSchedule.days.map(day => {
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const postType = strategy.postingSchedule.postTypes?.[day] || 'Not assigned';
      const typeLabel = postType === 'educate' ? 'Educate' : postType === 'promote' ? 'Promote' : postType === 'connect' ? 'Connect' : postType;
      return [dayLabel, typeLabel];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Day', 'Post Type']],
      body: scheduleData,
      theme: 'grid',
      headStyles: {
        fillColor: [239, 142, 129],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Metrics Section
  if (strategy.baselineMetrics || strategy.currentMetrics) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    addSectionHeader('Metrics Overview');
    
    const metricsData = [
      [
        'Followers',
        strategy.baselineMetrics?.followers?.toString() || '0',
        strategy.currentMetrics?.followers?.toString() || '0',
        calculateGrowth(strategy.baselineMetrics?.followers || 0, strategy.currentMetrics?.followers || 0)
      ],
      [
        'Avg. Likes',
        strategy.baselineMetrics?.avgLikes?.toString() || '0',
        strategy.currentMetrics?.avgLikes?.toString() || '0',
        calculateGrowth(strategy.baselineMetrics?.avgLikes || 0, strategy.currentMetrics?.avgLikes || 0)
      ],
      [
        'Avg. Comments',
        strategy.baselineMetrics?.avgComments?.toString() || '0',
        strategy.currentMetrics?.avgComments?.toString() || '0',
        calculateGrowth(strategy.baselineMetrics?.avgComments || 0, strategy.currentMetrics?.avgComments || 0)
      ],
      [
        'Story Views',
        strategy.baselineMetrics?.storyViews?.toString() || '0',
        strategy.currentMetrics?.storyViews?.toString() || '0',
        calculateGrowth(strategy.baselineMetrics?.storyViews || 0, strategy.currentMetrics?.storyViews || 0)
      ]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Baseline', 'Current', 'Growth']],
      body: metricsData,
      theme: 'grid',
      headStyles: {
        fillColor: [239, 142, 129],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Collaborators Section
  if (strategy.collaborators && strategy.collaborators.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    addSectionHeader('Team Collaborators');
    
    const collabData = strategy.collaborators.map(collab => [
      collab.name,
      collab.role,
      collab.email
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Role', 'Email']],
      body: collabData,
      theme: 'grid',
      headStyles: {
        fillColor: [239, 142, 129],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: margin, right: margin }
    });
  }
  
  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`${businessName.replace(/[^a-z0-9]/gi, '_')}_Social_Strategy.pdf`);
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function calculateGrowth(baseline: number, current: number): string {
  if (!baseline || baseline === 0) return 'N/A';
  const growth = Math.round(((current - baseline) / baseline) * 100);
  return growth > 0 ? `+${growth}%` : `${growth}%`;
}

