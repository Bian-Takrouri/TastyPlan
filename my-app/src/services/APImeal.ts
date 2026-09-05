import axios from "axios";
import type { Recipe } from "../data/meals";
const URL = "http://localhost:5000/api";
const api = axios.create({ baseURL: URL});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        .forEach((item: any, index: number) => {
            meal[`strIngredient${index + 1}` as keyof Recipe] = item.ingredient ?? "";
            meal[`strMeasure${index + 1}` as keyof Recipe] = item.measure ?? "";
        });

    return meal;
}

class MealAPI {

    async getMeals(): Promise<Recipe[]> {
        const response = await api.get("/recipes");
        return (response.data.data ?? []).map(mapRecipe);
    }

    async SearchTheMeal(query: string): Promise<Recipe[]> {
        const meals = await this.getMeals();
        if (!query.trim()) {
            return meals;
        }
        return meals.filter(meal =>
            meal.strMeal
                .toLowerCase()
                .includes(query.toLowerCase())
        );
    }

    async getCategories() {
        const response = await api.get("/categories");

        return (response.data.data ?? []).map((category: any) => ({
            idCategory: String(category.id),
            strCategory: category.name,
            strCategoryThumb: category.imageUrl ?? "",
            strCategoryDescription: category.description ?? ""
        }));
    }

    async getOrigins() {
        const response = await api.get("/origins");
        return (response.data.data ?? []).map((origin: any) => ({
            strMeal: "",
            strMealThumb: "",
            idMeal: String(origin.id),
            strArea: origin.name,
            strCountry: origin.country ?? "",
            flagUrl: origin.flagUrl ?? null
        }));
    }

    async getMealsByCategory(category: string): Promise<Recipe[]> {
        const meals = await this.getMeals();
        return meals.filter(
            meal => meal.strCategory === category
        );
    }

    async getMealsByOrigin(origin: string): Promise<Recipe[]> {
        const meals = await this.getMeals();
        return meals.filter(
            meal => meal.strArea === origin
        );
    }

    async getRandomMeal(): Promise<Recipe | null> {
        const meals = await this.getMeals();
        if (meals.length === 0) {
            return null;
        }
        return meals[
            Math.floor(Math.random() * meals.length)
        ];
    }

    async getSpecificRecipe(id: string): Promise<Recipe | null> {
        const meals = await this.getMeals();
        return (
            meals.find( meal => meal.idMeal === String(id)) ?? null
        );
    }
}

export default MealAPI;