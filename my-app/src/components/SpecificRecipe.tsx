import type { Recipe } from "../data/meals";
import { useState, type Dispatch } from "react";
import "./RecipeModal.css";
import "./button.css";
import fullHeart from "../assets/icons/fullHeart.svg";
import emptyHeart from "../assets/icons/emptyHeart.svg";
import type { mealPlannerAction } from "../reducer/mealPlannerReducer";
import MealAPI from "../services/APImeal";

type Props = {
    meal: Recipe | null;
    closeModal: () => void;
    dispatch: Dispatch<mealPlannerAction>;
};

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function SpecificRecipe({ meal, closeModal, dispatch }: Props) {
    const [selectedDay, setSelectedDay] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [savingFavorite, setSavingFavorite] = useState(false);
    const mealAPI = new MealAPI();

    if (!meal) return null;

    const ingredients: { ingredient: string; measure: string }[] = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof Recipe];
        const measure = meal[`strMeasure${i}` as keyof Recipe];

        if (typeof ingredient === "string" && ingredient.trim()) {
            ingredients.push({
                ingredient,
                measure: typeof measure === "string" ? measure : ""
            });
        }
    }

    const steps = meal.strInstructions
        .split(".")
        .map(step => step.trim())
        .filter(Boolean);

    const handleFavorite = async () => {
        if (savingFavorite) return;

        try {
            setSavingFavorite(true);
            const result = await mealAPI.toggleFavorite(meal.idMeal);
            setIsFavorite(result.isFavorite);
        } catch (error) {
            console.error("Failed to update favorite:", error);
        } finally {
            setSavingFavorite(false);
        }
    };

    const handleAddToPlan = async () => {
        if (!selectedDay) return;

        try {
            const item = await mealAPI.saveMealPlanItem(meal.idMeal, selectedDay);
            dispatch({
                type: "Add",
                day: selectedDay,
                meal,
                itemId: item.id
            });
            setSelectedDay("");
        } catch (error) {
            console.error("Failed to save meal plan:", error);
        }
    };

    return (
        <div className="container">
            <div className="modal">
                <button className="close" onClick={closeModal}>X</button>

                <div className="imageContainer">
                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                    <button className="heartIcon" onClick={handleFavorite} disabled={savingFavorite}>
                        <img src={isFavorite ? fullHeart : emptyHeart} alt="Favorite" />
                    </button>
                </div>

                <h2>{meal.strMeal}</h2>

                <h3>Ingredients:</h3>
                <ul className="ingredientsList">
                    {ingredients.map((item, index) => (
                        <li key={index}>
                            <label>
                                <input type="checkbox" /> {item.measure} {item.ingredient}
                            </label>
                        </li>
                    ))}
                </ul>

                {meal.strYoutube && (
                    <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="youtubeButton">
                        ▶️ YouTube 🔴 Watch on YouTube
                    </a>
                )}

                <div className="mealPlan">
                    <select className="selectDay" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                        <option value="">Select a day</option>
                        {days.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>

                    <button className="addButton" onClick={handleAddToPlan}>
                        Add to Meal Plan
                    </button>
                </div>

                <h3>Category:</h3>
                <p>{meal.strCategory}</p>

                <h3>Origin:</h3>
                <p>{meal.strArea}</p>

                <h3>Instructions:</h3>
                <ol>
                    {steps.map((step, index) => <li key={index}>{step}</li>)}
                </ol>
            </div>
        </div>
    );
}

export default SpecificRecipe;