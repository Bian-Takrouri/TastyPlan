import "./MealPlanner.css";
import {type mealPlannerState, type mealPlannerAction } from "../reducer/mealPlannerReducer";
import { type Dispatch } from "react";

const Days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
type Props={
    mealPlannerState :mealPlannerState;
    dispatch : Dispatch<mealPlannerAction>;
}
export function MealPlanner({mealPlannerState,dispatch}:Props) {
    return (
        <div className="planner">
            <h2><br />7 Days Meal Planner</h2>
            <button className="clearButton"
                onClick={() =>
                    dispatch({
                        type: "ClearWeek"
                    })
                }>Clear Week</button>

            <div className="plannerGrid">
                {
                    Days.map((day) => <div key={day} className="dayCard">
                        <h3>{day}</h3>
                        {
                            mealPlannerState[day] ? <div className="plannedMeal">
                                <img src={mealPlannerState[day]?.strMealThumb}
                                    alt={mealPlannerState[day]?.strMeal} />
                                <p>{mealPlannerState[day]?.strMeal}</p>
                                <button onClick={()=>{ dispatch({ type:"Remove",day:day});}}>Remove</button>
                            </div>
                                : <div className="noSelectedMeal">no meal selected</div>


                        }
                    </div>)

                }
            </div>
        </div>
    );
}






                                                    

                                                

                                                   

                                           

                                               

                                           

                                       
                                            

                                        