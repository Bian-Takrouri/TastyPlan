import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Recipe } from "./Recipe.js";

@Entity("origins")
export class Origin {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    name!: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: true
    })
    country!: string | null;

    @Column({
        name: "flag_url",
        type: "varchar",
        length: 500,
        nullable: true
    })
    flagUrl!: string | null;

    @OneToMany(
        () => Recipe,
        (recipe) => recipe.origin
    )
    recipes!: Recipe[];
}