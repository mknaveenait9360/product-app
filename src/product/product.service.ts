import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
    const product = this.productRepository.create({
      ...createDto,
      image: imagePath,
      images: imagePaths,
    });
    return await this.productRepository.save(product);
  }

  async findAll(filters: { name?: string; date?: string; stock?: number }) {
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

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async update(
    id: number,
    updateDto: UpdateProductDto,
    imagePath?: string,
  ) {
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    if (imagePath) product.image = imagePath;
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}
