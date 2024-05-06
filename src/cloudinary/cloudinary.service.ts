import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

const options = {
  folder: 'avatars',
  width: 150,
  crop: 'scale',
};

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    type: 'avatar' | 'product',
  ): Promise<CloudinaryResponse> {
    if (type === 'product') {
      options.folder = 'products';
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
