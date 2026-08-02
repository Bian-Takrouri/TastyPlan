import { RecipeCard } from "./RecipeCard";
import type { Recipe } from "../data/meals";
import "./AllRecipeCard.css";

type Props ={
    meals : Recipe[];
    onRecipeClick :(id:string)=> void
}
function AllRecipeCard({ meals , onRecipeClick}: Props ) {
    return (
        <div className="recipeGrid">
            {meals.map((meal) => (
                <RecipeCard key={meal.idMeal} meal={meal} onClick={() => onRecipeClick(meal.idMeal)}/>
            ))}
        </div>
    );
}
export default AllRecipeCard ;