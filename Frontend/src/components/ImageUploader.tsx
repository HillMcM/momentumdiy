import { useState, useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  currentImage?: string | null;
  onImageChange: (base64: string) => void;
  maxSizeKB?: number;
}

export default function ImageUploader({ 
  label, 
  currentImage, 
  onImageChange, 
  maxSizeKB = 500 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = async (file: File) => {
    setError(null);

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or SVG file');
      return;
    }

    // Check file size
    if (file.size > maxSizeKB * 1024) {
      setError(`File size must be less than ${maxSizeKB}KB`);
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageChange(base64);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '0.85rem', 
        fontWeight: 500,
        marginBottom: '0.5rem',
        color: '#FFF1E7',
        opacity: 0.9
      }}>
        {label}
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#EF8E81' : 'rgba(255, 255, 255, 0.2)'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(239, 142, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          transition: 'all 0.2s',
          position: 'relative'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '8px',
                margin: '0 auto',
                display: 'block'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: 'calc(50% - 100px - 8px)',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
            <div style={{ fontSize: '0.9rem', color: '#FFF1E7', marginBottom: '0.25rem' }}>
              Drag & drop your logo here
            </div>
            <div style={{ fontSize: '0.75rem', color: '#FFF1E7', opacity: 0.6 }}>
              or click to browse (PNG, JPG, SVG • Max {maxSizeKB}KB)
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#EF4444',
          fontSize: '0.85rem'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

