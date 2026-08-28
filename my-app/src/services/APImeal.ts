import axios from "axios";
import type { Recipe } from "../data/meals";

const URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: URL
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

class MealAPI {
    async getMeals(): Promise<Recipe[]> {
        const response = await api.get("/recipes");
        return response.data.data.map((recipe: any) => ({
            idMeal: String(recipe.mealId),
            strMeal: recipe.name,
            strCategory: recipe.category?.name ?? "",
            strArea: recipe.origin?.name ?? "",
            strCountry: recipe.origin?.country ?? "",
            strMealThumb: recipe.imageUrl ?? "",
            strInstructions: recipe.instructions ?? "",
            strYoutube: "",
            ...Object.fromEntries((recipe.ingredients ?? []).slice(0, 20).map((item: any, index: number) => [`strIngredient${index + 1}`, item.ingredient])),
            ...Object.fromEntries((recipe.ingredients ?? []).slice(0, 20).map((item: any, index: number) => [`strMeasure${index + 1}`, item.measure ?? ""]))
        }));
    }

    async SearchTheMeal(query: string) {
        const meals = await this.getMeals();
        if (!query.trim()) return meals;
        return meals.filter(meal => meal.strMeal.toLowerCase().includes(query.toLowerCase()));
    }

    async getCategories() {
        const response = await api.get("/categories");
        return response.data.data.map((category: any) => ({
            idCategory: String(category.id),
            strCategory: category.name,
            strCategoryThumb: category.imageUrl ?? "",
            strCategoryDescription: category.description ?? ""
        }));
    }

    async getOrigins() {
        const response = await api.get("/origins");
        return response.data.data.map((origin: any) => ({
            strMeal: "",
            strMealThumb: "",
            idMeal: String(origin.id),
            strArea: origin.name,
            strCountry: origin.country ?? "",
            flagUrl: origin.flagUrl ?? null
        }));
    }

    async getMealsByCategory(category: string) {
        const meals = await this.getMeals();
        return meals.filter(meal => meal.strCategory === category);
    }

    async getMealsByOrigin(origin: string) {
        const meals = await this.getMeals();
        return meals.filter(meal => meal.strArea === origin);
    }

    async getRandomMeal() {
        const meals = await this.getMeals();
        return meals.length ? meals[Math.floor(Math.random() * meals.length)] : null;
    }

    async getSpecificRecipe(id: string) {
        const meals = await this.getMeals();
        return meals.find(meal => meal.idMeal === String(id)) ?? null;
    }

    async getFavorites(): Promise<Recipe[]> {
        const response = await api.get("/user/favorites");
        return response.data.data;
    }

    async toggleFavorite(mealId: string) {
        const response = await api.post("/user/favorites/toggle", { mealId });
        return response.data;
    }

    async getMealPlan() {
        const response = await api.get("/user/meal-plan");
        return response.data.data;
    }

    async saveMealPlanItem(mealId: string, dayOfWeek: string) {
        const response = await api.post("/user/meal-plan/item", { mealId, dayOfWeek });
        return response.data.data;
    }

    async removeMealPlanItem(id: number) {
        return api.delete(`/user/meal-plan/item/${id}`);
    }

    async getGroceryItems() {
        const response = await api.get("/user/grocery");
        return response.data.data;
    }

    async addGroceryItem(name: string, custom = true) {
        const response = await api.post("/user/grocery", { name, custom });
        return response.data.data;
    }

    async updateGroceryItem(id: number, completed: boolean) {
        const response = await api.patch(`/user/grocery/${id}`, { completed });
        return response.data.data;
    }

    async deleteGroceryItem(id: number) {
        return api.delete(`/user/grocery/${id}`);
    }
}

export default MealAPI;





// //import axios from "axios";
// import categories from "../data/categories.json";
// import origins from "../data/origins.json";
// import meals from "../data/meals.json"
// class APIMeal {
//     //   private URL = "https://www.themealdb.com/api/json/v1/1";

//     async SearchTheMeal(query: string) {
//         // const response = await axios.get(`${this.URL}/search.php?s=${query}`);
//         // return response.data.meals;
//         return meals.filter((meal) => meal.strMeal.toLowerCase().includes(query.toLowerCase()))
//     }
//     async getCategories() {
//         // const response = await axios.get(`${this.URL}/categories.php`);
//         // return response.data.categories;
//         return categories;
//     }
//     async getMealsByCategory(category: string) {
//         // const response = await axios.get(`${this.URL}/filter.php?c=${category}`);
//         // return response.data.meals;
//         return meals.filter((meal) => {
//             return meal.strCategory === category;
//         })
//     }
//     async getOrigins() {
//         // const response = await axios.get(`${this.URL}/list.php?a=list`);
//         // return response.data.meals;
//         return origins
//     }
//     async getMealsByOrigin(area: string) {
//         // const response = await axios.get(`${this.URL}/filter.php?a=${area}`);
//         // return response.data.meals;
//         return meals.filter((meal) => meal.strArea === area)
//     }
//     async getRandomMeal() {
//         // const response = await axios.get(`${this.URL}/random.php`);
//         // return response.data.meals[0];
//         const randomIndex = Math.floor(Math.random() * meals.length)
//         return meals[randomIndex];
//     }
//     async getSpecificRecipe(id: string) {
//         // const response = await axios.get(`${this.URL}/lookup.php?i=${id}`);
//         // return response.data.meals[0];
//         return meals.find((meal) =>  meal.idMeal === id)
//     }
// }
// export default APIMeal;