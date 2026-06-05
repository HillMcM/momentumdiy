import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Asset } from '../types';
import { logger } from '../utils/logger';

export default function SharedAssets() {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (accessCode) {
      loadSharedAssets();
    }
  }, [accessCode]);

  const loadSharedAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { apiService } = await import('../services/api');
      const response = await apiService.getSharedAssets(accessCode!);
      
      if (response.success && response.data) {
        setAssets(response.data.assets || []);
        setShareInfo(response.data.shareInfo || {});
      } else {
        setError(response.error || 'Failed to load shared assets.');
      }
    } catch (err: any) {
      logger.error('Error loading shared assets', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mb-4"></div>
        <p className="text-[#FFF1E7]/70 font-medium">Retrieving shared files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#1A1625] border border-red-500/20 max-w-md w-full p-8 rounded-2xl shadow-2xl">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-[#FFF1E7] text-2xl font-bold mb-3">Access Link Invalid</h2>
          <p className="text-[#FFF1E7]/60 mb-6 leading-relaxed">
            {error || 'This link may have expired, been deactivated, or is incorrect. Please verify the URL or contact the owner.'}
          </p>
          <a
            href="/"
            className="inline-block bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            Go to MomentumDIY
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A] text-[#FFF1E7]">
      {/* Top Header Branding */}
      <div className="border-b border-[#2A2438] bg-[#1A1625]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight" style={{ color: '#EF8E81' }}>
              Momentum<span className="text-[#FFF1E7]">DIY</span>
            </span>
            <span className="h-5 w-px bg-white/20"></span>
            <span className="text-sm font-medium text-white/60">Shared Folder</span>
          </div>
          {shareInfo && (
            <div className="text-right hidden sm:block">
              <span className="text-xs text-[#FFF1E7]/50 block">Shared via Secure Link</span>
              <span className="text-sm text-[#EF8E81] font-semibold">{shareInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Info Banner */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#1B1628]/95 to-[#2A2438]/95 border border-[#EF8E81]/20 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">{shareInfo?.name || 'Shared Assets'}</h1>
            <p className="text-[#FFF1E7]/70 text-sm">
              You've been granted access to view and download these files.
            </p>
          </div>
          {shareInfo?.expiresAt && (
            <div className="bg-[#EF8E81]/8 border border-[#EF8E81]/25 px-4 py-2 rounded-lg text-xs font-semibold text-[#EF8E81]">
              Expires: {new Date(shareInfo.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {assets.map(asset => {
              const isImage = (asset.fileType && asset.fileType.startsWith('image/')) ||
                              (asset.url && /\.(png|jpg|jpeg|gif|webp)$/i.test(asset.url));
              return (
                <div
                  key={asset.id}
                  className="bg-[#1A1625] rounded-xl border border-[#2A2438] overflow-hidden group hover:border-[#EF8E81] transition-all flex flex-col cursor-pointer"
                  onClick={() => setPreviewAsset(asset)}
                >
                  <div className="aspect-square bg-[#2A2438] relative overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">{getFileIcon(asset.fileType)}</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-white text-sm font-semibold truncate mb-0.5" title={asset.name}>
                        {asset.name}
                      </div>
                      {asset.description && (
                        <div className="text-[#FFF1E7]/60 text-xs truncate mb-2" title={asset.description}>
                          {asset.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2438]/50">
                      <span className="text-xs text-[#FFF1E7]/40 font-medium">
                        {formatFileSize(asset.fileSize)}
                      </span>
                      <a
                        href={asset.url}
                        download={asset.name}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#EF8E81] hover:text-[#ffb09e] transition-colors p-1"
                        title="Download file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1A1625] rounded-2xl border border-[#2A2438] p-16 text-center shadow-lg">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-white text-xl font-bold mb-2">Folder is Empty</h3>
            <p className="text-[#FFF1E7]/60">There are no files shared in this link.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <SharedPreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          formatSize={formatFileSize}
        />
      )}
    </div>
  );
}

function SharedPreviewModal({
  asset,
  onClose,
  formatSize
}: {
  asset: Asset;
  onClose: () => void;
  formatSize: (size: number) => string;
}) {
  const isImage = (asset.fileType && asset.fileType.startsWith('image/')) ||
                  (asset.url && /\.(png|jpg|jpeg|gif|webp)$/i.test(asset.url));

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="max-w-5xl w-full bg-[#1A1625] rounded-2xl overflow-hidden border border-[#2A2438]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#2A2438]">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-white font-bold truncate text-base">{asset.name}</h3>
            <div className="text-[#FFF1E7]/50 text-xs">
              {formatSize(asset.fileSize)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#FFF1E7]/60 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex items-center justify-center bg-[#0F0A1A]/40 min-h-[300px]">
          {isImage ? (
            <img
              src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-[65vh] mx-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">📄</div>
              <div className="text-white text-lg font-bold mb-2">{asset.name}</div>
              <div className="text-[#FFF1E7]/65 text-sm">Preview not available for this file type</div>
            </div>
          )}
        </div>

        {asset.description && (
          <div className="px-6 pb-4">
            <div className="bg-[#2A2438]/50 rounded-xl p-4 border border-[#3A3448]/55">
              <div className="text-[#FFF1E7]/50 text-xs font-semibold uppercase tracking-wider mb-1">Description</div>
              <div className="text-[#FFF1E7] text-sm leading-relaxed">{asset.description}</div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-[#2A2438] flex justify-end">
          <a
            href={asset.url}
            download={asset.name}
            className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-2.5 rounded-xl font-bold transition-all inline-flex items-center text-sm shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File
          </a>
        </div>
      </div>
    </div>
  );
}
