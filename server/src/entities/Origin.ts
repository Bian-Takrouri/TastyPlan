import mongoose, {
    Document,
    Schema
} from "mongoose";

export interface IOrigin extends Document {
    name: string;
    country: string | null;
    flagUrl: string | null;
}

const originSchema =
    new Schema<IOrigin>(
        {
            name: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                maxlength: 100
            },

            country: {
                type: String,
                default: null,
                maxlength: 100
            },

            flagUrl: {
                type: String,
                default: null,
                maxlength: 500
            }
        }
    );

export const Origin =
    mongoose.model<IOrigin>(
        "Origin",
        originSchema
    );
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     OneToMany
// } from "typeorm";

// import { Recipe } from "./Recipe.js";

// @Entity("origins")
// export class Origin {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Column({
//         type: "varchar",
//         length: 100,
//         unique: true
//     })
//     name!: string;

//     @Column({
//         type: "varchar",
//         length: 100,
//         nullable: true
//     })
//     country!: string | null;

//     @Column({
//         name: "flag_url",
//         type: "varchar",
//         length: 500,
//         nullable: true
//     })
//     flagUrl!: string | null;

//     @OneToMany(
//         () => Recipe,
//         (recipe) => recipe.origin
//     )
//     recipes!: Recipe[];
// }