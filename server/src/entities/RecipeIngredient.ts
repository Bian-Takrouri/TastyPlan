import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index} from "typeorm";
import { Recipe } from "./Recipe.js";

@Entity("recipe_ingredients")
export class RecipeIngredient {

    @PrimaryGeneratedColumn()
    id!: number;

    @Index("idx_recipe_id")

    @Column({ name : "recipe_id" , type :"int"})
    recipeId!: number;

    // @Index("idx_ingredient_name")

    @Column({ type: "varchar", length: 255 })
    ingredient!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    measure!: string | null;

    @ManyToOne( () => Recipe , (recipe) => recipe.ingredients, {onDelete: "CASCADE"} )

    @JoinColumn({ name : "recipe_id" })
    recipe!: Recipe;
}