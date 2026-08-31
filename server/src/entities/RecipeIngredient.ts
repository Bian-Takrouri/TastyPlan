import mongoose, {
    Document,
    Schema,
    Types
} from "mongoose";

export interface IRecipeIngredient
    extends Document {

    recipe: Types.ObjectId;

    ingredient: string;

    measure: string | null;
}

const recipeIngredientSchema =
    new Schema<IRecipeIngredient>(
        {
            recipe: {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                required: true,
                index: true
            },

            ingredient: {
                type: String,
                required: true,
                trim: true,
                maxlength: 255,
                index: true
            },

            measure: {
                type: String,
                default: null,
                maxlength: 100
            }
        }
    );

export const RecipeIngredient =
    mongoose.model<IRecipeIngredient>(
        "RecipeIngredient",
        recipeIngredientSchema
    );


// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     Index
// } from "typeorm";

// import { Recipe } from "./Recipe.js";

// @Entity("recipe_ingredients")
// export class RecipeIngredient {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Index("idx_recipe_id")
//     @Column({
//         name: "recipe_id",
//         type: "int"
//     })
//     recipeId!: number;

//     @Index("idx_ingredient_name")
//     @Column({
//         type: "varchar",
//         length: 255
//     })
//     ingredient!: string;

//     @Column({
//         type: "varchar",
//         length: 100,
//         nullable: true
//     })
//     measure!: string | null;

//     @ManyToOne(
//         () => Recipe,
//         (recipe) => recipe.ingredients,
//         {
//             onDelete: "CASCADE"
//         }
//     )
//     @JoinColumn({
//         name: "recipe_id"
//     })
//     recipe!: Recipe;
// }