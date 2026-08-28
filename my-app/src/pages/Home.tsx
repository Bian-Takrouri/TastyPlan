import { useState, useEffect, type Dispatch } from "react";
import AllRecipeCard from "../components/AllRecipeCard";
import type { Recipe } from "../data/meals";
import useDebounce from "../hooks/useDebounce"
import LoadingSkeleton from "../components/LoadingSkeleton";
import MealAPI from "../services/APImeal";
import SpecificRecipe from "../components/SpecificRecipe";
import type { mealPlannerAction } from "../reducer/mealPlannerReducer";
import "./Home.css";

type Props = {
    query: string;
    category: string;
    origin: string;
    dispatch: Dispatch<mealPlannerAction>;
};
function Home({ query, category, origin, dispatch }: Props) {
    const mealAPI = new MealAPI();
    const [meals, setmeals] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [randomMeal, setRandomMeal] = useState<Recipe | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [specificMeal, setSpecificMeal] = useState<Recipe | null>(null);
    const [showSpecificMeal, setShowSpecificMeal] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const debouncedQuery = useDebounce(query);
    useEffect(() => {
        async function getMeal() {
            setError("");
            if (debouncedQuery.trim() === "" && category.trim() === "" && origin.trim() === "") {
                setMessage(" ")
                const dessert = await mealAPI.getMealsByCategory("Dessert");
                setmeals(dessert);
                return;
            }
            setLoading(true);
            try {
                let data;
                setMessage("");
                if (category)
                    data = await mealAPI.getMealsByCategory(category)
                else if (origin)
                    data = await mealAPI.getMealsByOrigin(origin)
                else
                    data = await mealAPI.SearchTheMeal(debouncedQuery);
                if (data && data.length > 0) {
                    setmeals(data);
                    setMessage("");
                }
                else {
                    if (origin) {
                        setMessage(`No recipes found for ${origin} cuisine.`);
                    }
                }
            } catch (error) {
                console.error("Error fetching meals:", error);
            }
            finally {
                setLoading(false);
            }
        }
        getMeal();
    }, [debouncedQuery, category, origin])

    const handleRandomMeal = async () => {
        try {
            setLoading(true);
            const meal = await mealAPI.getRandomMeal();
            setRandomMeal(meal);
            setShowModal(true);
        } catch (error) {
            console.error(error);
            setError("Unable to load recipes. Please check your internet connection and try again.");
        }
        finally {
            setLoading(false);
        }
    }
    const handleRecipeClick = async (id: string) => {
        try {
            setLoading(true);
            const meal = await mealAPI.getSpecificRecipe(id);
            setSpecificMeal(meal);
            setShowSpecificMeal(true);
        } catch (error) {
            console.error(error);
            setError("Unable to load recipes. Please check your internet connection and try again.");
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <button onClick={handleRandomMeal} className="Surprise">Surprise Me ! 🎁🎉</button>
            {message && (<><h2>{message}</h2>{origin ? (<h4>
                Unfortunately, we couldn't find any recipes from this country.</h4>):(
            <h4>Explore our tasty dessert collection and discover something delicious to cook!</h4>)}</>)}
            {error && (<div className="errorMessage">{error}</div>)}
            {loading ? (<LoadingSkeleton />) : (<AllRecipeCard meals={meals} onRecipeClick={handleRecipeClick} />)}
            {showModal && (<SpecificRecipe meal={randomMeal} closeModal={() => setShowModal(false)}  dispatch={dispatch}/>)}
            {showSpecificMeal && (<SpecificRecipe meal={specificMeal} closeModal={() => setShowSpecificMeal(false)} dispatch={dispatch} />)}
        </div>
    );
}

export default Home;