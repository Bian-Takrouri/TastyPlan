import axios from "axios";
import { writeFile } from "fs/promises";

const URL = "https://www.themealdb.com/api/json/v1/1";
async function fetchMeals() {
    const categoriesResponse = await axios.get(`${URL}/categories.php`);
    const categories = categoriesResponse.data.categories;
    await writeFile("data/categories.json", JSON.stringify(categories, null, 2))
    console.log("Categories saved successfully!")

    const originsResponse = await axios.get(`${URL}/list.php?a=list`)
    const origins = originsResponse.data.meals;
    await writeFile("data/origins.json", JSON.stringify(origins ,null ,2));

    const mealsMap = new Map();
    for (const category of categories) {
        console.log(`Fetching ${category.strCategory}...`);//for testing ^-^
        const response = await axios.get(`${URL}/filter.php`, {
            params: { c: category.strCategory }
        })
        const meals =response.data.meals??[];
        for(const meal of meals){
            mealsMap.set(meal.idMeal , meal);
        }
    }
    console.log(`Found ${mealsMap.size} unique meals.`); // for testinf ^-^
    const meals=[]
    for(const meal of mealsMap.values()){
        console.log(`Fetching recipe ${meal.idMeal}...`);
        const response =await axios.get(`${URL}/lookup.php?i=${meal.idMeal}`)
        if(response.data.meals?.[0]){
            meals.push(response.data.meals[0]);
        }
    }
    await writeFile("data/meals.json",JSON.stringify(meals , null ,2))
    console.log(`Saved ${meals.length} meals successfully!`);
}
fetchMeals();
