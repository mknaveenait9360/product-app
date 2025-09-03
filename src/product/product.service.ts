import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { APP_MESSAGES } from '../common/contants';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  
  async create(
    createDto: CreateProductDto,
    imagePath?: string,
    imagePaths?: string[],
  ) {
    try {
      const product = this.productRepository.create({
        ...createDto,
        image: imagePath,
        images: imagePaths,
      });
      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(APP_MESSAGES.CREATE_FAILED);
    }
  }

  
  async findAll(filters: { name?: string; date?: string; stock?: number }) {
    try {
      const query = this.productRepository.createQueryBuilder('product');

      if (filters.name) {
        query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
      }

      if (filters.date) {
        query.andWhere('DATE(product.createdAt) = :date', { date: filters.date });
      }

      if (filters.stock !== undefined) {
        query.andWhere('product.stock >= :stock', { stock: filters.stock });
      }

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  // Find one product by ID
  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) throw new NotFoundException(APP_MESSAGES.PRODUCT_NOT_FOUND);
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  // Update product
  async update(
    id: number,
    updateDto: UpdateProductDto,
    imagePath?: string,
  ) {
    try {
      const product = await this.findOne(id);
      Object.assign(product, updateDto);
      if (imagePath) product.image = imagePath;
      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(APP_MESSAGES.UPDATE_FAILED);
    }
  }

  // Remove product
  async remove(id: number) {
    try {
      const product = await this.findOne(id);
      return await this.productRepository.remove(product);
    } catch (error) {
      throw new InternalServerErrorException(APP_MESSAGES.DELETE_FAILED);
    }
  }
}
