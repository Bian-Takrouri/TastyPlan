import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { User } from "./entities/User.js";
import { Category } from "./entities/Category.js";
import { Origin } from "./entities/Origin.js";
import { Recipe } from "./entities/Recipe.js";
import { RecipeIngredient } from "./entities/RecipeIngredient.js";
import { Favorite } from "./entities/Favorite.js";
import { MealPlanItem } from "./entities/MealPlanItem.js";
import { GroceryItem } from "./entities/GroceryItem.js";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [
        User,
        Category,
        Origin,
        Recipe,
        RecipeIngredient,
        Favorite,
        MealPlanItem,
        GroceryItem
    ],

    synchronize: false
});