import { Repository, DeepPartial, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends ObjectLiteral & { id: number }> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
    if (!entity) {
      throw new NotFoundException(`${this.repository.metadata.name} not found`);
    }
    return entity;
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const updateResult = await this.repository.update(id, data);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`${this.repository.metadata.name} not found for update`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.repository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`${this.repository.metadata.name} not found for deletion`);
    }
  }
}
