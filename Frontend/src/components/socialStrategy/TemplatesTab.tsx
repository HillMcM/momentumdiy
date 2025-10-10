import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Asset } from '../../types';
import { logger } from '../../utils/logger';

interface TemplatesTabProps {
  trackId: string;
}

const TEMPLATE_CATEGORIES = [
  { value: 'tip', label: 'Tips/Educational', icon: '💡' },
  { value: 'promo', label: 'Promotion/Sale', icon: '🎉' },
  { value: 'testimonial', label: 'Testimonial/Review', icon: '⭐' },
  { value: 'quote', label: 'Quote', icon: '💬' },
  { value: 'announcement', label: 'Announcement', icon: '📢' },
  { value: 'other', label: 'Other', icon: '📄' },
];

export default function TemplatesTab({ trackId }: TemplatesTabProps) {
  const [templates, setTemplates] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [trackId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('No user found when loading templates');
        return;
      }

      // Query assets with social-strategy-template tag
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .contains('tags', ['social-strategy-template'])
        .order('upload_date', { ascending: false });

      if (error) {
        logger.error('Error loading templates', error);
        return;
      }

      setTemplates((data || []) as Asset[]);
    } catch (error) {
      logger.error('Error in loadTemplates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('No user found when uploading');
        alert('Please log in to upload templates');
        setUploading(false);
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('assets')
        .upload(fileName, file);

      if (uploadError) {
        logger.error('Error uploading file', uploadError);
        
        if (uploadError.message.includes('Bucket not found')) {
          alert('Storage bucket not set up yet. Please create the "assets" bucket in Supabase Storage:\n\n1. Go to Supabase Dashboard\n2. Navigate to Storage\n3. Click "New Bucket"\n4. Name it "assets"\n5. Set to Public\n6. Save');
        } else {
          alert(`Upload failed: ${uploadError.message}`);
        }
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Create asset record
      const { error: insertError } = await supabase
        .from('assets')
        .insert({
          name: file.name,
          description: `${category} template`,
          category: 'template',
          file_type: file.type,
          file_size: file.size,
          url: publicUrl,
          tags: ['social-strategy-template', `template-${category}`, `track-${trackId}`],
          is_public: false
        });

      if (insertError) {
        logger.error('Error creating asset record', insertError);
        return;
      }

      // Reload templates
      await loadTemplates();
    } catch (error) {
      logger.error('Error in handleUpload', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteTemplate = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) {
        logger.error('Error deleting template', error);
        return;
      }

      await loadTemplates();
    } catch (error) {
      logger.error('Error in deleteTemplate', error);
    }
  };

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.tags.includes(`template-${selectedCategory}`));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Content Templates</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-4">
          Upload and manage your branded post templates. These reusable designs save time and keep your content consistent.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#EF8E81] text-white'
              : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
          }`}
        >
          All Templates ({templates.length})
        </button>
        {TEMPLATE_CATEGORIES.map(cat => {
          const count = templates.filter(t => t.tags.includes(`template-${cat.value}`)).length;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#EF8E81] text-white'
                  : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
              }`}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATE_CATEGORIES.map(cat => (
          <label
            key={cat.value}
            className="bg-[#2A2438] hover:bg-[#3A3448] border-2 border-dashed border-[#3A3448] hover:border-[#EF8E81] rounded-lg p-4 cursor-pointer transition-all text-center"
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-[#FFF1E7] text-xs font-medium mb-1">{cat.label}</div>
            <div className="text-[#FFF1E7]/40 text-xs">Click to upload</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, cat.value)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        ))}
      </div>

      {uploading && (
        <div className="bg-[#2A2438] rounded-lg p-4 text-center">
          <div className="text-[#FFF1E7]/60">Uploading template...</div>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
          <p className="text-[#FFF1E7]/60">Loading templates...</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-[#1A1625]/50 rounded-lg border border-[#2A2438] overflow-hidden group hover:border-[#EF8E81] transition-all"
            >
              <div
                className="aspect-square bg-[#2A2438] cursor-pointer relative"
                onClick={() => setPreviewAsset(template)}
              >
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[#FFF1E7] text-sm font-medium truncate mb-1">
                  {template.name}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[#FFF1E7]/40 text-xs">
                    {(template.file_size / 1024).toFixed(1)} KB
                  </div>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Delete template"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2A2438]/30 border border-[#3A3448] rounded-lg p-12 text-center">
          <div className="text-[#FFF1E7]/40 mb-4">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-[#FFF1E7] text-lg font-medium mb-2">No Templates Yet</h4>
          <p className="text-[#FFF1E7]/60 text-sm">
            {selectedCategory === 'all'
              ? 'Upload your first template using the category buttons above'
              : 'No templates in this category yet'}
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div className="max-w-4xl w-full bg-[#1A1625] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#2A2438]">
              <h4 className="text-[#FFF1E7] font-medium">{previewAsset.name}</h4>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <img
                src={previewAsset.url}
                alt={previewAsset.name}
                className="max-w-full max-h-[70vh] mx-auto"
              />
            </div>
            <div className="p-4 border-t border-[#2A2438] flex justify-end space-x-3">
              <a
                href={previewAsset.url}
                download={previewAsset.name}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

