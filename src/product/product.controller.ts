import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Multer } from 'multer';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Multer storage configuration
const storage = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
};

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Create product with single image
  @Post('single')
  @UseInterceptors(FileInterceptor('image', storage))
  createSingle(
    @Body() createDto: CreateProductDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const imagePath = file ? file.filename : undefined;
    return this.productService.create(createDto, imagePath, undefined);
  }

  // Create product with multiple images
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('images', 5, storage))
  createMultiple(
    @Body() createDto: CreateProductDto,
    @UploadedFiles() files?: Multer.File[],
  ) {
    const imagePaths = files ? files.map((f) => f.filename) : undefined;
    return this.productService.create(createDto, undefined, imagePaths);
  }

  // Get all products with optional filters
  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('date') date?: string,
    @Query('stock') stock?: number,
  ) {
    return this.productService.findAll({ name, date, stock });
  }

  // Get single product by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  // Update product (single image upload)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', storage))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const imagePath = file ? file.filename : undefined;
    return this.productService.update(id, updateDto, imagePath);
  }

  // Delete product by ID
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
