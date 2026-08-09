import axios from "axios";

class APIMeal {
    private URL = "https://www.themealdb.com/api/json/v1/1";

    async SearchTheMeal(query: string) {
        const response = await axios.get(`${this.URL}/search.php?s=${query}`);
        return response.data.meals;
    }
    async getCategories() {
        const response = await axios.get(`${this.URL}/categories.php`);
        return response.data.categories;
    }
    async getMealsByCategory(category: string) {
        const response = await axios.get(`${this.URL}/filter.php?c=${category}`);
        return response.data.meals;
    }
    async getOrigins() {
        const response = await axios.get(`${this.URL}/list.php?a=list`);
        return response.data.meals;
    }
    async getMealsByOrigin(area: string) {
        const response = await axios.get(`${this.URL}/filter.php?a=${area}`);
        return response.data.meals;
    }
    async getRandomMeal() {
        const response = await axios.get(`${this.URL}/random.php`);
        return response.data.meals[0];
    }
    async getSpecificRecipe(id: string) {
        const response = await axios.get(`${this.URL}/lookup.php?i=${id}`);
        return response.data.meals[0];
    }
}
export default APIMeal ;