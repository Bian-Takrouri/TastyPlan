import type { Recipe } from "../data/meals";

export type PlannedMeal = {
    meal: Recipe;
    itemId: number;
};

export type mealPlannerState = {
    [day: string]: PlannedMeal | null;
};

export type mealPlannerAction =
    | { type: "Add"; day: string; meal: Recipe; itemId: number }
    | { type: "Remove"; day: string }
    | { type: "ClearWeek" };

export const initialState: mealPlannerState = {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null
};

export function mealPlannerReducer(
    state: mealPlannerState,
    action: mealPlannerAction
): mealPlannerState {
    switch (action.type) {
        case "Add":
            return {
                ...state,
                [action.day]: {
                    meal: action.meal,
                    itemId: action.itemId
                }
            };
        case "Remove":
            return { ...state, [action.day]: null };
        case "ClearWeek":
            return initialState;
        default:
            return state;
    }
}