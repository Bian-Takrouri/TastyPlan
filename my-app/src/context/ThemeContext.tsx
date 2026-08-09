import { createContext, useContext,type ReactNode } from "react";
import {useLocalStorage} from "../hooks/useLocalStorage";
type ThemeContextType = {
    theme: "light" | "dark";
    toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextType | null>(null);
type Props = {
    children: ReactNode;
};
export function ThemeProvider({children}: Props) {
    const [theme, setTheme] = useLocalStorage<"light"|"dark">("theme","light");
    function toggleTheme(){
        setTheme((prev)=>prev === "light"?"dark":"light");
    }
    return (
        <ThemeContext.Provider value={{theme,toggleTheme}}>
           {children}
        </ThemeContext.Provider>
    );
}
export function useTheme(){
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }
    return context;
}
