import type { Recipe } from "../data/meals";
import "./RecipeModal.css";
type Props = {
    meal: Recipe |null;
    closeModal:()=>void;
};
function RecipeModal({meal, closeModal}:Props){
    if(!meal) 
        return null;
    return (
        <div className="container">
            <div className="modal">
                <button 
                    className="close"
                    onClick={closeModal}
                >X</button>
                <img 
                    src={meal.strMealThumb}
                    alt={meal.strMeal}/>
                <h2>{meal.strMeal}</h2>
                <p>Category: {meal.strCategory}</p>
                <p>Origin:{meal.strArea}</p>
                <p>{meal.strInstructions}</p>
            </div>
        </div>
    )
}
export default RecipeModal;