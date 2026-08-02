import type { Recipe } from "../data/meals";
import "./RecipeCard.css";

export function RecipeCard({ meal }: { meal: Recipe }) {
    return (
        <div className="card">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
            <div className="cardContent">
                <h2>{meal.strMeal}</h2>
                <h3>{meal.strCategory}</h3>
                <h3>{meal.strArea}</h3>
            </div>
        </div>
    );
}