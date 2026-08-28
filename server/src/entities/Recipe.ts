import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from "typeorm";
import { Category } from "./Category.js";
import { Origin } from "./Origin.js";
import { RecipeIngredient } from "./RecipeIngredient.js";

@Entity("recipes")
export class Recipe {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "meal_id",
    type: "varchar",
    length: 50,
    unique: true
  })
  mealId!: string;

  @Index("idx_recipe_name")
  @Column({
    type: "varchar",
    length: 255
  })
  name!: string;

  @Index("idx_recipe_category")
  @Column({
    name: "category_id",
    type: "int",
    nullable: true
  })
  categoryId!: number | null;

  @Index("idx_recipe_origin")
  @Column({
    name: "origin_id",
    type: "int",
    nullable: true
  })
  originId!: number | null;

  @Column({
    type: "text",
    nullable: true
  })
  instructions!: string | null;

  @Column({
    name: "image_url",
    type: "varchar",
    length: 500,
    nullable: true
  })
  imageUrl!: string | null;

  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: "SET NULL"
  })
  @JoinColumn({ name: "category_id" })
  category!: Category | null;

  @ManyToOne(() => Origin, {
    nullable: true,
    onDelete: "SET NULL"
  })
  @JoinColumn({ name: "origin_id" })
  origin!: Origin | null;

  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe, {
    cascade: true
  })
  ingredients!: RecipeIngredient[];
}