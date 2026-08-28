import { MealPlanner } from "../components/MealPlanner";
import type { mealPlannerState, mealPlannerAction } from "../reducer/mealPlannerReducer";
import type { Dispatch } from "react";

type Props = {
    mealPlannerState: mealPlannerState;
    dispatch: Dispatch<mealPlannerAction>;
};

function MealPlannerPage({ mealPlannerState, dispatch }: Props) {
    return <MealPlanner mealPlannerState={mealPlannerState} dispatch={dispatch} />;
}

export default MealPlannerPage;