import mongoose, {
    Document,
    Schema,
    Types
} from "mongoose";

export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export interface IMealPlanItem extends Document {
    user: Types.ObjectId;
    recipe: Types.ObjectId;
    dayOfWeek: DayOfWeek;
}

const mealPlanItemSchema =
    new Schema<IMealPlanItem>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            recipe: {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                required: true
            },

            dayOfWeek: {
                type: String,
                enum: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                required: true
            }
        },
        {
            timestamps: true
        }
    );

mealPlanItemSchema.index(
    {
        user: 1,
        dayOfWeek: 1
    },
    {
        unique: true
    }
);

export const MealPlanItem =
    mongoose.model<IMealPlanItem>(
        "MealPlanItem",
        mealPlanItemSchema
    );

// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     Unique
// } from "typeorm";
// import { User } from "./User.js";
// import { Recipe } from "./Recipe.js";

// export type DayOfWeek =
//     | "Monday"
//     | "Tuesday"
//     | "Wednesday"
//     | "Thursday"
//     | "Friday"
//     | "Saturday"
//     | "Sunday";

// @Entity("meal_plan_items")
// @Unique(["user", "dayOfWeek"])
// export class MealPlanItem {
//     @PrimaryGeneratedColumn()
//     id!: number;

//     @ManyToOne(() => User, { onDelete: "CASCADE" })
//     @JoinColumn({ name: "user_id" })
//     user!: User;

//     @ManyToOne(() => Recipe, { onDelete: "CASCADE" })
//     @JoinColumn({ name: "recipe_id" })
//     recipe!: Recipe;

//     @Column({
//         type: "enum",
//         enum: [
//             "Monday",
//             "Tuesday",
//             "Wednesday",
//             "Thursday",
//             "Friday",
//             "Saturday",
//             "Sunday"
//         ],
//         name: "day_of_week"
//     })
//     dayOfWeek!: DayOfWeek;
// }