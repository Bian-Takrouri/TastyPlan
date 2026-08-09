import { useEffect, useState } from "react";
export function useLocalStorage<T>(key:string , initialValue :T){
    const[savedValue , setSavedValue]=useState<T>(()=>{
        try{
            const item = localStorage.getItem(key);
            return item? (JSON.parse(item)) :initialValue ;
        }
        catch(error){
            console.error("Error reading localStorage:", error)
            return initialValue;
        }
    });
    
    useEffect(()=>{
        try{
            localStorage.setItem(key, JSON.stringify(savedValue));
        }
        catch(error){
             console.error("Error saving to localStorage:", error);
        }
    },[key,savedValue])
    return [savedValue,setSavedValue] as const;
}
