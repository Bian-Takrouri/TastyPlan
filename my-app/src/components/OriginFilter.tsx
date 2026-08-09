import { useEffect, useState } from "react";
import MealAPI from "../services/APImeal";
import type { Origin } from "../data/meals";
import "./OriginFilter.css";
/*import { getCountryFlag } from "../services/APIcountries";*/
type Props = {
    value: string;
    onOriginSelect: (origin: string) => void;
}
/*function getCountryName(origin: string) {
    const countyMap: Record<string, string> = {
        American: "United States",
        British: "United Kingdom",
        Chinese: "China",
        Indian: "India",
        Italian: "Italy",
        Japanese: "Japan",
        Mexican: "Mexico",
        Spanish: "Spain",
        Thai: "Thailand",
        Turkish: "Turkey",
        Canadian: "Canada",
    };
    return countyMap[origin] ?? origin;
}*/
export function OriginFilter({ value, onOriginSelect }: Props) {
    const mealAPI = new MealAPI();
    const [allOrigin, setallorigin] = useState<Origin[]>([]);
    /*const [flag, setFlag] = useState<Record<string, string>>({});*/
    useEffect(() => {
        async function fetchOrigins() {
            const data = await mealAPI.getOrigins();
            setallorigin(data);
        }
        fetchOrigins();
    }, [])
    /*useEffect(() => {
        async function fetchFlags() {
            const flags = await Promise.all(
                allOrigin.map(async (origin) => {
                    const countyName = getCountryName(origin.strArea)
                    try {
                        const flag = await getCountryFlag(countyName);
                        return {
                            origin: origin.strArea,
                            flag,
                        };
                    } catch {
                        return {
                            origin: origin.strArea,
                            flag: null,
                        }
                    }
                })
            )
            const flagsObj: Record<string, string> = {};
            flags.forEach((item) => {
                if (item.flag) {
                    flagsObj[item.origin] = item.flag;
                }
            })
            setFlag(flagsObj);
        }
        if (allOrigin.length > 0)
            fetchFlags();
    }, [allOrigin]);*/
    return (
        <div className="originFilter">
            {
                allOrigin.map((origin) => (
                    <button key={origin.strArea}
                        className={value === origin.strArea ? "active" : "notActive"}
                        onClick={() => { onOriginSelect(origin.strArea) }} >
                        {/*flag[origin.strArea] && (<img src={flag[origin.strArea]} alt={`${origin.strArea} flag`} />)*/}
                        {origin.strArea}
                    </button>
                ))
            }
        </div>
    )

}
