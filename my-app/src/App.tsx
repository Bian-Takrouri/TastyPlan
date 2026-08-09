import { useEffect, useReducer, useState } from 'react';
import './App.css'
import { Routes, Route } from "react-router-dom";
/*import SearchBar from "./components/SearchBar";*/
import Header from "./components/Header";
import Home from "./pages/Home"
import { CategoryFilter } from "./components/CategoryFilter";
import { OriginFilter } from "./components/OriginFilter";
import { mealPlannerReducer, initialState } from "./reducer/mealPlannerReducer";
import { useTheme } from "./context/ThemeContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Favorites from "./pages/Favorites";
import Grocery from './pages/Grocery';
import MealPlannerPage from './pages/MealPlannerPage';
function App() {
  const { theme } = useTheme();
  const [searchMeal, setsearchMeal] = useState("");
  const [selectedCategory, setselectedCategory] = useState("")
  const [selectedOrigin, setselectedOrigin] = useState("")
  const [savedMealPlanner, setSavedMealPlanner] = useLocalStorage("mealPlanner", initialState);
  const [mealPlannerState, dispatch] = useReducer(mealPlannerReducer, savedMealPlanner);
  useEffect(() => {
    setSavedMealPlanner(mealPlannerState)
  }, [mealPlannerState])
  const handleSearch = (value: string) => { setsearchMeal(value); setselectedCategory(""); setselectedOrigin(""); };
  const handleCategory = (category: string) => { setselectedCategory(category); setselectedOrigin(""); setsearchMeal(""); };
  const handleOrigin = (origin: string) => { setselectedOrigin(origin); setselectedCategory(""); setsearchMeal(""); };

  return (
    <div className={`hallApp ${theme}`}>
      <Header value={searchMeal} searchForValue={handleSearch} />
      <Routes>
        <Route path="/" element={<>
          <h1 className="CategoriesName">Categories Filter</h1><CategoryFilter value={selectedCategory} onCategorySelect={handleCategory} />
          <h1 className="OriginsName">Origins Filter</h1><OriginFilter value={selectedOrigin} onOriginSelect={handleOrigin} />
          <Home query={searchMeal} category={selectedCategory} origin={selectedOrigin} dispatch={dispatch} />
        </>} />
        <Route path="/grocery" element={<Grocery mealPlannerState={mealPlannerState} />} />
        <Route path='/favorites' element={<Favorites dispatch={dispatch} />} />
        <Route path='/mealPlannerPage' element={<MealPlannerPage mealPlannerState={mealPlannerState} dispatch={dispatch} />} />
      </Routes>
    </div>
  )
}

export default App
