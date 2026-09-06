import axios from "axios";
import type { Recipe } from "../data/meals";

const URL = "http://localhost:5000/api/user";

const api = axios.create({ baseURL: URL,withCredentials: true });
export async function checkAuth() {
    try {
        const response = await api.get("/me");
        return response.data.success;
    } catch {
        return false;
    }
}
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
                meal[`strIngredient${index + 1}` as keyof Recipe] = item.ingredient ?? "";
                meal[`strMeasure${index + 1}` as keyof Recipe] = item.measure ?? "";
            }
        );
    return meal;
}


export async function getFavorites(): Promise<Recipe[]> {
    const response =await api.get(`/favorites`);
    return (response.data.data ?? []).map(mapRecipe);
}

export async function toggleFavorite(mealId: string) {
    const response = await api.post(`/favorites/toggle`,
        { mealId });
    return response.data;
}

export async function getMealPlan() {
    const response = await api.get(`/meal-plan`);
    return response.data.data ?? [];
}

export async function addMealToPlan(mealId: string, dayOfWeek: string) {
    const response = await api.post(`/meal-plan/item`,
        {
            mealId,
            dayOfWeek
        }
    );
    return response.data;
}

export async function removeMealFromPlan(id: number) {
    const response = await api.delete(`/meal-plan/item/${id}`);
    return response.data;
}

export async function clearMealPlan() {
    const response = await api.delete(`/meal-plan`);
    return response.data;
}

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
    const response = await api.get(`/grocery`);
    return response.data.data ?? [];
}

export async function addGroceryItem(
    name: string,
    custom = true,
    quantity = 1
) {
    const response = await api.post(`/grocery`,
        {
            name,
            custom,
            quantity,
            completed: false
        }
    );

    return response.data.data;
}

export async function updateGroceryItem(id: number, completed: boolean, quantity?: number) {
    const response = await api.patch(`/grocery/${id}`,
        {
            completed,
            ...(quantity !== undefined ? { quantity } : {})
        }
    );
    return response.data.data;
}

export async function deleteGroceryItem(id: number) {
    const response = await api.delete(`/grocery/${id}`);
    return response.data;
}