import cloudinary from '../config/cloudinary';


export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "users/profile", public_id: fileName, overwrite: true },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Error deleting file from Cloudinary');
  }
};