import mongoose, {
    Document,
    Schema
} from "mongoose";

export interface ICategory extends Document {
    name: string;
    description: string | null;
    imageUrl: string | null;
}

const categorySchema =
    new Schema<ICategory>(
        {
            name: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                maxlength: 100
            },

            description: {
                type: String,
                default: null
            },

            imageUrl: {
                type: String,
                default: null,
                maxlength: 500
            }
        }
    );

export const Category =
    mongoose.model<ICategory>(
        "Category",
        categorySchema
    );
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     OneToMany
// } from "typeorm";

// import { Recipe } from "./Recipe.js";

// @Entity("categories")
// export class Category {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Column({
//         type: "varchar",
//         length: 100,
//         unique: true
//     })
//     name!: string;

//     @Column({
//         type: "text",
//         nullable: true
//     })
//     description!: string | null;

//     @Column({
//         name: "image_url",
//         type: "varchar",
//         length: 500,
//         nullable: true
//     })
//     imageUrl!: string | null;

//     @OneToMany(
//         () => Recipe,
//         (recipe) => recipe.category
//     )
//     recipes!: Recipe[];
// }