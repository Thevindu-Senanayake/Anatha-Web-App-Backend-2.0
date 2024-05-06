import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { createProductDto } from './dto/createProduct.dto';

@Controller('product')
// @UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudService: CloudinaryService,
  ) {}

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new HttpException('Product Not Found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  @Post('new')
  async createProduct(@Body() createProductDto: createProductDto) {}
}
