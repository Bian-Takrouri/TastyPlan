import { useState, useRef, useEffect } from "react";
import "./SearchBar.css"

type Props = {
    searchForValue: (value: string) => void;
}
function SearchBar({ searchForValue }: Props) {
    const [input, setinput] = useState("");
    const inputRefrance = useRef<HTMLInputElement>(null);
    function handler(e: React.ChangeEvent<HTMLInputElement>) {
        setinput(e.target.value);
        searchForValue(e.target.value);
    }

    useEffect(
        () => {
        function focusSearchBar(e : KeyboardEvent) {
            if(e.key === 'k' && e.ctrlKey){
                e.preventDefault();
                inputRefrance.current?.focus();
            }
        }
        window.addEventListener("keydown",  focusSearchBar);
        return()=>{
            window.removeEventListener("keydown",focusSearchBar);
        }
        }, []);

return (
    <div className="search">
        <form>
            <input type="text" value={input} onChange={handler} ref={inputRefrance} placeholder="Search recipes..." />
        </form>
    </div>

);
}
export default SearchBar