import cloudinary from '../config/cloudinary';
import { unlink } from 'fs/promises';
import * as fs from 'fs';

export const uploadToCloudinary = async (filePath: string, folder: string = 'doctors') => {
  try {
    // Check if file exists
    try {
      await fs.promises.access(filePath);
    } catch (error) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log('Uploading file to Cloudinary:', filePath);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      width: 400,
      height: 400,
      crop: "fill",
      quality: "auto"
    });

    console.log('Cloudinary upload result:', result);

    if (!result.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }

    // Delete the local file after successful upload
    try {
      await unlink(filePath);
      console.log('Successfully deleted local file:', filePath);
    } catch (unlinkError) {
      console.warn('Warning: Could not delete local file:', unlinkError);
      // Don't throw here as upload was successful
    }

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Try to clean up the file even if upload failed
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }
    
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error('Cloudinary upload failed with unknown error');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};