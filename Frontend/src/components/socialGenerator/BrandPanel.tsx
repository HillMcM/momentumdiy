import React, { useCallback } from 'react';
import type { BrandSettings, BrandPreset, ImageAsset } from '../../types/socialGenerator';
import { Fonts } from '../../constants/socialGenerator';
import { UploadIcon } from './icons/UploadIcon';
import { Spinner } from './Spinner';

interface BrandPanelProps {
  settings: BrandSettings;
  onSettingsChange: React.Dispatch<React.SetStateAction<BrandSettings>>;
  onGenerate: () => void;
  isLoading: boolean;
  brandVoice: string;
  onBrandVoiceChange: (voice: string) => void;
  presets: BrandPreset[];
  selectedPresetId: string;
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
}

const FileInput: React.FC<{ label: string; value: ImageAsset | null; onChange: (asset: ImageAsset | null) => void }> = ({ label, value, onChange }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const mimeTypeMatch = result.match(/^data:(.*?);/);
        if (mimeTypeMatch && mimeTypeMatch[1]) {
          const mimeType = mimeTypeMatch[1];
          const data = result.split(',')[1];
          onChange({ mimeType, data });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md h-32 bg-gray-800/50 hover:border-indigo-500 transition-colors">
        {value ? (
          <div className="relative group">
            <img src={`data:${value.mimeType};base64,${value.data}`} alt={label} className="max-h-24 object-contain" />
            <div 
              onClick={() => onChange(null)} 
              className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              Remove
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-8 w-8 text-gray-500" />
            <div className="flex text-sm text-gray-400">
              <label htmlFor={`${label}-file-upload`} className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
                <span>Upload a file</span>
                <input id={`${label}-file-upload`} name={`${label}-file-upload`} type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const BrandPanel: React.FC<BrandPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  onGenerate, 
  isLoading, 
  brandVoice,
  onBrandVoiceChange,
  presets,
  selectedPresetId,
  onSavePreset,
  onLoadPreset,
  onDeletePreset
}) => {
  
  const updateSettings = <K extends keyof BrandSettings,>(key: K, value: BrandSettings[K]) => {
    onSettingsChange(prev => ({ ...prev, [key]: value }));
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...settings.colors] as [string, string, string, string];
    newColors[index] = value;
    updateSettings('colors', newColors);
  };
  
  const handleSaveClick = () => {
    const currentPresetName = selectedPresetId ? presets.find(p => p.id === selectedPresetId)?.name : '';
    const name = window.prompt('Enter preset name:', currentPresetName || 'My Brand');
    if (name) {
      onSavePreset(name);
    }
  };

  const handleDeleteClick = () => {
    if (selectedPresetId && window.confirm('Are you sure you want to delete this preset?')) {
      onDeletePreset(selectedPresetId);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 space-y-6 sticky top-8">
      <h2 className="text-lg font-semibold text-white">Brand Customization</h2>
      
      <div>
        <label htmlFor="preset-select" className="block text-sm font-medium text-gray-300 mb-2">Brand Presets</label>
        <div className="space-y-2">
          <select 
            id="preset-select" 
            value={selectedPresetId} 
            onChange={(e) => onLoadPreset(e.target.value)} 
            className="block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
          >
            <option value="">Custom Settings</option>
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>{preset.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleSaveClick}
                className="w-full text-center py-2 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-colors"
              >
                Save Current
              </button>
              <button 
                onClick={handleDeleteClick}
                disabled={!selectedPresetId}
                className="w-full text-center py-2 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-red-900/50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Selected
              </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Brand Colors</label>
        <div className="grid grid-cols-4 gap-3">
          {settings.colors.map((color, index) => (
            <input
              key={index}
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="w-full h-12 p-0 border-none rounded-md cursor-pointer bg-transparent"
              style={{'backgroundColor': color}}
              title={`Color ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <FileInput label="Logo" value={settings.logo} onChange={(val) => updateSettings('logo', val)} />
        <FileInput label="Icon" value={settings.icon} onChange={(val) => updateSettings('icon', val)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="font1" className="block text-sm font-medium text-gray-300">Primary Font</label>
          <select id="font1" value={settings.font1} onChange={(e) => updateSettings('font1', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white">
            {Fonts.map(font => <option key={font}>{font}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="font2" className="block text-sm font-medium text-gray-300">Secondary Font</label>
          <select id="font2" value={settings.font2} onChange={(e) => updateSettings('font2', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white">
            {Fonts.map(font => <option key={font}>{font}</option>)}
          </select>
        </div>
      </div>
      
      <div>
          <label htmlFor="postText" className="block text-sm font-medium text-gray-300">Post Text</label>
          <textarea
              id="postText"
              rows={4}
              value={settings.postText}
              onChange={(e) => updateSettings('postText', e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
          />
      </div>

      <div>
        <label htmlFor="brandVoice" className="block text-sm font-medium text-gray-300">Current Brand Voice</label>
        <textarea
            id="brandVoice"
            rows={3}
            value={brandVoice}
            onChange={(e) => onBrandVoiceChange(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., A clean, modern, and professional style."
        />
        <p className="mt-1 text-xs text-gray-400">The AI uses this to guide the visual style. It refines this when you select an image.</p>
      </div>
      
      <button 
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <><Spinner/> Generating...</> : 'Generate Graphics'}
      </button>
    </div>
  );
};