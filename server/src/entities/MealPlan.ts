import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User.js";
import { MealPlanItem } from "./MealPlanItem.js";

@Entity("meal_plans")
export class MealPlan {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => MealPlanItem, (item) => item.mealPlan, { cascade: true })
    items!: MealPlanItem[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}