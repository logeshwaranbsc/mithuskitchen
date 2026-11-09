import { getSupabaseAdminClient } from '../integrations/supabase/client';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  url: string;
  path: string;
  s3Url: string;
  bucket: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private bucketName = config.supabaseStorageBucket || 'mithu';

  /**
   * Ensure bucket is properly created and configured as public
   */
  async ensureBucket(): Promise<void> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return;

    try {
      const { data: bucket, error } = await supabase.storage.getBucket(this.bucketName);
      if (error || !bucket) {
        logger.info(`Creating bucket "${this.bucketName}" in Supabase Storage...`);
        await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'image/gif'],
          fileSizeLimit: 10485760, // 10MB
        });
      } else if (!bucket.public) {
        logger.info(`Updating bucket "${this.bucketName}" to public access...`);
        await supabase.storage.updateBucket(this.bucketName, {
          public: true,
        });
      }
    } catch (err: any) {
      logger.warn(`Could not ensure bucket: ${err?.message || err}`);
    }
  }

  /**
   * Upload food image to Supabase Storage bucket
   */
  async uploadFoodImage(file: Express.Multer.File, folder = 'foods'): Promise<UploadResult> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new Error('Supabase Storage is not configured. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    const rawExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const ext = rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const uniqueFileName = `${folder}/${sanitizedBase}-${Date.now()}-${uuidv4().slice(0, 6)}${ext}`;

    logger.info(`Uploading image to bucket "${this.bucketName}": ${uniqueFileName} (${file.size} bytes)`);

    const { data, error } = await supabase.storage.from(this.bucketName).upload(uniqueFileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) {
      logger.error('Supabase Storage upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(this.bucketName).getPublicUrl(uniqueFileName);
    const publicUrl = publicUrlData.publicUrl;
    const s3Url = `${config.supabaseS3Endpoint.replace(/\/+$/, '')}/${this.bucketName}/${uniqueFileName}`;

    logger.info(`Image uploaded successfully: ${publicUrl}`);

    return {
      url: publicUrl,
      path: uniqueFileName,
      s3Url,
      bucket: this.bucketName,
      fileName: path.basename(uniqueFileName),
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete image from storage
   */
  async deleteImage(filePath: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return false;

    try {
      let cleanPath = filePath;
      if (filePath.includes(`/storage/v1/object/public/${this.bucketName}/`)) {
        cleanPath = filePath.split(`/storage/v1/object/public/${this.bucketName}/`)[1];
      }
      const { error } = await supabase.storage.from(this.bucketName).remove([cleanPath]);
      if (error) {
        logger.warn(`Failed to remove file ${cleanPath}:`, error);
        return false;
      }
      return true;
    } catch (err: any) {
      logger.error('Error deleting image from storage:', err);
      return false;
    }
  }

  /**
   * List images in food storage
   */
  async listFoodImages(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase.storage.from(this.bucketName).list('foods');
      if (error) {
        logger.error('Failed to list files:', error);
        return [];
      }
      return (data || []).map((file) => {
        const filePath = `foods/${file.name}`;
        const { data: pubUrl } = supabase.storage.from(this.bucketName).getPublicUrl(filePath);
        return {
          ...file,
          url: pubUrl.publicUrl,
          s3Url: `${config.supabaseS3Endpoint.replace(/\/+$/, '')}/${this.bucketName}/${filePath}`,
        };
      });
    } catch (err) {
      logger.error('Error listing food images:', err);
      return [];
    }
  }
}

export const storageService = new StorageService();

