import { supabase } from './supabase';

// Production file storage service for handling thousands of uploads
export class StorageService {
  private static instance: StorageService;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  private allowedDocumentTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Validate file before upload
  validateFile(file: File, allowedTypes?: string[]): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    const types = allowedTypes || [...this.allowedImageTypes, ...this.allowedVideoTypes];
    if (!types.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true };
  }

  // Generate unique file path
  generateFilePath(file: File, folder: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${folder}/${timestamp}-${randomId}.${extension}`;
  }

  // Upload file with retry logic
  async uploadFile(file: File, folder: string, options?: {
    allowedTypes?: string[];
    maxSize?: number;
    compress?: boolean;
  }): Promise<{ url: string; path: string; size: number }> {
    try {
      // Validate file
      const validation = this.validateFile(file, options?.allowedTypes);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate unique path
      const path = this.generateFilePath(file, folder);

      // Compress image if requested
      let fileToUpload = file;
      if (options?.compress && this.allowedImageTypes.includes(file.type)) {
        fileToUpload = await this.compressImage(file);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('campaign-media')
        .upload(path, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('campaign-media')
        .getPublicUrl(path);

      return {
        url: urlData.publicUrl,
        path,
        size: fileToUpload.size
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  // Compress image for better performance
  async compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxSize = 1920;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('campaign-media')
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  // Get file URL
  getFileUrl(path: string): string {
    const { data } = supabase.storage
      .from('campaign-media')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // Upload multiple files
  async uploadMultipleFiles(files: File[], folder: string, options?: {
    allowedTypes?: string[];
    maxSize?: number;
    compress?: boolean;
    maxFiles?: number;
  }): Promise<Array<{ url: string; path: string; size: number; originalName: string }>> {
    const maxFiles = options?.maxFiles || 10;
    
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`);
    }

    const uploadPromises = files.map(async (file) => {
      const result = await this.uploadFile(file, folder, options);
      return {
        ...result,
        originalName: file.name
      };
    });

    return Promise.all(uploadPromises);
  }

  // Create thumbnail for video
  async createVideoThumbnail(videoFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        // Set canvas size
        canvas.width = 320;
        canvas.height = 180;

        // Seek to 1 second and capture frame
        video.currentTime = 1;
      };

      video.onseeked = () => {
        // Draw video frame to canvas
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `${videoFile.name}-thumb.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(thumbnailFile);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  // Get file info
  async getFileInfo(path: string): Promise<{
    size: number;
    lastModified: string;
    contentType: string;
  } | null> {
    try {
      const { data, error } = await supabase.storage
        .from('campaign-media')
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      const file = data[0];
      return {
        size: file.metadata?.size || 0,
        lastModified: file.updated_at || '',
        contentType: file.metadata?.mimetype || ''
      };
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }

  // Check if file exists
  async fileExists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from('campaign-media')
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{
    used: number;
    total: number;
    percentage: number;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from('campaign-media')
        .list('', { limit: 1000 });

      if (error) {
        throw new Error(error.message);
      }

      const used = data?.reduce((total: number, file: any) => total + (file.metadata?.size || 0), 0) || 0;
      const total = 100 * 1024 * 1024 * 1024; // 100GB limit
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      console.error('Get storage usage error:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance(); 