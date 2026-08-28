import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { MealPlan } from "./MealPlan.js";
import { Recipe } from "./Recipe.js";

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

@Entity("meal_plan_items")
@Unique(["mealPlan", "dayOfWeek"])
export class MealPlanItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => MealPlan, (plan) => plan.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "meal_plan_id" })
    mealPlan!: MealPlan;

    @ManyToOne(() => Recipe, { onDelete: "CASCADE" })
    @JoinColumn({ name: "recipe_id" })
    recipe!: Recipe;

    @Column({
        type: "enum",
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        name: "day_of_week"
    })
    dayOfWeek!: DayOfWeek;
}