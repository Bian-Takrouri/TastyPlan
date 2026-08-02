import { RecipeCard } from "./RecipeCard";
import type { Recipe } from "../data/meals";
import "./AllRecipeCard.css";
type Props ={
    meals : Recipe[];
}
function AllRecipeCard({ meals}: Props ) {
    return (
        <div className="recipeGrid">
            {meals.map((meal) => (
                <RecipeCard key={meal.idMeal} meal={meal} />
            ))}
        </div>
    );
}
export default AllRecipeCard ;