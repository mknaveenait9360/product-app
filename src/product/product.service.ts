import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { APP_MESSAGES } from '../common/contants';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  async create(
    createDto: CreateProductDto,
    imagePath?: string,
    imagePaths?: string[],
  ): Promise<Product> {
    const product = this.productRepository.create({
      ...createDto,
      image: imagePath,
      images: imagePaths,
    });
    return await this.productRepository.save(product);
  }


  async findAllWithFilters(filters: { name?: string; date?: string; stock?: number }) {
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
  }

  async update(
    id: number,
    updateDto: UpdateProductDto,
    imagePath?: string,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    if (imagePath) product.image = imagePath;
    return await this.productRepository.save(product);
  }
}
