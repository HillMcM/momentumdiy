import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Asset, AssetCategory } from '../types';
import { logger } from '../utils/logger';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';

type ViewMode = 'grid' | 'list';

export default function AssetLibrary() {
  const { showSuccess, showError, showWarning } = useNotificationHelpers();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showManageSharesModal, setShowManageSharesModal] = useState(false);

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    loadCategories();
    loadAssets();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Error loading categories', error);
        // Use default categories if database table doesn't exist yet
        setCategories([
          { id: 'logos', name: 'Logos', icon: '🎨', color: '#EF8E81' },
          { id: 'photos', name: 'Photos', icon: '📸', color: '#4ECDC4' },
          { id: 'documents', name: 'Documents', icon: '📄', color: '#45B7D1' },
          { id: 'videos', name: 'Videos', icon: '🎥', color: '#96CEB4' },
          { id: 'templates', name: 'Templates', icon: '📋', color: '#FFEAA7' },
          { id: 'other', name: 'Other', icon: '📁', color: '#95A5A6' }
        ]);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      logger.error('Error in loadCategories', error);
      // Fallback to default categories
      setCategories([
        { id: 'logos', name: 'Logos', icon: '🎨', color: '#EF8E81' },
        { id: 'photos', name: 'Photos', icon: '📸', color: '#4ECDC4' },
        { id: 'documents', name: 'Documents', icon: '📄', color: '#45B7D1' },
        { id: 'videos', name: 'Videos', icon: '🎥', color: '#96CEB4' },
        { id: 'templates', name: 'Templates', icon: '📋', color: '#FFEAA7' },
        { id: 'other', name: 'Other', icon: '📁', color: '#95A5A6' }
      ]);
    }
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('No user found when loading assets');
        return;
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        logger.error('Error loading assets', error);
        return;
      }

      setAssets((data || []) as Asset[]);
    } catch (error) {
      logger.error('Error in loadAssets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, category: string, description: string) => {
    if (file.size > 10 * 1024 * 1024) {
      showWarning('File Too Large', 'File is too large. Maximum size is 10MB.');
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showError('Authentication Required', 'Please log in to upload files');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        logger.error('Error uploading file', uploadError);
        showError('Upload Failed', `Upload failed: ${uploadError.message}`);
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
          description: description || '',
          category: category,
          file_type: file.type,
          file_size: file.size,
          url: publicUrl,
          tags: [],
          is_public: true
        });

      if (insertError) {
        logger.error('Error creating asset record', insertError);
        showError('Save Failed', `Failed to save asset: ${insertError.message}`);
        await supabase.storage.from('assets').remove([fileName]);
        return;
      }

      setShowUploadModal(false);
      showSuccess('Asset Uploaded', 'Asset uploaded successfully!');
      await loadAssets();
    } catch (error) {
      logger.error('Error in handleUpload', error);
      showError('Upload Error', 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.name}"?`)) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) {
        logger.error('Error deleting asset from DB', dbError);
        showError('Delete Failed', `Failed to delete: ${dbError.message}`);
        return;
      }

      showSuccess('Asset Deleted', 'Asset deleted successfully.');

      // Try to delete from storage (may fail if not stored there)
      if (asset.url && asset.url.includes('supabase')) {
        const pathParts = asset.url.split('/');
        const fileName = pathParts.slice(-2).join('/'); // user_id/filename.ext
        await supabase.storage.from('assets').remove([fileName]);
      }

      await loadAssets();
    } catch (error) {
      logger.error('Error in deleteAsset', error);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      (asset.name && asset.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.icon || '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return '📁';
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      {/* Header */}
      <div className="bg-[#1A1625] border-b border-[#2A2438] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#FFF1E7] mb-2">
                Asset Library
              </h1>
              <p className="text-[#FFF1E7]/60">
                Manage your images, templates, and media files
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-5 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.828-2.414m0 0a3 3 0 10-1.156-2.585c0 .179.016.354.047.525l-4.83 2.415a3 3 0 100 4.636l4.83 2.415a3 3 0 101.155-2.585c0-.18-.015-.354-.047-.525" />
                </svg>
                {selectedAssetIds.length > 0 
                  ? `Share Selected (${selectedAssetIds.length})` 
                  : 'Share Library'}
              </button>
              <button
                onClick={() => setShowManageSharesModal(true)}
                className="bg-transparent border border-[#EF8E81] hover:bg-[#EF8E81]/10 text-[#EF8E81] px-5 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Manage Shares
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#EF8E81]/20 hover:bg-[#EF8E81]/30 border border-[#EF8E81]/30 text-[#FFF1E7] px-5 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Asset
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#EF8E81] text-white'
                    : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#EF8E81] text-white'
                    : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-[#1A1625] border-b border-[#2A2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#EF8E81] text-white'
                  : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
              }`}
            >
              All ({assets.length})
            </button>
            {categories.map(cat => {
              const count = assets.filter(a => a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#EF8E81] text-white'
                      : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
                  }`}
                >
                  {cat.icon} {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedAssetIds.length > 0 && (
          <div className="bg-[#1A1625] border border-[#EF8E81]/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-[#FFF1E7] text-sm">
              Selected <strong className="text-[#EF8E81]">{selectedAssetIds.length}</strong> assets to share.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAssetIds([])}
                className="text-xs text-[#FFF1E7]/60 hover:text-white px-3 py-2 rounded-lg"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white text-xs px-4 py-2 rounded-lg font-medium"
              >
                Share Selected
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
            <p className="text-[#FFF1E7]/60">Loading assets...</p>
          </div>
        ) : filteredAssets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  categoryIcon={getCategoryIcon(asset.category)}
                  onPreview={() => setPreviewAsset(asset)}
                  onDelete={() => deleteAsset(asset)}
                  isSelected={selectedAssetIds.includes(asset.id)}
                  onToggleSelect={() => toggleSelectAsset(asset.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map(asset => (
                <AssetListItem
                  key={asset.id}
                  asset={asset}
                  fileIcon={getFileIcon(asset.fileType)}
                  formatSize={formatFileSize}
                  onPreview={() => setPreviewAsset(asset)}
                  onDelete={() => deleteAsset(asset)}
                  isSelected={selectedAssetIds.includes(asset.id)}
                  onToggleSelect={() => toggleSelectAsset(asset.id)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-12 text-center">
            <div className="text-[#FFF1E7]/40 mb-4">
              <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#FFF1E7] text-xl font-medium mb-2">No Assets Found</h3>
            <p className="text-[#FFF1E7]/60 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search'
                : 'Upload your first asset to get started'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload First Asset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          categories={categories}
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
          uploading={uploading}
        />
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <PreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          formatSize={formatFileSize}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          selectedAssetIds={selectedAssetIds}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setSelectedAssetIds([]);
          }}
        />
      )}

      {/* Manage Share Links Modal */}
      {showManageSharesModal && (
        <ManageSharesModal
          onClose={() => setShowManageSharesModal(false)}
        />
      )}
    </div>
  );
}

// Asset Card Component (Grid View)
function AssetCard({
  asset,
  categoryIcon,
  onPreview,
  onDelete,
  isSelected,
  onToggleSelect
}: {
  asset: Asset;
  categoryIcon: string;
  onPreview: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  // Check if it's an image - be flexible with the check
  const isImage = (asset.fileType && asset.fileType.startsWith('image/')) ||
                  (asset.url && (asset.url.includes('.png') || asset.url.includes('.jpg') || asset.url.includes('.jpeg') || asset.url.includes('.gif') || asset.url.includes('.webp'))) ||
                  (asset.name && /\.(png|jpg|jpeg|gif|webp)$/i.test(asset.name));

  return (
    <div className={`bg-[#1A1625] rounded-lg border overflow-hidden group hover:border-[#EF8E81] transition-all relative ${
      isSelected ? 'border-[#EF8E81] ring-1 ring-[#EF8E81]' : 'border-[#2A2438]'
    }`}>
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="w-4 h-4 rounded border-[#2A2438] text-[#EF8E81] focus:ring-[#EF8E81] cursor-pointer"
        />
      </div>
      
      <div
        className="aspect-square bg-[#2A2438] cursor-pointer relative overflow-hidden"
        onClick={onPreview}
      >
        {isImage ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {categoryIcon}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
          <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
      <div className="p-3">
        <div className="text-[#FFF1E7] text-sm font-medium truncate mb-1" title={asset.name}>
          {asset.name}
        </div>
        {asset.description && (
          <div className="text-[#FFF1E7]/60 text-xs truncate mb-2" title={asset.description}>
            {asset.description}
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#FFF1E7]/40">
            {formatFileSize(asset.fileSize)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Asset List Item Component (List View)
function AssetListItem({
  asset,
  fileIcon,
  formatSize,
  onPreview,
  onDelete,
  isSelected,
  onToggleSelect
}: {
  asset: Asset;
  fileIcon: string;
  formatSize: (size: number) => string;
  onPreview: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div
      className={`bg-[#1A1625] rounded-lg border p-4 hover:border-[#EF8E81] transition-all cursor-pointer ${
        isSelected ? 'border-[#EF8E81] ring-1 ring-[#EF8E81]' : 'border-[#2A2438]'
      }`}
      onClick={onPreview}
    >
      <div className="flex items-center gap-4">
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-[#2A2438] text-[#EF8E81] focus:ring-[#EF8E81] cursor-pointer"
          />
        </div>
        <div className="text-4xl flex-shrink-0">
          {fileIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#FFF1E7] font-medium truncate">{asset.name}</div>
          {asset.description && (
            <div className="text-[#FFF1E7]/60 text-sm truncate">{asset.description}</div>
          )}
          <div className="flex items-center gap-4 mt-1 text-xs text-[#FFF1E7]/40">
            <span>{formatSize(asset.fileSize)}</span>
            <span>{new Date(asset.uploadDate).toLocaleDateString()}</span>
            {asset.tags && asset.tags.length > 0 && (
              <span className="flex gap-1">
                {asset.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="bg-[#2A2438] px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={asset.url}
            download={asset.name}
            onClick={(e) => e.stopPropagation()}
            className="text-[#10b981] hover:text-[#0ea370] transition-colors p-2"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-400 hover:text-red-300 transition-colors p-2"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({
  categories,
  onUpload,
  onClose,
  uploading
}: {
  categories: AssetCategory[];
  onUpload: (file: File, category: string, description: string) => Promise<void>;
  onClose: () => void;
  uploading: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, category, description);
    setSelectedFile(null);
    setDescription('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-[#1A1625] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#2A2438]">
          <h2 className="text-2xl font-bold text-[#FFF1E7]">Upload Asset</h2>
          <button
            onClick={onClose}
            className="text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-[#EF8E81] bg-[#EF8E81]/10'
                : 'border-[#3A3448] hover:border-[#EF8E81]/50'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="text-4xl">{selectedFile.type.startsWith('image/') ? '🖼️' : '📁'}</div>
                <div className="text-[#FFF1E7] font-medium">{selectedFile.name}</div>
                <div className="text-[#FFF1E7]/60 text-sm">
                  {formatFileSize(selectedFile.size)}
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-[#EF8E81] hover:text-[#E67A6E] text-sm"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <svg className="w-12 h-12 mx-auto text-[#FFF1E7]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-[#FFF1E7]">
                  Drag and drop your file here, or{' '}
                  <label className="text-[#EF8E81] hover:text-[#E67A6E] cursor-pointer">
                    browse
                    <input
                      type="file"
                      onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[#FFF1E7]/40 text-sm">
                  Maximum file size: 10MB
                </div>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-[#FFF1E7] font-medium block mb-2">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    category === cat.id
                      ? 'border-[#EF8E81] bg-[#EF8E81]/10'
                      : 'border-[#2A2438] hover:border-[#3A3448]'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-[#FFF1E7] text-sm">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[#FFF1E7] font-medium block mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this asset..."
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[#2A2438]">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-3 text-[#FFF1E7]/60 hover:text-[#FFF1E7] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Preview Modal Component
function PreviewModal({
  asset,
  onClose,
  formatSize
}: {
  asset: Asset;
  onClose: () => void;
  formatSize: (size: number) => string;
}) {
  // Check if it's an image - be flexible with the check
  const isImage = (asset.fileType && asset.fileType.startsWith('image/')) ||
                  (asset.url && (asset.url.includes('.png') || asset.url.includes('.jpg') || asset.url.includes('.jpeg') || asset.url.includes('.gif') || asset.url.includes('.webp'))) ||
                  (asset.name && /\.(png|jpg|jpeg|gif|webp)$/i.test(asset.name));

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="max-w-6xl w-full bg-[#1A1625] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#2A2438]">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-[#FFF1E7] font-medium truncate">{asset.name}</h3>
            <div className="text-[#FFF1E7]/60 text-sm">
              {formatSize(asset.fileSize)} • Uploaded {new Date(asset.uploadDate).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isImage ? (
            <img
              src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-[70vh] mx-auto rounded-lg"
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <div className="text-[#FFF1E7] text-lg mb-2">{asset.name}</div>
              <div className="text-[#FFF1E7]/60">Preview not available for this file type</div>
            </div>
          )}
        </div>

        {asset.description && (
          <div className="px-6 pb-4">
            <div className="bg-[#2A2438] rounded-lg p-4">
              <div className="text-[#FFF1E7]/60 text-sm mb-1">Description</div>
              <div className="text-[#FFF1E7]">{asset.description}</div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-[#2A2438] flex justify-end gap-3">
          <a
            href={asset.url}
            download={asset.name}
            className="bg-[#10b981] hover:bg-[#0ea370] text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Share Modal Component
function ShareModal({
  selectedAssetIds,
  onClose,
  onSuccess
}: {
  selectedAssetIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [expiryOption, setExpiryOption] = useState('never');
  const [customExpiry, setCustomExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const { showSuccess, showError } = useNotificationHelpers();

  const handleCreateShare = async () => {
    if (!name.trim()) {
      showError('Required Field', 'Please enter a name for the share link.');
      return;
    }

    setLoading(true);
    try {
      let expiresAt: string | undefined = undefined;
      const now = new Date();
      if (expiryOption === '24h') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7d') {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '30d') {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === 'custom' && customExpiry) {
        expiresAt = new Date(customExpiry).toISOString();
      }

      const { apiService } = await import('../services/api');
      const response = await apiService.createAssetShareLink({
        name,
        email: email || undefined,
        expiresAt,
        sharedAssetIds: selectedAssetIds.length > 0 ? selectedAssetIds : null
      });

      if (response.success && response.data) {
        const link = `${window.location.origin}/shared/assets/${response.data.access_code}`;
        setGeneratedLink(link);
        showSuccess('Share Link Created', 'You can now copy the link.');
        onSuccess();
      } else {
        showError('Error', response.error || 'Failed to create share link.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    showSuccess('Copied to Clipboard', 'Share link copied successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-md w-full bg-[#1A1625] rounded-lg overflow-hidden border border-[#2A2438]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#2A2438]">
          <h2 className="text-2xl font-bold text-[#FFF1E7]">Share Assets</h2>
          <button onClick={onClose} className="text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {generatedLink ? (
            <div className="space-y-4">
              <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/30 p-4 rounded-lg">
                <p className="text-sm text-[#FFF1E7] mb-2 font-medium">Link Generated Successfully!</p>
                <p className="text-xs text-[#FFF1E7]/70">
                  Anyone with this link can view and download the shared files.
                </p>
              </div>
              <div>
                <label className="text-[#FFF1E7] text-xs font-semibold block mb-1">Shared Link URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-[#2A2438] text-[#FFF1E7] text-sm px-3 py-2 rounded-lg border border-[#3A3448] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 bg-[#2A2438] hover:bg-[#3A3448] text-[#FFF1E7] px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#2A2438] p-3 rounded-lg">
                <span className="text-[#FFF1E7] text-sm font-semibold">
                  Scope: {selectedAssetIds.length > 0 ? `${selectedAssetIds.length} Selected Assets` : 'Entire Library'}
                </span>
              </div>

              <div>
                <label className="text-[#FFF1E7] text-sm font-medium block mb-1">Link Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Logo pack for contractor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                />
              </div>

              <div>
                <label className="text-[#FFF1E7] text-sm font-medium block mb-1">Recipient Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#FFF1E7] text-sm font-medium block mb-1">Link Expiry</label>
                <select
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value)}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none"
                >
                  <option value="never">Never Expires</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="custom">Custom Date...</option>
                </select>
              </div>

              {expiryOption === 'custom' && (
                <div>
                  <label className="text-[#FFF1E7] text-sm font-medium block mb-1">Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2438]">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 text-[#FFF1E7]/60 hover:text-[#FFF1E7] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShare}
                  disabled={loading || !name.trim()}
                  className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Creating...' : 'Generate Share Link'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Manage Share Links Modal Component
function ManageSharesModal({
  onClose
}: {
  onClose: () => void;
}) {
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotificationHelpers();

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const { apiService } = await import('../services/api');
      const response = await apiService.getAssetShareLinks();
      if (response.success && response.data) {
        setShareLinks(response.data);
      } else {
        showError('Error', response.error || 'Failed to load share links.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Error occurred loading links.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (linkId: string, currentActive: boolean) => {
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.updateAssetShareLink(linkId, { is_active: !currentActive });
      if (response.success) {
        showSuccess('Link Updated', `Link has been ${!currentActive ? 'activated' : 'deactivated'}.`);
        setShareLinks(prev => prev.map(lnk => lnk.id === linkId ? { ...lnk, is_active: !currentActive } : lnk));
      } else {
        showError('Error', response.error || 'Failed to update link.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Error occurred.');
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this share link? This cannot be undone and any users using this link will immediately lose access.')) return;

    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.deleteAssetShareLink(linkId);
      if (response.success) {
        showSuccess('Link Revoked', 'Share link has been deleted.');
        setShareLinks(prev => prev.filter(lnk => lnk.id !== linkId));
      } else {
        showError('Error', response.error || 'Failed to revoke link.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Error occurred.');
    }
  };

  const handleCopyLink = (accessCode: string) => {
    const link = `${window.location.origin}/shared/assets/${accessCode}`;
    navigator.clipboard.writeText(link);
    showSuccess('Copied to Clipboard', 'Link copied successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-3xl w-full bg-[#1A1625] rounded-lg overflow-hidden border border-[#2A2438]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#2A2438]">
          <h2 className="text-2xl font-bold text-[#FFF1E7]">Manage Share Links</h2>
          <button onClick={onClose} className="text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mx-auto mb-2"></div>
              <p className="text-[#FFF1E7]/60 text-sm">Loading share links...</p>
            </div>
          ) : shareLinks.length > 0 ? (
            <div className="space-y-3">
              {shareLinks.map(link => {
                const expired = link.expires_at && new Date(link.expires_at) < new Date();
                return (
                  <div key={link.id} className="bg-[#2A2438] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#3A3448]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#FFF1E7] font-semibold truncate block">
                          {link.name}
                        </span>
                        {!link.is_active && (
                          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30">
                            Inactive
                          </span>
                        )}
                        {expired && (
                          <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/30">
                            Expired
                          </span>
                        )}
                        {link.is_active && !expired && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#FFF1E7]/60 space-y-0.5">
                        {link.email && <p>Shared with: <strong>{link.email}</strong></p>}
                        <p>
                          Scope: {link.shared_asset_ids && link.shared_asset_ids.length > 0 
                            ? `${link.shared_asset_ids.length} specific assets` 
                            : 'Entire library'}
                        </p>
                        <p>
                          Expires: {link.expires_at 
                            ? new Date(link.expires_at).toLocaleString() 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleCopyLink(link.access_code)}
                        className="text-xs bg-[#EF8E81]/20 hover:bg-[#EF8E81]/30 text-[#EF8E81] border border-[#EF8E81]/30 px-3 py-2 rounded-lg transition-colors"
                        disabled={expired || !link.is_active}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleToggleActive(link.id, link.is_active)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                          link.is_active
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30'
                        }`}
                        disabled={expired}
                      >
                        {link.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleRevokeLink(link.id)}
                        className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 px-3 py-2 rounded-lg transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#FFF1E7]/60">
              No share links generated yet.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#2A2438] flex justify-end">
          <button onClick={onClose} className="bg-[#2A2438] hover:bg-[#3A3448] text-[#FFF1E7] px-6 py-3 rounded-lg font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

