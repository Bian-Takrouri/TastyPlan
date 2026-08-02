import {useState, useEffect } from "react";

function useDebounce(text:string){
    const [debounceValue , setDebounceValue] =useState("");
    useEffect(()=>{
        const timer = setTimeout(()=>setDebounceValue(text),500)
        return ()=> clearTimeout(timer);
    } , [text])

    return debounceValue;
}
export default useDebounce ; 