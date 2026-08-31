import mongoose, {
    Document,
    Schema
} from "mongoose";

export type UserRole =
    | "admin"
    | "user";

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}

const userSchema =
    new Schema<IUser>(
        {
            username: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                maxlength: 100
            },

            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                maxlength: 255
            },

            passwordHash: {
                type: String,
                required: true,
                maxlength: 255
            },

            role: {
                type: String,
                enum: ["admin", "user"],
                default: "user"
            }
        },
        {
            timestamps: {
                createdAt: true,
                updatedAt: false
            }
        }
    );

export const User =
    mongoose.model<IUser>(
        "User",
        userSchema
    );
    
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     CreateDateColumn,
//     OneToMany
// } from "typeorm";

// import { Favorite } from "./Favorite.js";
// import { MealPlanItem } from "./MealPlanItem.js";
// import { GroceryItem } from "./GroceryItem.js";

// @Entity("users")
// export class User {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Column({
//         type: "varchar",
//         length: 100,
//         unique: true
//     })
//     username!: string;

//     @Column({
//         type: "varchar",
//         length: 255,
//         unique: true
//     })
//     email!: string;

//     @Column({
//         name: "password_hash",
//         type: "varchar",
//         length: 255
//     })
//     passwordHash!: string;

//     @Column({
//         type: "enum",
//         enum: ["admin", "user"],
//         default: "user"
//     })
//     role!: "admin" | "user";

//     @CreateDateColumn({
//         name: "created_at",
//         type: "timestamp"
//     })
//     createdAt!: Date;

//     @OneToMany(
//         () => Favorite,
//         (favorite) => favorite.user
//     )
//     favorites!: Favorite[];

//     @OneToMany(
//         () => MealPlanItem,
//         (item) => item.user
//     )
//     mealPlanItems!: MealPlanItem[];

//     @OneToMany(
//         () => GroceryItem,
//         (item) => item.user
//     )
//     groceryItems!: GroceryItem[];
// }