import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "typeorm";

@Entity('products')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column("decimal")
  price!: number;

  @Column({ nullable: true })
  image?: string;

  @Column('text', { array: true, nullable: true })
  images?: string[];

  @Column({ default: 0 })
  stock!: number;
}
