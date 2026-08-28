import { useEffect, useMemo, useState } from "react";
import type { mealPlannerState } from "../reducer/mealPlannerReducer";
import MealAPI from "../services/APImeal";
import "./GroceryList.css";

type GroceryItem = {
    id: number;
    name: string;
    completed: boolean;
    custom: boolean;
};

type Props = {
    mealPlannerState: mealPlannerState;
};

export function GroceryList({ mealPlannerState }: Props) {
    const [filter, setFilter] = useState<"all" | "remaining" | "completed">("all");
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [customItem, setCustomItem] = useState("");
    const mealAPI = new MealAPI();

    useEffect(() => {
        mealAPI.getGroceryItems()
            .then(setItems)
            .catch(error => console.error("Failed to load grocery list:", error));
    }, []);

    const generatedItems = useMemo(() => {
        const names = new Set<string>();

        Object.values(mealPlannerState).forEach(planned => {
            if (!planned) return;

            for (let i = 1; i <= 20; i++) {
                const ingredient = planned.meal[`strIngredient${i}` as keyof typeof planned.meal];

                if (typeof ingredient === "string" && ingredient.trim()) {
                    names.add(ingredient.trim());
                }
            }
        });

        return Array.from(names);
    }, [mealPlannerState]);

    useEffect(() => {
        const syncGeneratedItems = async () => {
            const existingNames = new Set(items.map(item => item.name.toLowerCase()));

            for (const name of generatedItems) {
                if (!existingNames.has(name.toLowerCase())) {
                    try {
                        const item = await mealAPI.addGroceryItem(name, false);
                        setItems(prev => [...prev, item]);
                    } catch (error) {
                        console.error("Failed to add generated grocery item:", error);
                    }
                }
            }
        };

        if (generatedItems.length) syncGeneratedItems();
    }, [generatedItems]);

    const toggleCheckbox = async (item: GroceryItem) => {
        try {
            const updated = await mealAPI.updateGroceryItem(item.id, !item.completed);
            setItems(prev => prev.map(current => current.id === item.id ? updated : current));
        } catch (error) {
            console.error("Failed to update grocery item:", error);
        }
    };

    const addItem = async () => {
        const name = customItem.trim();

        if (!name || items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
            return;
        }

        try {
            const item = await mealAPI.addGroceryItem(name, true);
            setItems(prev => [...prev, item]);
            setCustomItem("");
        } catch (error) {
            console.error("Failed to add grocery item:", error);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await mealAPI.deleteGroceryItem(id);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete grocery item:", error);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === "completed") return item.completed;
        if (filter === "remaining") return !item.completed;
        return true;
    });

    return (
        <div className="groceryContainer">
            <h2>🛒 Grocery List</h2>

            <div className="filterButtons">
                <button onClick={() => setFilter("all")}>All</button>
                <button onClick={() => setFilter("remaining")}>Remaining</button>
                <button onClick={() => setFilter("completed")}>Completed</button>
            </div>

            {filteredItems.length === 0 ? (
                <div className="emptyGrocery">
                    {items.length === 0 ? (
                        <>
                            <h4>Your grocery list is empty.</h4>
                            <p>Add meals to your planner to generate a shopping list.</p>
                        </>
                    ) : filter === "completed" ? (
                        <h4>No completed grocery items yet.</h4>
                    ) : (
                        <p>You have completed your grocery shopping.</p>
                    )}
                </div>
            ) : (
                <ul className="groceryList">
                    {filteredItems.map(item => (
                        <li key={item.id} className={item.completed ? "completed" : ""}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleCheckbox(item)}
                                />
                                {item.name}
                            </label>

                            <button
                                className="deleteGrocery"
                                onClick={() => deleteItem(item.id)}
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="addGrocery">
                <input
                    value={customItem}
                    onChange={e => setCustomItem(e.target.value)}
                    placeholder="Add grocery item"
                />
                <button onClick={addItem}>Add</button>
            </div>
        </div>
    );
}