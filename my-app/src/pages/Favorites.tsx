import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Recipe } from "../data/meals";
import AllRecipeCard from "../components/AllRecipeCard";
import SpecificRecipe from "../components/SpecificRecipe";
import MealAPI from "../services/APImeal";
import type { Dispatch } from "react";
import type { mealPlannerAction} from "../reducer/mealPlannerReducer";
import "./Favorites.css";
type Props = {
    dispatch: Dispatch<mealPlannerAction>;
}
function Favorites({dispatch}:Props) {
    const mealAPI =new MealAPI();
    const [favorites] = useLocalStorage<Recipe[]>("favorites", []);
    const [specificMeal, setSpecificMeal] = useState<Recipe | null>(null);
    const [showSpecificMeal, setShowSpecificMeal] = useState(false);
    async function handleRecipe(id: string) {
        try {
            const meal = await mealAPI.getSpecificRecipe(id);
            setSpecificMeal(meal);
            setShowSpecificMeal(true)
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="favoritesContainer">
            <h1>❤️Favorite Meals !😋</h1>
            {
                favorites.length === 0 ? (
                    <div className="emptyFavorites">
                        <h2>No favorite recipes yet.</h2>
                        <p> Start adding your favorite meals by clicking the ❤️ icon.</p>
                    </div>
                ) : (
                    <AllRecipeCard meals={favorites} onRecipeClick={handleRecipe} />
                )
            }
            {showSpecificMeal && (<SpecificRecipe meal={specificMeal} closeModal={() => setShowSpecificMeal(false)} dispatch={dispatch} />)}
        </div>
    );
}
export default Favorites;