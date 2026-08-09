import type { Recipe } from "../data/meals";
import { useState, type Dispatch } from "react";
import "./RecipeModal.css";
import fullHeart from "../assets/icons/fullHeart.svg";
import emptyHeart from "../assets/icons/emptyHeart.svg";
import type { mealPlannerAction } from "../reducer/mealPlannerReducer";
import {useLocalStorage} from "../hooks/useLocalStorage";
type Props = {
    meal: Recipe | null;
    closeModal: () => void;
    dispatch: Dispatch<mealPlannerAction>;
}
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function SpecificRecipe({ meal, closeModal, dispatch }: Props) {
    const [selectedDay, setSelectedDay] = useState("");
    
    const [favorites, setFavorites] =useLocalStorage<Recipe[]>("favorites",[]);
    if (!meal)
        return null;
    const like = favorites.some((item:Recipe)=>item.idMeal=== meal.idMeal);
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof Recipe];
        const measure = meal[`strMeasure${i}` as keyof Recipe];
        if (ingredient && ingredient.toString().trim() !== "") {
            ingredients.push({ ingredient, measure });
        }
    }
    const stepByStep = meal.strInstructions.split(".").filter(stepByStep => stepByStep.trim() !== "");

    return (
        <div className="container">
            <div className="modal">
                <button
                    className="close"
                    onClick={closeModal}
                >X</button>

                <div className="imageContainer">
                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                    <div
                        className="heartIcon"
                        onClick={() => {
                            if(like)
                                setFavorites(prev=>prev.filter(item=> item.idMeal!==meal.idMeal));
                            else
                                setFavorites(prev=>[...prev,meal])
                        }
                    }>
                        <img src={like ? fullHeart : emptyHeart} alt="Favorite" />
                    </div>
                </div>

                <h2>{meal.strMeal}</h2>
                <h3>Ingredients : </h3>
                <ul className="ingredientsList">
                    {
                        ingredients.map((item, key) => (<li key={key}><label>
                            <input type="checkbox" /> {item.measure} {item.ingredient}</label></li>))
                    }
                </ul>
                {
                    meal.strYoutube && (<a href={meal.strYoutube} target="_blank" className="youtubeButton">▶️YouTube🔴 Watch on YouTube</a>)
                }
                <div className="mealPlan">
                    <select className="selectDay" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                        <option value="">Select a day</option>
                        {days.map((day) => (<option key={day} value={day}>{day}</option>))}
                    </select>
                    <button className="addButton" onClick={() => {
                        if (selectedDay)
                            dispatch({ type: "Add", day: selectedDay, meal: meal });
                        setSelectedDay("")
                    }}>
                        Add to Meal Plan</button>
                </div>
                <h3>Category:</h3> <p>{meal.strCategory}</p>
                <h3>Origin: </h3><p>{meal.strArea}</p>
                <h3>Instructions: </h3><ol>{stepByStep.map((step, key) => (<li key={key}>{step.trim()}</li>))}</ol>
            </div>
        </div>
    )
}
export default SpecificRecipe;