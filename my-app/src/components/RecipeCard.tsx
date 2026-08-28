import type { Recipe } from "../data/meals";
import "./RecipeCard.css";

type Props = {
    meal: Recipe;
    onClick: () => void;
}

export function RecipeCard({ meal, onClick }: Props) {
    return (
        <div className="card" onClick={onClick}>
            <img src={meal.strMealThumb} alt={meal.strMeal} />
            <div className="cardContent">
                <h2>{meal.strMeal}</h2>
                <h3>{meal.strCategory}</h3>
                <h3>{meal.strArea}</h3>
            </div>
        </div>
    );
}