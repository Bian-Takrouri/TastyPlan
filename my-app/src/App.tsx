import { useState } from 'react';
import './App.css'
/*import SearchBar from "./components/SearchBar";*/
import Header from "./components/Header";
import Home from "./pages/Home"
import { CategoryFilter } from "./components/CategoryFilter";
import {OriginFilter } from "./components/OriginFilter";

function App() {
  const [searchMeal, setsearchMeal] = useState("");
  const[selectedCategory , setselectedCategory]=useState("")
  const[selectedOrigin , setselectedOrigin]=useState("")
  return (
    <div className="hallApp">
      <Header searchForValue={setsearchMeal} />
      <Home query={searchMeal} category={selectedCategory} origin={selectedOrigin} />
      <CategoryFilter onCategorySelect={setselectedCategory}/>
      <OriginFilter onOriginSelect={setselectedOrigin}/>
    </div>
  )
}

export default App
