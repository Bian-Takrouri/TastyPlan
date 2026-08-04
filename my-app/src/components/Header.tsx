import SearchBar from "./SearchBar";
import "./Header.css";
import sun from "../assets/icons/sun.svg"
import moon from "../assets/icons/moon.svg"
import { useTheme } from "../context/ThemeContext";
type Props = {
    value: string;
    searchForValue: (value: string) => void;
}
function Header({ value, searchForValue }: Props) {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="HeaderContainer">
            <div className="logo">
                <img className="logoImg" src="/logo.png" alt="Logo" />
            </div>
            <SearchBar value={value} searchForValue={searchForValue} />
            <div className="mood">
                {theme === "dark" ? <img src={sun} alt="light mode" onClick={toggleTheme} />
                    : <img src={moon} alt="dark mode" onClick={toggleTheme} />
                }
            </div>
        </div>
    );
}
export default Header