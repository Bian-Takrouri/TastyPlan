export type Recipe={
    idMeal: string ;
    strMeal:string;
    strCategory: string;
    strArea: string;
    strMealThumb: string;
    strCountry: string;
    strInstructions:string;
};
export type Category = {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
};
export type Origin={
    strMeal: string;
    strMealThumb: string;
    idMeal: string ;
    strArea: string;
    strCountry:string ;
}