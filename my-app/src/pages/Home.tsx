import { useState, useEffect } from "react";
import AllRecipeCard from "../components/AllRecipeCard";
import type { Recipe } from "../data/meals";
import useDebounce from "../hooks/useDebounce"
import LoadingSkeleton from "../components/LoadingSkeleton";
import SearchTheMeal, { getMealsByCategory, getMealsByOrigin, getRandomMeal } from "../services/APImeal";
import RecipeModal from "../components/RecipeModal";
import SpecificRecipe from "../components/SpecificRecipe";
import { getSpecificRecipe } from "../services/APImeal";
import "./Home.css";

type Props = {
    query: string;
    category: string;
    origin: string;
};

function Home({ query, category, origin }: Props) {
    const [meals, setmeals] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [randomMeal, setRandomMeal] = useState<Recipe | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [specificMeal, setSpecificMeal] = useState<Recipe | null>(null);
    const [showSpecificMeal, setShowSpecificMeal] = useState(false);

    const debouncedQuery = useDebounce(query);
    useEffect(() => {
        async function getMeal() {
            if (debouncedQuery.trim() === "" && category.trim() === "" && origin.trim() === "") {
                setmeals([]);
                return;
            }
            setLoading(true);
            try {
                let data;
                if (category)
                    data = await getMealsByCategory(category)
                else if (origin)
                    data = await getMealsByOrigin(origin)
                else
                    data = await SearchTheMeal(debouncedQuery);
                if (data)
                    setmeals(data);
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
            const meal = await getRandomMeal();
            setRandomMeal(meal);
            setShowModal(true);
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }
    const handleRecipeClick = async (id:string) => {
        try {
            setLoading(true);
            const meal = await getSpecificRecipe(id);
            setSpecificMeal(meal);
            setShowSpecificMeal(true);
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <button onClick={handleRandomMeal} className="Surprise">Surprise Me ! 🎁🎉</button>
            {loading ? (<LoadingSkeleton />) : (<AllRecipeCard meals={meals} onRecipeClick={handleRecipeClick} />)}
            {showModal && (<RecipeModal meal={randomMeal} closeModal={() => setShowModal(false)} />)}
            {showSpecificMeal && (<SpecificRecipe meal={specificMeal} closeModal={() => setShowSpecificMeal(false)} />)}
        </div>
    );
}

export default Home;
