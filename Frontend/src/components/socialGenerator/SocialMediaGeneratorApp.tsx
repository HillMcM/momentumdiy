import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrandPanel } from './BrandPanel';
import { ImageGrid } from './ImageGrid';
import { Header } from './Header';
import { AspectRatioSelector } from './AspectRatioSelector';
import { generateSocialGraphics, describeImageStyle, refineBrandVoice } from '../../services/socialGenerator/geminiService';
import { useLocalStorage } from '../../hooks/socialGenerator/useLocalStorage';
import { getAllImages, addImage } from '../../services/socialGenerator/dbService';
import { canGenerateImages, recordSession, getUsageStats, getUpgradeMessage } from '../../services/socialGenerator/usageService';
import type { BrandSettings, GeneratedImage, AspectRatio, BrandPreset } from '../../types/socialGenerator';
import { AspectRatios } from '../../constants/socialGenerator';

interface SocialMediaGeneratorAppProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

const SocialMediaGeneratorApp: React.FC<SocialMediaGeneratorAppProps> = ({
  isOpen,
  onClose,
  initialText = 'Your awesome post content goes here!'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [brandSettings, setBrandSettings] = useLocalStorage<BrandSettings>('brandSettings', {
    colors: ['#000000', '#FFFFFF', '#A9A9A9', '#808080'],
    logo: null,
    icon: null,
    font1: 'Inter',
    font2: 'Roboto',
    postText: initialText,
  });

  const [presets, setPresets] = useLocalStorage<BrandPreset[]>('brandPresets', []);
  const [selectedPresetId, setSelectedPresetId] = useLocalStorage<string>('selectedPresetId', '');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [brandVoice, setBrandVoice] = useLocalStorage<string>('brandVoice', 'A clean, modern, and professional style.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatios[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState(() => getUsageStats('basic'));
  const [userTier] = useState<'free' | 'basic' | 'pro' | 'enterprise'>('basic');
  
  useEffect(() => {
    const loadPersistedImages = async () => {
      try {
        const imagesFromDb = await getAllImages();
        imagesFromDb.sort((a, b) => b.createdAt - a.createdAt);
        setGeneratedImages(imagesFromDb);
      } catch (err) {
        console.error("Failed to load images from IndexedDB", err);
        setError("Could not load previously generated images.");
      }
    };
    loadPersistedImages();
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Return focus to the previously focused element when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup focus when component unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard event handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGenerate = useCallback(async () => {
    // Check usage limits before generating
    const usageCheck = canGenerateImages(userTier);
    if (!usageCheck.allowed) {
      setError(usageCheck.reason || 'Usage limit reached');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newImages = await generateSocialGraphics(brandSettings, aspectRatio, brandVoice);
      const newImageObjects: GeneratedImage[] = newImages.map(imgBase64 => ({
        id: crypto.randomUUID(),
        imageData: imgBase64,
        createdAt: Date.now(),
      }));

      for (const image of newImageObjects) {
        await addImage(image);
      }

      setGeneratedImages(prev => [...newImageObjects, ...prev]);
      
      // Record the session usage
      recordSession(newImages.length, userTier);
      
      // Update usage stats
      setUsageStats(getUsageStats(userTier));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [brandSettings, aspectRatio, brandVoice, userTier]);

  const handleSelectImage = useCallback(async (image: GeneratedImage) => {
    setIsRefining(true);
    setError(null);
    try {
      const styleDescription = await describeImageStyle(image.imageData);
      const newBrandVoice = await refineBrandVoice(brandVoice, styleDescription);
      setBrandVoice(newBrandVoice);
      // Optional: Add a success notification here
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while refining brand voice.');
    } finally {
      setIsRefining(false);
    }
  }, [brandVoice, setBrandVoice]);

  const handleSavePreset = useCallback((name: string) => {
    const existingPreset = presets.find(p => p.name === name);
    if (existingPreset) {
      if (!window.confirm(`A preset named "${name}" already exists. Overwrite it with the current settings?`)) {
        return;
      }
      const updatedPresets = presets.map(p => 
        p.id === existingPreset.id ? { ...p, settings: brandSettings } : p
      );
      setPresets(updatedPresets);
      setSelectedPresetId(existingPreset.id);
    } else {
      const newPreset: BrandPreset = {
        id: crypto.randomUUID(),
        name,
        settings: brandSettings,
      };
      setPresets(prev => [...prev, newPreset]);
      setSelectedPresetId(newPreset.id);
    }
  }, [brandSettings, presets, setPresets, setSelectedPresetId]);

  const handleLoadPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setBrandSettings(preset.settings);
      setSelectedPresetId(id);
    } else {
      setSelectedPresetId('');
    }
  }, [presets, setBrandSettings, setSelectedPresetId]);

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    if (selectedPresetId === id) {
      setSelectedPresetId('');
    }
  }, [selectedPresetId, setPresets, setSelectedPresetId]);

  useEffect(() => {
    if (!selectedPresetId) return;

    const preset = presets.find(p => p.id === selectedPresetId);
    if (preset && JSON.stringify(preset.settings) !== JSON.stringify(brandSettings)) {
      setSelectedPresetId('');
    }
  }, [brandSettings, presets, selectedPresetId, setSelectedPresetId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-generator-modal-title"
      aria-describedby="social-generator-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
        role="document"
        tabIndex={-1}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 id="social-generator-modal-title" className="text-2xl font-bold text-white">AI Social Media Generator</h2>
          <p id="social-generator-modal-description" className="sr-only">
            Create professional social media graphics using AI. Customize your brand settings, select aspect ratios, and generate images for different platforms.
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Usage Stats Display */}
        <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                Sessions used: <span className="text-white font-semibold">{usageStats.sessionsUsed}</span>
                {!usageStats.isUnlimited && (
                  <span className="text-gray-400"> / {usageStats.monthlyLimit}</span>
                )}
              </span>
              <span className="text-gray-300">
                Images per session: <span className="text-white font-semibold">{usageStats.imagesPerSession}</span>
              </span>
            </div>
            {!usageStats.isUnlimited && usageStats.sessionsRemaining <= 10 && (
              <div className="text-yellow-400 text-sm">
                {usageStats.sessionsRemaining > 0 
                  ? `${usageStats.sessionsRemaining} sessions remaining`
                  : 'Monthly limit reached'
                }
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-8 h-[calc(95vh-180px)] overflow-hidden">
          <aside className="lg:col-span-3 xl:col-span-3 overflow-y-auto">
            <BrandPanel
              settings={brandSettings}
              onSettingsChange={setBrandSettings}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              brandVoice={brandVoice}
              onBrandVoiceChange={setBrandVoice}
              presets={presets}
              selectedPresetId={selectedPresetId}
              onSavePreset={handleSavePreset}
              onLoadPreset={handleLoadPreset}
              onDeletePreset={handleDeletePreset}
            />
          </aside>
          <section className="lg:col-span-9 xl:col-span-9 flex flex-col gap-6 overflow-hidden">
            <AspectRatioSelector
              selected={aspectRatio}
              onSelect={setAspectRatio}
            />
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}
            <div className="flex-1 overflow-hidden">
              <ImageGrid
                images={generatedImages}
                onSelect={handleSelectImage}
                isLoading={isLoading}
                isRefining={isRefining}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaGeneratorApp;
