const URL ="https://www.themealdb.com/api/json/v1/1";

async function SearchTheMeal(query : string){
    const response = await fetch(`${URL}/search.php?s=${query}`);
    const data = await response.json();
    return data.meals;
}
export default SearchTheMeal;

export async function getCategories() {
    const response = await fetch(`${URL}/categories.php`);
    const data = await response.json();
    return data.categories;
}

export async function getMealsByCategory(category:string){
    const response = await fetch(`${URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals;
}
export async function getOrigins(){
    const response = await fetch(`${URL}/list.php?a=list`);
    const data = await response.json();
    return data.meals;
}
export async function getMealsByOrigin(area: string){
    const response = await fetch(`${URL}/filter.php?a=${area}`);
    const data = await response.json();
    return data.meals;
}

export async function getRandomMeal() {
    const response = await fetch(`${URL}/random.php`);
    if (!response.ok) {
        throw new Error("Failed to fetch random meal");
    }
    const data = await response.json();
    return data.meals[0];
}
export async function getSpecificRecipe(id : string){
    const response = await fetch(`${URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals[0];
}