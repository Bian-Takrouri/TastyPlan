import { useEffect, useState } from "react";
import type { mealPlannerState } from "../reducer/mealPlannerReducer";
import type { Recipe } from "../data/meals";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./GroceryList.css";
type Props = {
    mealPlannerState: mealPlannerState;
}
type GroceryItem = {
    name: string;
    completed: boolean;
    custom: boolean;
}
export function GroceryList({ mealPlannerState }: Props) {
    const [filter, setFilter] = useState<"all" | "remaining" | "completed">("all");
    const [items, setItems] = useLocalStorage<GroceryItem[]>("groceryList", []);
    const ingredientSet = new Set<string>();
    const [customItem, setCustomItem] = useState("");
    const meals = Object.values(mealPlannerState);
    for (const meal of meals) {
        if (!meal)
            continue;
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}` as keyof Recipe];
            if (ingredient) {
                ingredientSet.add(String(ingredient));
            }
        }
    }
    const generatedItems: GroceryItem[] = Array.from(ingredientSet).map(
        (ingredient) => ({
            name: ingredient,
            completed: false,
            custom: false
        })
    );
    useEffect(() => {
        setItems(prev => {
            const updateItems = generatedItems.map(item => {
                const oldItem = prev.find(prevItem => prevItem.name === item.name);
                return oldItem ? oldItem : item;
            })
            const customItem = prev.filter(item => item.custom)
            return [...updateItems, ...customItem];
        })
        /*  prev => [...generatedItems, ...prev.filter(item => !generatedItems.some(i => i.name === item.name))])*/
    }, [mealPlannerState]);

    function toggleCheckbox(name: string) {
        setItems(prev => prev.map(item => item.name === name ?
            { ...item, completed: !item.completed } : item));
    }
    const filteredItems = items.filter((item) => {
        if (filter === "completed")
            return item.completed;
        if (filter === "remaining")
            return !item.completed;
        return true;
    });
    function addItem() {
        if (customItem.trim() === "")
            return;
        setItems(prev => {
            const findItem = prev.some(item => item.name.toLowerCase() === customItem.trim().toLowerCase());
            if (findItem)
                return prev;
            return [...prev, { name: customItem, completed: false, custom: true }];
        });
        return setCustomItem("");
    }
    function deleteItem(name: string) {
        setItems(prev => prev.filter(item => item.name !== name))
    }
    return (
        <div className="groceryContainer">
            <h2>🛒 Grocery List</h2>
            <div className="filterButtons">
                <button onClick={() => setFilter("all")}>
                    All</button>
                <button onClick={() => setFilter("remaining")}>
                    Remaining</button>
                <button onClick={() => setFilter("completed")}>
                    Completed</button>
            </div>
            {filteredItems.length === 0 ? <div className="emptyGrocery">
                {items.length === 0 ?
                    (<>
                        <h4>Your grocery list is empty.</h4>
                        <p>Add meals to your planner to generate a shopping list.</p>
                    </>) :
                    filter === "completed" ?
                        (<>
                            <h4>No completed grocery items yet.</h4>
                        </>) :
                        (<>
                            <p>You have completed your grocery shopping.</p>
                        </>)
                }
            </div> : <ul className="groceryList">
                {filteredItems.map((item) => (
                    <li key={item.name} className={item.completed ? "completed" : ""}>
                        <label>
                            <input type="checkbox" checked={item.completed} onChange={() => toggleCheckbox(item.name)} />
                            {item.name}
                        </label>
                        <button className="deleteGrocery" onClick={() => deleteItem(item.name)}>🗑️</button>
                    </li>
                ))}
            </ul>}
            <div className="addGrocery">
                <input value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    placeholder="Add grocery item" />
                <button onClick={addItem}>Add</button>
            </div>
        </div>
    );
}