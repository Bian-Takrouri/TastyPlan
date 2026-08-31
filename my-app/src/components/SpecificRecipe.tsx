import type { Recipe } from "../data/meals";
import { useEffect, useState, type Dispatch } from "react";
import "./RecipeModal.css";
import "./button.css";
import fullHeart from "../assets/icons/fullHeart.svg";
import emptyHeart from "../assets/icons/emptyHeart.svg";
import type { mealPlannerAction } from "../reducer/mealPlannerReducer";
import { getFavorites, toggleFavorite, addMealToPlan } from "../services/APIuser";

type Props = {
    meal: Recipe | null;
    closeModal: () => void;
    dispatch: Dispatch<mealPlannerAction>;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function SpecificRecipe({ meal, closeModal, dispatch }: Props) {
    const [selectedDay, setSelectedDay] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!meal || !localStorage.getItem("token")) return;
        const currentMeal = meal;

        async function loadFavoriteStatus() {
            try {
                const favorites = await getFavorites();
                setIsFavorite(favorites.some(item => item.idMeal === currentMeal.idMeal));
            } catch (error) {
                console.error("Failed to load favorite status:", error);
            }
        }

        loadFavoriteStatus();
    }, [meal]);

    if (!meal) return null;

    const currentMeal = meal;
    const ingredients: { ingredient: string; measure: string }[] = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = currentMeal[`strIngredient${i}` as keyof Recipe];
        const measure = currentMeal[`strMeasure${i}` as keyof Recipe];

        if (ingredient?.trim()) {
            ingredients.push({
                ingredient,
                measure: measure ?? ""
            });
        }
    }

    const stepByStep = currentMeal.strInstructions
        .split(".")
        .map(step => step.trim())
        .filter(Boolean);

    async function handleFavorite() {
        if (!localStorage.getItem("token")) {
            alert("Please login first.");
            return;
        }

        try {
            setLoading(true);
            const result = await toggleFavorite(currentMeal.idMeal);
            setIsFavorite(result.isFavorite);
        } catch (error) {
            console.error("Failed to update favorite:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToMealPlan() {
        if (!selectedDay) return;

        if (!localStorage.getItem("token")) {
            alert("Please login first.");
            return;
        }

        try {
            setLoading(true);
            const result = await addMealToPlan(currentMeal.idMeal, selectedDay);

            dispatch({
                type: "Add",
                day: selectedDay,
                meal: currentMeal,
                itemId: result.data?.id ?? result.id
            });

            setSelectedDay("");
        } catch (error) {
            console.error("Failed to add meal to plan:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="modal">
                <button className="close" onClick={closeModal}>X</button>

                <div className="imageContainer">
                    <img src={currentMeal.strMealThumb} alt={currentMeal.strMeal} />
                    <button
                        type="button"
                        className="heartIcon"
                        onClick={handleFavorite}
                        disabled={loading}
                    >
                        <img
                            src={isFavorite ? fullHeart : emptyHeart}
                            alt="Favorite"
                        />
                    </button>
                </div>

                <h2>{currentMeal.strMeal}</h2>

                <h3>Ingredients:</h3>
                <ul className="ingredientsList">
                    {ingredients.map((item, index) => (
                        <li key={index}>
                            <label>
                                <input type="checkbox" />
                                {item.measure} {item.ingredient}
                            </label>
                        </li>
                    ))}
                </ul>

                {currentMeal.strYoutube && (
                    <a
                        href={currentMeal.strYoutube}
                        target="_blank"
                        rel="noreferrer"
                        className="youtubeButton"
                    >
                        ▶️ YouTube 🔴 Watch on YouTube
                    </a>
                )}

                <div className="mealPlan">
                    <select
                        className="selectDay"
                        value={selectedDay}
                        onChange={event => setSelectedDay(event.target.value)}
                    >
                        <option value="">Select a day</option>
                        {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>

                    <button
                        className="addButton"
                        onClick={handleAddToMealPlan}
                        disabled={loading}
                    >
                        Add to Meal Plan
                    </button>
                </div>

                <h3>Category:</h3>
                <p>{currentMeal.strCategory}</p>

                <h3>Origin:</h3>
                <p>{currentMeal.strArea}</p>

                <h3>Instructions:</h3>
                <ol>
                    {stepByStep.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

export default SpecificRecipe;