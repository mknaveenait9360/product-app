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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Define a proper type for uploaded files
interface SafeUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Type guard to check if an object is a valid uploaded file
function isValidUploadedFile(file: unknown): file is SafeUploadedFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    'filename' in file &&
    'originalname' in file &&
    typeof (file as Record<string, unknown>).filename === 'string' &&
    typeof (file as Record<string, unknown>).originalname === 'string'
  );
}

// Type guard for array of uploaded files
function isValidUploadedFileArray(files: unknown): files is SafeUploadedFile[] {
  return Array.isArray(files) && files.every(isValidUploadedFile);
}

// ---------- Helpers ----------
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function safeFileName(file: unknown): string | undefined {
  if (isValidUploadedFile(file)) {
    return file.filename;
  }
  return undefined;
}

function safeFileNames(files: unknown): string[] | undefined {
  if (isValidUploadedFileArray(files)) {
    return files.map((file) => file.filename);
  }
  return undefined;
}

// ---------- Controller ----------
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('single')
  @UseInterceptors(
    FileInterceptor('image', {
      dest: './uploads',
    }),
  )
  async createSingle(
    @Body() createDto: CreateProductDto,
    @UploadedFile() file: unknown,
  ): Promise<unknown> {
    try {
      const imagePath = safeFileName(file);
      const result = await this.productService.create(createDto, imagePath);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: 'Failed to create product', error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      dest: './uploads',
    }),
  )
  async createMultiple(
    @Body() createDto: CreateProductDto,
    @UploadedFiles() files: unknown,
  ): Promise<unknown> {
    try {
      const imagePaths = safeFileNames(files);
      const result = await this.productService.create(createDto, undefined, imagePaths);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: 'Failed to create products', error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('date') date?: string,
    @Query('stock') stock?: string,
  ): Promise<unknown> {
    try {
      const stockNumber = stock ? parseInt(stock, 10) : undefined;
      const result = await this.productService.findAllWithFilters({
        name,
        date,
        stock: stockNumber,
      });
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: 'Failed to fetch products', error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<unknown> {
    try {
      const result = await this.productService.findOne(id);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: `Failed to fetch product #${id}`, error: message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      dest: './uploads',
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
    @UploadedFile() file: unknown,
  ): Promise<unknown> {
    try {
      const imagePath = safeFileName(file);
      const result = await this.productService.update(id, updateDto, imagePath);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: `Failed to update product #${id}`, error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<unknown> {
    try {
      const result = await this.productService.remove(id);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new HttpException(
        { message: `Failed to delete product #${id}`, error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
