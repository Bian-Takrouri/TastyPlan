import "./MealPlanner.css";
import { type mealPlannerState, type mealPlannerAction } from "../reducer/mealPlannerReducer";
import { useState, type Dispatch } from "react";
import "./button.css";
import type { Recipe } from "../data/meals";
import SpecificRecipe from "./SpecificRecipe";
import MealAPI from "../services/APImeal";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

type Props = {
    mealPlannerState: mealPlannerState;
    dispatch: Dispatch<mealPlannerAction>;
};

export function MealPlanner({ mealPlannerState, dispatch }: Props) {
    const [meal, setMeal] = useState<Recipe | null>(null);
    const [showMeal, setShowMeal] = useState(false);
    const mealAPI = new MealAPI();

    const removeMeal = async (day: string, itemId: number) => {
        try {
            await mealAPI.removeMealPlanItem(itemId);
            dispatch({ type: "Remove", day });
        } catch (error) {
            console.error("Failed to remove meal:", error);
        }
    };

    return (
        <div className="planner">
            <h2><br />7 Days Meal Planner</h2>

            <div className="plannerGrid">
                {days.map(day => {
                    const planned = mealPlannerState[day];

                    return (
                        <div key={day} className="dayCard">
                            <h3>{day}</h3>

                            {planned ? (
                                <div className="plannedMeal">
                                    <img
                                        src={planned.meal.strMealThumb}
                                        alt={planned.meal.strMeal}
                                        onClick={() => {
                                            setMeal(planned.meal);
                                            setShowMeal(true);
                                        }}
                                    />
                                    <p>{planned.meal.strMeal}</p>

                                    <button
                                        className="buttonRemove"
                                        onClick={() => removeMeal(day, planned.itemId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="noSelectedMeal">no meal selected</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showMeal && meal && (
                <SpecificRecipe
                    meal={meal}
                    closeModal={() => {
                        setShowMeal(false);
                        setMeal(null);
                    }}
                    dispatch={dispatch}
                />
            )}
        </div>
    );
}