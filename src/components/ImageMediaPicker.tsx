import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Check, Eye } from 'lucide-react';

interface ImageMediaPickerProps {
  id?: string;
  label: string;
  subLabel?: string;
  value: string;
  caption?: string;
  onChangeUrl: (url: string) => void;
  onChangeCaption?: (caption: string) => void;
  aspectRatioHint?: string;
  placeholder?: string;
  previewHeight?: string;
}

export const ImageMediaPicker: React.FC<ImageMediaPickerProps> = ({
  id,
  label,
  subLabel,
  value,
  caption,
  onChangeUrl,
  onChangeCaption,
  aspectRatioHint = 'Recommended: JPG, PNG, WebP (Max 5MB)',
  placeholder = 'Paste direct image URL or upload from device',
  previewHeight = 'h-32'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Convert file to base64 DataURL so it persists immediately and displays locally
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChangeUrl(e.target.result as string);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChangeUrl('');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id={id} className="space-y-2.5 p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-slate-900 text-xs block">{label}</label>
          {subLabel && <span className="text-[10px] text-slate-500">{subLabel}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isUrlMode ? <Upload className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
            <span>{isUrlMode ? 'Choose from Gallery' : 'Paste Web URL'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
              title="Remove photo"
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input for Device Gallery / File Manager */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Visual Dropzone / Upload Target */}
      {!value ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/80'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Click to choose photo from Gallery or File Manager
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              or drag &amp; drop your photo directly here • {aspectRatioHint}
            </p>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
          <div className={`w-full ${previewHeight} flex items-center justify-center overflow-hidden bg-slate-950`}>
            {!previewError ? (
              <img
                src={value}
                alt="Selected Preview"
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-3 text-slate-400 text-xs">
                <ImageIcon className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                <span>Image loaded from URL / file</span>
              </div>
            )}
          </div>

          {/* Quick Overlay Action on Preview */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded font-mono flex items-center gap-1">
            <Check className="w-2.5 h-2.5 text-emerald-400" />
            <span>Image Active</span>
          </div>
        </div>
      )}

      {/* Manual Direct URL Input fallback */}
      {isUrlMode && (
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-semibold text-slate-600 block">Direct Web Image URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={placeholder}
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => {
                onChangeUrl(e.target.value);
                setPreviewError(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Optional Caption Field */}
      {onChangeCaption !== undefined && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="Add short description or caption (e.g., Before: Severe Terrace Seepage)"
            value={caption || ''}
            onChange={(e) => onChangeCaption(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
