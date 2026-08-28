import { useEffect, useState } from "react";
import MealAPI from "../services/APImeal";
import type { Origin } from "../data/meals";
import "./OriginFilter.css";

const mealAPI = new MealAPI();

type Props = {
    value: string;
    onOriginSelect: (origin: string) => void;
};

export function OriginFilter({ value, onOriginSelect }: Props) {
    const [allOrigin, setAllOrigin] = useState<Origin[]>([]);

    useEffect(() => {
        async function fetchOrigins() {
            try {
                const data = await mealAPI.getOrigins();
                setAllOrigin(data);
            } catch (error) {
                console.error("Failed to fetch origins:", error);
            }
        }

        fetchOrigins();
    }, []);

    return (
        <div className="originFilter">
            {allOrigin.map((origin) => (
                <button
                    key={origin.idMeal}
                    className={
                        value === origin.strArea
                            ? "active"
                            : "notActive"
                    }
                    onClick={() => onOriginSelect(origin.strArea)}
                >
                    {origin.flagUrl && (
                        <img
                            src={origin.flagUrl}
                            alt={`${origin.strCountry} flag`}
                        />
                    )}

                    {origin.strArea}
                </button>
            ))}
        </div>
    );
}