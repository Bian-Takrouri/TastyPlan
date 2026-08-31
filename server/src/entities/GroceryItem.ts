import mongoose, {
    Document,
    Schema,
    Types
} from "mongoose";

export interface IGroceryItem
    extends Document {
    user: Types.ObjectId;
    name: string;
    quantity: number;
    completed: boolean;
    custom: boolean;
}
const groceryItemSchema =
    new Schema<IGroceryItem>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            name: {
                type: String,
                required: true,
                trim: true,
                maxlength: 255
            },

            quantity: {
                type: Number,
                default: 1,
                min: 1
            },

            completed: {
                type: Boolean,
                default: false
            },

            custom: {
                type: Boolean,
                default: false
            }
        }
    );

groceryItemSchema.index(
    {
        user: 1,
        name: 1
    },
    {
        unique: true
    }
);

export const GroceryItem =
    mongoose.model<IGroceryItem>(
        "GroceryItem",
        groceryItemSchema
    );
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     Index,
//     Unique
// } from "typeorm";

// import { User } from "./User.js";

// @Entity("grocery_items")
// @Unique(["userId", "name"])
// export class GroceryItem {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Index("idx_grocery_user")
//     @Column({
//         name: "user_id",
//         type: "int"
//     })
//     userId!: number;

//     @Column({
//         type: "varchar",
//         length: 255
//     })
//     name!: string;

//     @Column({
//         type: "int",
//         default: 1
//     })
//     quantity!: number;

//     @Column({
//         type: "boolean",
//         default: false
//     })
//     completed!: boolean;

//     @Column({
//         type: "boolean",
//         default: false
//     })
//     custom!: boolean;

//     @ManyToOne(
//         () => User,
//         (user) => user.groceryItems,
//         {
//             onDelete: "CASCADE"
//         }
//     )
//     @JoinColumn({
//         name: "user_id"
//     })
//     user!: User;
// }