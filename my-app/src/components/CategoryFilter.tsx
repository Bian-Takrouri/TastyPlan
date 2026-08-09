import { useEffect, useState } from "react";
import MealAPI from "../services/APImeal";
import type { Category } from "../data/meals";
import "./CategoryFilter.css";

type Props ={
    value:string;
    onCategorySelect : (category : string)=> void ;
}

export function CategoryFilter({value,onCategorySelect}:Props){
    const mealAPI =new MealAPI();
    const [allcategory , setallcategory]=useState<Category[]>([]);
    useEffect(()=>{
        async function fetchCategories() {
            const data = await mealAPI.getCategories() ;
            setallcategory(data);
        }
        fetchCategories();
    },[])

    return(
        <div className="categoryFilter">
            {
                allcategory.map((cat)=>(
                    <button key={cat.idCategory} 
                    className={value===cat.strCategory? "active" : "notActive"}
                    onClick={()=> {onCategorySelect(cat.strCategory)}} > 
                    {cat.strCategory}
                    </button>
                ))
            }
        </div>
    )

}
