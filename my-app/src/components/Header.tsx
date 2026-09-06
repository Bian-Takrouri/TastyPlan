import SearchBar from "./SearchBar";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import sun from "../assets/icons/sun.svg";
import moon from "../assets/icons/moon.svg";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { checkAuth } from "../services/APIuser";

type Props = {
  value: string;
  searchForValue: (value: string) => void;
};

function Header({ value, searchForValue }: Props) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const result = await checkAuth();
      setIsLoggedIn(result);
    }
    checkUser();
  }, []);

  function handleLogout() {
    window.location.href = "http://localhost:5000/logout";
  }

  function handleLogin() {
    window.location.href = "http://localhost:5000/login";
  }

  return (
    <div className="HeaderContainer">
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img className="logoImg" src="/logo.png" alt="Logo" />
      </div>

      <SearchBar value={value} searchForValue={searchForValue} />

      <div className="mood">
        <button className="favoriteButton" onClick={() => navigate("/")}>
          🏠 Home
        </button>

        <button className="favoriteButton" onClick={() => navigate("/favorites")}>
          ❤️ Favorite Meals
        </button>

        <button className="favoriteButton" onClick={() => navigate("/mealPlannerPage")}>
          🗓️ Meal Planner
        </button>

        <button className="favoriteButton" onClick={() => navigate("/grocery")}>
          🛒 Grocery List
        </button>

        {isLoggedIn ? (
          <button className="favoriteButton" onClick={handleLogout}>
            🚪 Logout
          </button>
        ) : (
          <button className="favoriteButton" onClick={handleLogin}>
            🔐 Login
          </button>
        )}

        {theme === "dark" ? (
          <img src={sun} alt="light mode" onClick={toggleTheme} />
        ) : (
          <img src={moon} alt="dark mode" onClick={toggleTheme} />
        )}
      </div>
    </div>
  );
}

export default Header;