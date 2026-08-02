import { useEffect, useState } from "react";
import { getCategories } from "../services/APImeal";
import type { Category } from "../data/meals";
import "./CategoryFilter.css";

type Props ={
    onCategorySelect : (category : string)=> void ;
}

export function CategoryFilter({onCategorySelect}:Props){
    const [allcategory , setallcategory]=useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    
    useEffect(()=>{
        async function fetchCategories() {
            const data = await getCategories() ;
            setallcategory(data);
        }
        fetchCategories();
    },[])

    return(
        <div className="categoryFilter">
            {
                allcategory.map((cat)=>(
                    <button key={cat.idCategory} 
                    className={selectedCategory===cat.strCategory? "active" : "notActive"}
                    onClick={()=> {setSelectedCategory(cat.strCategory) ;onCategorySelect(cat.strCategory)}} > 
                    {cat.strCategory}
                    </button>
                ))
            }
        </div>
    )

}
