import { useEffect,useState,type Dispatch} from "react";
import type { Recipe } from "../data/meals";
import AllRecipeCard from "../components/AllRecipeCard";
import SpecificRecipe from "../components/SpecificRecipe";
import MealAPI from "../services/APImeal";
import {getFavorites} from "../services/APIuser";
import type {mealPlannerAction} from "../reducer/mealPlannerReducer";
import "./Favorites.css";

type Props = {
    dispatch: Dispatch<mealPlannerAction>;
};

function Favorites({ dispatch }: Props) {
    const [favorites, setFavorites] =
        useState<Recipe[]>([]);

    const [specificMeal, setSpecificMeal] =
        useState<Recipe | null>(null);

    const [loading, setLoading] =
        useState(true);

    const mealAPI = new MealAPI();

    useEffect(() => {
        async function loadFavorites() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error(
                    "Failed to load favorites:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadFavorites();
    }, []);

    const handleRecipe = async (id: string) => {
        try {
            const meal =await mealAPI.getSpecificRecipe(id);
            setSpecificMeal(meal);
        } catch (error) {
            console.error(
                "Failed to load recipe:",
                error
            );
        }
    };

    if (loading) {
        return (
            <div className="favoritesContainer">
                Loading...
            </div>
        );
    }

    if (!localStorage.getItem("token")) {
        return (
            <div className="favoritesContainer">
                <h2>Please login to view your favorite meals.</h2>
            </div>
        );
    }

    return (
        <div className="favoritesContainer">

            <h1>❤️ Favorite Meals! 😋</h1>

            {favorites.length === 0 ? (
                <div className="emptyFavorites">
                    <h2>
                        No favorite recipes yet.
                    </h2>

                    <p>
                        Start adding your favorite meals
                        by clicking the ❤️ icon.
                    </p>
                </div>
            ) : (
                <AllRecipeCard
                    meals={favorites}
                    onRecipeClick={handleRecipe}
                />
            )}

            {specificMeal && (
                <SpecificRecipe
                    meal={specificMeal}
                    closeModal={() =>
                        setSpecificMeal(null)
                    }
                    dispatch={dispatch}
                />
            )}

        </div>
    );
}

export default Favorites;