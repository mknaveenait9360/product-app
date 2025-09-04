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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Multer } from 'multer';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


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

  @Post('single')
  @UseInterceptors(FileInterceptor('image', storage))
  async createSingle(
    @Body() createDto: CreateProductDto,
    @UploadedFile() file?: Multer.File,
  ) {
    try {
      const imagePath = file ? file.filename : undefined;
      return await this.productService.create(createDto, imagePath, undefined);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create product', error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('images', 5, storage))
  async createMultiple(
    @Body() createDto: CreateProductDto,
    @UploadedFiles() files?: Multer.File[],
  ) {
    try {
      const imagePaths = files ? files.map((f) => f.filename) : undefined;
      return await this.productService.create(createDto, undefined, imagePaths);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create product', error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('date') date?: string,
    @Query('stock') stock?: number,
  ) {
    try {
      return await this.productService.findAll({ name, date, stock });
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch products', error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { message: `Failed to fetch product #${id}`, error },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', storage))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
    @UploadedFile() file?: Multer.File,
  ) {
    try {
      const imagePath = file ? file.filename : undefined;
      return await this.productService.update(id, updateDto, imagePath);
    } catch (error) {
      throw new HttpException(
        { message: `Failed to update product #${id}`, error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.remove(id);
    } catch (error) {
      throw new HttpException(
        { message: `Failed to delete product #${id}`, error },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

// https://karmegakumar18ait-gmail.tinytake.com/msc/MTEwOTQ5MTZfMjQ4MjY3NDk

// https://karmegakumar18ait-gmail.tinytake.com/msc/MTEwOTQ5MzJfMjQ4MjY3NjU