import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { User } from "./User.js";
import { Recipe } from "./Recipe.js";

@Entity("favorites")
@Unique(["user", "recipe"])
export class Favorite {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Recipe, { onDelete: "CASCADE" })
    @JoinColumn({ name: "recipe_id" })
    recipe!: Recipe;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}