import axios from "axios";
import type { Recipe } from "../data/meals";

const URL = "http://localhost:5000/api/user";

function getHeaders() {
    const token = localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`
        }
        : {};
}

/* =========================
   RECIPE MAPPING
========================= */

function mapRecipe(recipe: any): Recipe {
    const meal: Recipe = {
        idMeal: String(recipe.mealId),
        strMeal: recipe.name ?? "",
        strCategory: recipe.category?.name ?? "",
        strArea: recipe.origin?.name ?? "",
        strCountry: recipe.origin?.country ?? "",
        strMealThumb: recipe.imageUrl ?? "",
        strInstructions: recipe.instructions ?? "",
        strYoutube: recipe.youtubeUrl ?? ""
    };

    (recipe.ingredients ?? [])
        .slice(0, 20)
        .forEach(
            (item: any, index: number) => {
                meal[
                    `strIngredient${index + 1}` as keyof Recipe
                ] = item.ingredient ?? "";

                meal[
                    `strMeasure${index + 1}` as keyof Recipe
                ] = item.measure ?? "";
            }
        );

    return meal;
}

/* =========================
   FAVORITES
========================= */

export async function getFavorites(): Promise<Recipe[]> {
    const response =
        await axios.get(
            `${URL}/favorites`,
            {
                headers: getHeaders()
            }
        );

    return (
        response.data.data ?? []
    ).map(mapRecipe);
}

export async function toggleFavorite(
    mealId: string
) {
    const response =
        await axios.post(
            `${URL}/favorites/toggle`,
            {
                mealId
            },
            {
                headers: getHeaders()
            }
        );

    return response.data;
}

/* =========================
   MEAL PLAN
========================= */

export async function getMealPlan() {
    const response =
        await axios.get(
            `${URL}/meal-plan`,
            {
                headers: getHeaders()
            }
        );

    return response.data.data ?? [];
}

export async function addMealToPlan(
    mealId: string,
    dayOfWeek: string
) {
    const response =
        await axios.post(
            `${URL}/meal-plan/item`,
            {
                mealId,
                dayOfWeek
            },
            {
                headers: getHeaders()
            }
        );

    return response.data;
}

export async function removeMealFromPlan(
    id: number
) {
    const response =
        await axios.delete(
            `${URL}/meal-plan/item/${id}`,
            {
                headers: getHeaders()
            }
        );

    return response.data;
}

export async function clearMealPlan() {
    const response =
        await axios.delete(
            `${URL}/meal-plan`,
            {
                headers: getHeaders()
            }
        );

    return response.data;
}

/* =========================
   GROCERY
========================= */

export type GroceryItem = {
    id: number;
    userId?: number;
    name: string;
    quantity: number;
    completed: boolean;
    custom: boolean;
};

export async function getGroceryItems():
    Promise<GroceryItem[]> {
    const response =
        await axios.get(
            `${URL}/grocery`,
            {
                headers: getHeaders()
            }
        );

    return response.data.data ?? [];
}

export async function addGroceryItem(
    name: string,
    custom = true,
    quantity = 1
) {
    const response =
        await axios.post(
            `${URL}/grocery`,
            {
                name,
                custom,
                quantity,
                completed: false
            },
            {
                headers: getHeaders()
            }
        );

    return response.data.data;
}

export async function updateGroceryItem(
    id: number,
    completed: boolean,
    quantity?: number
) {
    const response =
        await axios.patch(
            `${URL}/grocery/${id}`,
            {
                completed,
                ...(quantity !== undefined
                    ? { quantity }
                    : {})
            },
            {
                headers: getHeaders()
            }
        );

    return response.data.data;
}

export async function deleteGroceryItem(
    id: number
) {
    const response =
        await axios.delete(
            `${URL}/grocery/${id}`,
            {
                headers: getHeaders()
            }
        );

    return response.data;
}