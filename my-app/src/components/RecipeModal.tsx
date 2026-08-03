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
                <h3>Category: </h3><p>{meal.strCategory}</p>
                <h3>Origin:</h3><p>{meal.strArea}</p>
                <h3>Instructions:</h3><p>{meal.strInstructions}</p>
            </div>
        </div>
    )
}
export default RecipeModal;