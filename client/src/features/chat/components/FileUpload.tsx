import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '../../../components/ui';

interface FileUploadProps {
  onUpload: (file: File, fileUrl: string) => void;
  onCancel: () => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({
  onUpload,
  onCancel,
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // For now, use a simple approach - in production, you'd upload to a file storage service
      // and get back a URL. Here we'll create a local object URL as a placeholder.
      const fileUrl = URL.createObjectURL(file);
      onUpload(file, fileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (): JSX.Element => {
    if (!file) return <Upload size={24} className="text-[var(--text-muted)]" />;

    if (file.type.startsWith('image/')) {
      return <ImageIcon size={24} className="text-[var(--primary)]" />;
    }

    if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText size={24} className="text-red-500" />;
    }

    return <File size={24} className="text-[var(--text-muted)]" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] p-4">
      {error && (
        <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!file ? (
        <div
          className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-primary)]">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg mx-auto"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="p-1 hover:bg-[var(--bg-hover)] rounded transition-colors"
              >
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} isLoading={isUploading}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
