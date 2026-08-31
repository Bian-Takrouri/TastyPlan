import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique
} from "typeorm";
import { User } from "./User.js";
import { Recipe } from "./Recipe.js";

export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

@Entity("meal_plan_items")
@Unique(["user", "dayOfWeek"])
export class MealPlanItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Recipe, { onDelete: "CASCADE" })
    @JoinColumn({ name: "recipe_id" })
    recipe!: Recipe;

    @Column({
        type: "enum",
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ],
        name: "day_of_week"
    })
    dayOfWeek!: DayOfWeek;
}