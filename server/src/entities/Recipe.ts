import mongoose, {
    Document,
    Schema,
    Types
} from "mongoose";

export interface IRecipe extends Document {
    mealId: string;
    name: string;

    category:
        | Types.ObjectId
        | null;

    origin:
        | Types.ObjectId
        | null;

    instructions: string | null;
    imageUrl: string | null;
    youtubeUrl: string | null;
    sourceUrl: string | null;
}

const recipeSchema =
    new Schema<IRecipe>(
        {
            mealId: {
                type: String,
                required: true,
                unique: true,
                maxlength: 50
            },

            name: {
                type: String,
                required: true,
                trim: true,
                maxlength: 255,
                index: true
            },

            category: {
                type: Schema.Types.ObjectId,
                ref: "Category",
                default: null,
                index: true
            },

            origin: {
                type: Schema.Types.ObjectId,
                ref: "Origin",
                default: null,
                index: true
            },

            instructions: {
                type: String,
                default: null
            },

            imageUrl: {
                type: String,
                default: null,
                maxlength: 500
            },

            youtubeUrl: {
                type: String,
                default: null,
                maxlength: 500
            },

            sourceUrl: {
                type: String,
                default: null,
                maxlength: 500
            }
        }
    );

export const Recipe =
    mongoose.model<IRecipe>(
        "Recipe",
        recipeSchema
    );

// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     OneToMany,
//     Index
// } from "typeorm";

// import { Category } from "./Category.js";
// import { Origin } from "./Origin.js";
// import { RecipeIngredient } from "./RecipeIngredient.js";
// import { Favorite } from "./Favorite.js";
// import { MealPlanItem } from "./MealPlanItem.js";

// @Entity("recipes")
// export class Recipe {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Column({
//         name: "meal_id",
//         type: "varchar",
//         length: 50,
//         unique: true
//     })
//     mealId!: string;

//     @Index("idx_recipe_name")
//     @Column({
//         type: "varchar",
//         length: 255
//     })
//     name!: string;

//     @Index("idx_recipe_category")
//     @Column({
//         name: "category_id",
//         type: "int",
//         nullable: true
//     })
//     categoryId!: number | null;

//     @Index("idx_recipe_origin")
//     @Column({
//         name: "origin_id",
//         type: "int",
//         nullable: true
//     })
//     originId!: number | null;

//     @Column({
//         type: "text",
//         nullable: true
//     })
//     instructions!: string | null;

//     @Column({
//         name: "image_url",
//         type: "varchar",
//         length: 500,
//         nullable: true
//     })
//     imageUrl!: string | null;

//     @Column({
//         name: "youtube_url",
//         type: "varchar",
//         length: 500,
//         nullable: true
//     })
//     youtubeUrl!: string | null;

//     @Column({
//         name: "source_url",
//         type: "varchar",
//         length: 500,
//         nullable: true
//     })
//     sourceUrl!: string | null;

//     @ManyToOne(
//         () => Category,
//         (category) => category.recipes,
//         {
//             nullable: true,
//             onDelete: "SET NULL"
//         }
//     )
//     @JoinColumn({
//         name: "category_id"
//     })
//     category!: Category | null;

//     @ManyToOne(
//         () => Origin,
//         (origin) => origin.recipes,
//         {
//             nullable: true,
//             onDelete: "SET NULL"
//         }
//     )
//     @JoinColumn({
//         name: "origin_id"
//     })
//     origin!: Origin | null;

//     @OneToMany(
//         () => RecipeIngredient,
//         (ingredient) => ingredient.recipe,
//         {
//             cascade: true
//         }
//     )
//     ingredients!: RecipeIngredient[];

//     @OneToMany(
//         () => Favorite,
//         (favorite) => favorite.recipe
//     )
//     favorites!: Favorite[];

//     @OneToMany(
//         () => MealPlanItem,
//         (item) => item.recipe
//     )
//     mealPlanItems!: MealPlanItem[];
// }