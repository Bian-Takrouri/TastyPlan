import { useReducer, useState } from 'react';
import './App.css'
/*import SearchBar from "./components/SearchBar";*/
import Header from "./components/Header";
import Home from "./pages/Home"
import { CategoryFilter } from "./components/CategoryFilter";
import {OriginFilter } from "./components/OriginFilter";
import {MealPlanner} from "./components/MealPlanner";
import {mealPlannerReducer, initialState} from "./reducer/mealPlannerReducer";

function App() {
  const [searchMeal, setsearchMeal] = useState("");
  const[selectedCategory , setselectedCategory]=useState("")
  const[selectedOrigin , setselectedOrigin]=useState("")
  const[mealPlannerState , dispatch]=useReducer(mealPlannerReducer,initialState);

  const handleSearch = (value: string) => {setsearchMeal(value);setselectedCategory("");setselectedOrigin("");};
  const handleCategory = (category: string) => {setselectedCategory(category);setselectedOrigin("");setsearchMeal("");};
  const handleOrigin = (origin: string) => {setselectedOrigin(origin);setselectedCategory("");setsearchMeal("");};
    
  return (
    <div className="hallApp">
      <Header value={searchMeal}searchForValue={handleSearch} />
      <Home query={searchMeal} category={selectedCategory} origin={selectedOrigin} dispatch={dispatch}/>
      <h1 className="CategoriesName">Categories Filter</h1><CategoryFilter value={selectedCategory} onCategorySelect={handleCategory}/>
      <h1 className="OriginsName">Origins Filter</h1><OriginFilter value={selectedOrigin} onOriginSelect={handleOrigin}/>
      <MealPlanner mealPlannerState={mealPlannerState} dispatch={dispatch}/>
    </div>
  )
}

export default App
