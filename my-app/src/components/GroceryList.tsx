import { useEffect, useMemo, useState } from "react";
import type { mealPlannerState } from "../reducer/mealPlannerReducer";
import { addGroceryItem, deleteGroceryItem, getGroceryItems, updateGroceryItem, type GroceryItem } from "../services/APIuser";
import "./GroceryList.css";

type Props = { mealPlannerState: mealPlannerState; };

export function GroceryList({ mealPlannerState }: Props) {
    const [filter, setFilter] = useState<"all" | "remaining" | "completed">("all");
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [customItem, setCustomItem] = useState("");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const generatedItems = useMemo(() => {
        const ingredientCounts = new Map<string, number>();
        for (const item of Object.values(mealPlannerState)) {
            if (!item) continue;
            for (let i = 1; i <= 20; i++) {
                const ingredient = item.meal[`strIngredient${i}` as keyof typeof item.meal];
                if (ingredient && String(ingredient).trim()) {
                    const name = String(ingredient).trim();
                    const key = name.toLowerCase();
                    ingredientCounts.set(key, (ingredientCounts.get(key) ?? 0) + 1);
                }
            }
        }
        return Array.from(ingredientCounts.entries()).map(([name, quantity]) => ({ name, quantity }));
    }, [mealPlannerState]);

    useEffect(() => {
        async function loadItems() {
            if (!localStorage.getItem("token")) {
                setLoading(false);
                return;
            }
            try {
                const data = await getGroceryItems();
                setItems(data);
            } catch (error) {
                console.error("Failed to load grocery items:", error);
            } finally {
                setLoading(false);
            }
        }
        loadItems();
    }, []);

    useEffect(() => {
        async function syncGeneratedItems() {
            if (!localStorage.getItem("token") || syncing) return;
            setSyncing(true);
            const generatedMap = new Map(generatedItems.map(item => [item.name.toLowerCase(), item]));
            const generatedExisting = items.filter(item => !item.custom);
            const existingMap = new Map(generatedExisting.map(item => [item.name.toLowerCase(), item]));

            try {
                const operations: Promise<any>[] = [];
                for (const generated of generatedItems) {
                    const key = generated.name.toLowerCase();
                    const existing = existingMap.get(key);
                    if (!existing) {
                        operations.push(addGroceryItem(generated.name, false, generated.quantity));
                    } else if (existing.quantity !== generated.quantity) {
                        operations.push(updateGroceryItem(existing.id, existing.completed, generated.quantity));
                    }
                }
                for (const existing of generatedExisting) {
                    const key = existing.name.toLowerCase();
                    if (!generatedMap.has(key)) {
                        operations.push(deleteGroceryItem(existing.id));
                    }
                }
                if (operations.length === 0) return;
                await Promise.all(operations);
                const refreshed = await getGroceryItems();
                setItems(refreshed);
            } catch (error) {
                console.error("Failed to sync grocery items:", error);
            } finally {
                setSyncing(false);
            }
        }
        if (!loading) syncGeneratedItems();
    }, [generatedItems, loading]);

    async function toggleCheckbox(item: GroceryItem) {
        try {
            const updated = await updateGroceryItem(item.id, !item.completed);
            setItems(previous => previous.map(current => current.id === updated.id ? updated : current));
        } catch (error) {
            console.error("Failed to update grocery item:", error);
        }
    }

    async function addItem() {
        const name = customItem.trim();
        if (!name) return;
        const exists = items.some(item => item.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            setCustomItem("");
            return;
        }
        try {
            const item = await addGroceryItem(name, true, 1);
            setItems(previous => [...previous, item]);
            setCustomItem("");
        } catch (error) {
            console.error("Failed to add grocery item:", error);
        }
    }

    async function deleteItem(id: number) {
        try {
            await deleteGroceryItem(id);
            setItems(previous => previous.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete grocery item:", error);
        }
    }

    const filteredItems = items.filter(item => {
        if (filter === "completed") return item.completed;
        if (filter === "remaining") return !item.completed;
        return true;
    });

    if (!localStorage.getItem("token")) {
        return <div className="groceryContainer"><h2>Please login to use your grocery list.</h2></div>;
    }

    return (
        <div className="groceryContainer">
            <h2>🛒 Grocery List</h2>
            <div className="filterButtons">
                <button onClick={() => setFilter("all")}>All</button>
                <button onClick={() => setFilter("remaining")}>Remaining</button>
                <button onClick={() => setFilter("completed")}>Completed</button>
            </div>
            {loading ? (
                <div className="emptyGrocery"><p>Loading grocery list...</p></div>
            ) : filteredItems.length === 0 ? (
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
                                <input type="checkbox" checked={item.completed} onChange={() => toggleCheckbox(item)} />
                                {item.name}
                                {item.quantity > 1 && ` × ${item.quantity}`}
                            </label>
                            <button className="deleteGrocery" onClick={() => deleteItem(item.id)}>🗑️</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="addGrocery">
                <input value={customItem} onChange={event => setCustomItem(event.target.value)} placeholder="Add grocery item" />
                <button onClick={addItem}>Add</button>
            </div>
        </div>
    );
}