import { useRef, useEffect } from "react";
import "./SearchBar.css"

type Props = {
    value: string;
    searchForValue: (value: string) => void;
};
function SearchBar({value, searchForValue }: Props) {
    const inputRefrance = useRef<HTMLInputElement>(null);
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
            <input type="text" value={value} ref={inputRefrance} placeholder="Search recipes..."
            onChange={(e)=>searchForValue(e.target.value)} />
        </form>
    </div>

);
}
export default SearchBar