import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany
} from "typeorm";

import { Favorite } from "./Favorite.js";
import { MealPlanItem } from "./MealPlanItem.js";
import { GroceryItem } from "./GroceryItem.js";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    username!: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    email!: string;

    @Column({
        name: "password_hash",
        type: "varchar",
        length: 255
    })
    passwordHash!: string;

    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
    })
    role!: "admin" | "user";

    @CreateDateColumn({
        name: "created_at",
        type: "timestamp"
    })
    createdAt!: Date;

    @OneToMany(
        () => Favorite,
        (favorite) => favorite.user
    )
    favorites!: Favorite[];

    @OneToMany(
        () => MealPlanItem,
        (item) => item.user
    )
    mealPlanItems!: MealPlanItem[];

    @OneToMany(
        () => GroceryItem,
        (item) => item.user
    )
    groceryItems!: GroceryItem[];
}