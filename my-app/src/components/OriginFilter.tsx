import { useEffect, useState } from "react";
import { getOrigins } from "../services/APImeal";
import type { Origin } from "../data/meals";
import "./OriginFilter.css";
type Props ={
    onOriginSelect : (origin : string)=> void ;
}

export function OriginFilter({onOriginSelect}:Props){
    const [allOrigin , setallorigin]=useState<Origin[]>([]);
    const [selectedOrigin, setSelectedOrigin] = useState("");
    {/*const [flags, setflags]=useState<Record<string,string>>({});*/}
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
                    className={selectedOrigin===origin.strArea? "active" : "notActive"}
                    onClick={()=> {setSelectedOrigin(origin.strArea) ;onOriginSelect(origin.strArea)}} > 
                    {origin.strArea}
                    </button>
                ))
            }
        </div>
    )

}
