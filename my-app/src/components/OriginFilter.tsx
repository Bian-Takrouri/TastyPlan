import { useEffect, useState } from "react";
import { getOrigins } from "../services/APImeal";
import type { Origin } from "../data/meals";
import "./OriginFilter.css";
type Props ={
    value:string;
    onOriginSelect : (origin : string)=> void ;
}
export function OriginFilter({value,onOriginSelect}:Props){
    const [allOrigin , setallorigin]=useState<Origin[]>([]);
    useEffect(()=>{
        async function fetchOrigins() {
            const data = await getOrigins() ;
            setallorigin(data);
        }
        fetchOrigins();
    },[])

    return(
        <div className="originFilter">
            {
                allOrigin.map((origin)=>(
                    <button key={origin.strArea} 
                    className={value===origin.strArea? "active" : "notActive"}
                    onClick={()=> {onOriginSelect(origin.strArea)}} > 
                    {origin.strArea}
                    </button>
                ))
            }
        </div>
    )

}
