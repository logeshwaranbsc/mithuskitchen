import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  FolderOpen, 
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { api, uploadFoodImage } from '../services/api';

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  dishName?: string;
  className?: string;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  value,
  onChange,
  dishName = 'Product',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'upload' | 'gallery' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value || '');

  // Load existing images from Supabase Storage bucket 'mithu'
  const { data: storageImages = [], isLoading: loadingGallery } = useQuery<{ name: string; url: string; s3Url: string }[]>({
    queryKey: ['storage-images'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/foods/storage/images');
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: tab === 'gallery',
  });

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await uploadFoodImage(file);
      onChange(res.url);
      setUrlInput(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload product image to Supabase Storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const isSupabaseMithuUrl = value?.includes('mithu') || value?.includes('supabase.co');

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#202820] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#237A45]" />
          <span>Product Image</span>
        </label>

        {/* Tab switchers */}
        <div className="inline-flex p-0.5 rounded-lg bg-gray-100 border border-[#E5EAE5] text-[11px]">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              tab === 'upload' ? 'bg-white text-[#202820] shadow-xs' : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('gallery')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              tab === 'gallery' ? 'bg-white text-[#202820] shadow-xs' : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            Bucket Gallery
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              tab === 'url' ? 'bg-white text-[#202820] shadow-xs' : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            Web URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* TAB 1: UPLOAD (Drag & Drop + Browse) */}
      {tab === 'upload' && (
        <div>
          {value ? (
            /* Image Preview Card when image is present */
            <div className="relative rounded-2xl overflow-hidden border border-[#E5EAE5] bg-[#F7FAF7] p-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0 shadow-xs">
                <img
                  src={value}
                  alt={dishName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <div className="flex-1 space-y-1.5 text-xs w-full">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isSupabaseMithuUrl
                      ? 'Saved in Supabase Storage (bucket: mithu)'
                      : 'Image Linked'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B756D] font-mono break-all line-clamp-2">
                  {value}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1 bg-white hover:bg-gray-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#237A45]" />
                    ) : (
                      <RefreshCw className="w-3 h-3 text-[#237A45]" />
                    )}
                    <span>Replace Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setUrlInput('');
                    }}
                    className="text-[11px] py-1.5 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#237A45] bg-[#EAF5EC]/50 scale-[1.01]'
                  : 'border-[#CBD5E1] hover:border-[#237A45] hover:bg-[#F7FAF7] bg-white'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#237A45]" />
                  <p className="text-xs font-bold text-[#202820]">
                    Uploading image to Supabase Storage...
                  </p>
                  <p className="text-[10px] text-[#6B756D]">Bucket: mithu / foods</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#EAF5EC] text-[#237A45] flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#202820]">
                      Click to upload product image or drag & drop
                    </p>
                    <p className="text-[10px] text-[#6B756D] mt-0.5">
                      PNG, JPG, WebP up to 10MB • Saved to Supabase bucket <strong className="text-[#237A45]">mithu</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STORAGE GALLERY */}
      {tab === 'gallery' && (
        <div className="p-3 bg-[#F7FAF7] border border-[#E5EAE5] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B756D]">
            <span className="font-semibold text-[#202820]">Available in bucket "mithu/foods"</span>
            <span>{storageImages.length} images</span>
          </div>

          {loadingGallery ? (
            <div className="py-6 flex items-center justify-center text-xs text-[#6B756D] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#237A45]" />
              <span>Loading storage images...</span>
            </div>
          ) : storageImages.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#6B756D]">
              No images found in storage bucket yet. Use the Upload tab to add new ones.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {storageImages.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => {
                    onChange(img.url);
                    setUrlInput(img.url);
                    setTab('upload');
                  }}
                  className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                    value === img.url
                      ? 'border-[#237A45] ring-2 ring-[#237A45]'
                      : 'border-[#E5EAE5] hover:border-[#237A45]'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white p-1 truncate text-center">
                    {img.name.replace(/^foods\//, '')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEB URL */}
      {tab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/food-image.jpg"
              className="input-field text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Apply</span>
            </button>
          </div>
          {value && (
            <p className="text-[10px] text-gray-500 truncate">Current: {value}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
