import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const cloudinaryConfig = {
      cloud_name: configService.get<string>('cloudinaryName'),
      api_key: configService.get<string>('cloudinaryApiKey'),
      api_secret: configService.get<string>('cloudinaryApiSecret'),
    };
    cloudinary.config(cloudinaryConfig);
    return cloudinary;
  },
  inject: [ConfigService],
};
