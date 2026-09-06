import { useEffect, useReducer, useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import { CategoryFilter } from "./components/CategoryFilter";
import { OriginFilter } from "./components/OriginFilter";
import { mealPlannerReducer, initialState } from "./reducer/mealPlannerReducer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useTheme } from "./context/ThemeContext";
import Favorites from "./pages/Favorites";
import Grocery from "./pages/Grocery";
import MealPlannerPage from "./pages/MealPlannerPage";
import { getMealPlan, checkAuth } from "./services/APIuser";

function App() {
    const { theme } = useTheme();

    const [searchMeal, setSearchMeal] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedOrigin, setSelectedOrigin] = useState("");

    const [mealPlannerState, dispatch] = useReducer(
        mealPlannerReducer,
        initialState
    );

    useEffect(() => {
        async function loadMealPlan() {

            try {
                const isAuthenticated = await checkAuth();
                if (!isAuthenticated) {
                    return;
                }
                const items = await getMealPlan();
                for (const item of items) {
                    const recipe = item.recipe;
                    if (!recipe) {
                        continue;
                    }
                    const meal: any = {
                        idMeal: String(recipe.mealId),
                        strMeal: recipe.name ?? "",
                        strCategory: recipe.category?.name ?? "",
                        strArea: recipe.origin?.name ?? "",
                        strCountry: recipe.origin?.country ?? "",
                        strMealThumb: recipe.imageUrl ?? "",
                        strInstructions: recipe.instructions ?? "",
                        strYoutube: recipe.youtubeUrl ?? ""
                    };

                    (recipe.ingredients ?? [])
                        .slice(0, 20)
                        .forEach(
                            (ingredient: any, index: number) => {
                                meal[`strIngredient${index + 1}`] = ingredient.ingredient ?? "";
                                meal[`strMeasure${index + 1}`] = ingredient.measure ?? "";
                            }
                        );
                    dispatch({
                        type: "Add",
                        day: item.dayOfWeek,
                        meal,
                        itemId: item.id
                    });
                }
            } catch (error) {
                console.error(
                    "Failed to load meal plan:",
                    error
                );
            }
        }

        loadMealPlan();
    }, []);

    const handleSearch = (value: string) => {
        setSearchMeal(value);
        setSelectedCategory("");
        setSelectedOrigin("");
    };

    const handleCategory = (category: string) => {
        setSelectedCategory(category);
        setSelectedOrigin("");
        setSearchMeal("");
    };

    const handleOrigin = (origin: string) => {
        setSelectedOrigin(origin);
        setSelectedCategory("");
        setSearchMeal("");
    };

    return (
        <div className={`hallApp ${theme}`}>

            <Header
                value={searchMeal}
                searchForValue={handleSearch}
            />

            <Routes>

                <Route
                    path="/"
                    element={
                        <>
                            <h1 className="CategoriesName">
                                Explore by Category
                            </h1>

                            <CategoryFilter
                                value={selectedCategory}
                                onCategorySelect={handleCategory}
                            />

                            <h1 className="OriginsName">
                                Explore by Cuisine
                            </h1>

                            <OriginFilter
                                value={selectedOrigin}
                                onOriginSelect={handleOrigin}
                            />

                            <Home
                                query={searchMeal}
                                category={selectedCategory}
                                origin={selectedOrigin}
                                dispatch={dispatch}
                            />
                        </>
                    }
                />
                <Route
                    path="/grocery"
                    element={
                        <ProtectedRoute>
                            <Grocery mealPlannerState={mealPlannerState} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute>
                            <Favorites dispatch={dispatch} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mealPlannerPage"
                    element={
                        <ProtectedRoute>
                            <MealPlannerPage
                                mealPlannerState={mealPlannerState}
                                dispatch={dispatch}
                            />
                        </ProtectedRoute>
                    } />
            </Routes>
        </div>
    );
}

export default App;