import { GroceryList } from "../components/GroceryList";
import type { mealPlannerState } from "../reducer/mealPlannerReducer";

type Props = {
    mealPlannerState: mealPlannerState;
};

function Grocery({ mealPlannerState }: Props) {
    return (
        <div className="groceryPage">
            <GroceryList mealPlannerState={mealPlannerState} />
        </div>
    );
}

export default Grocery;