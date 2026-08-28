import axios from "axios";
import type { Recipe } from "../data/meals";

const URL = "http://localhost:5000/api/user";

function getToken() {
    return localStorage.getItem("token");
}

function getHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`
    };
}

/* =========================
   FAVORITES
========================= */

export async function getFavorites(): Promise<Recipe[]> {
    const response = await axios.get(
        `${URL}/favorites`,
        {
            headers: getHeaders()
        }
    );

    return response.data.data;
}

export async function toggleFavorite(recipeId: number) {
    const response = await axios.post(
        `${URL}/favorites/toggle`,
        { recipeId },
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
    const response = await axios.get(
        `${URL}/meal-plan`,
        {
            headers: getHeaders()
        }
    );

    return response.data.data;
}

export async function addMealToPlan(
    recipeId: number,
    dayOfWeek: string
) {
    const response = await axios.post(
        `${URL}/meal-plan/item`,
        {
            recipeId,
            dayOfWeek
        },
        {
            headers: getHeaders()
        }
    );

    return response.data;
}

export async function removeMealFromPlan(day: string) {
    const response = await axios.delete(
        `${URL}/meal-plan/day/${day}`,
        {
            headers: getHeaders()
        }
    );

    return response.data;
}

export async function clearMealPlan() {
    const response = await axios.delete(
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
    name: string;
    completed: boolean;
    custom: boolean;
};

export async function getGroceryItems(): Promise<GroceryItem[]> {
    const response = await axios.get(
        `${URL}/grocery`,
        {
            headers: getHeaders()
        }
    );

    return response.data.data;
}

export async function addGroceryItem(
    name: string,
    custom = true
) {
    const response = await axios.post(
        `${URL}/grocery`,
        {
            name,
            custom,
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
    completed: boolean
) {
    const response = await axios.patch(
        `${URL}/grocery/${id}`,
        {
            completed
        },
        {
            headers: getHeaders()
        }
    );

    return response.data.data;
}

export async function deleteGroceryItem(id: number) {
    const response = await axios.delete(
        `${URL}/grocery/${id}`,
        {
            headers: getHeaders()
        }
    );

    return response.data;
}