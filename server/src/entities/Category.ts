import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Recipe } from "./Recipe.js";

@Entity("categories")
export class Category {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    name!: string;

    @Column({
        type: "text",
        nullable: true
    })
    description!: string | null;

    @Column({
        name: "image_url",
        type: "varchar",
        length: 500,
        nullable: true
    })
    imageUrl!: string | null;

    @OneToMany(
        () => Recipe,
        (recipe) => recipe.category
    )
    recipes!: Recipe[];
}