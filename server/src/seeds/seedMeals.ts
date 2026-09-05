import path from "path";
import { promises as fs } from "fs";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";

export const seedMeals=async()=>{
    const mealsPath=path.join(process.cwd(),"data","meals.json");
    const mealsData=JSON.parse(await fs.readFile(mealsPath,"utf-8"));
    const categories=await Category.find();
    const origins=await Origin.find();

    const categoryMap=new Map(categories.map(category=>[
        category.name.toLowerCase(),
        category._id
    ]));
    const originMap=new Map(origins.map(origin=>[
        origin.name.toLowerCase(),
        origin._id
    ]));

    for(const rawMeal of mealsData){
        const existing=await Recipe.findOne({mealId:String(rawMeal.idMeal)});
        if(existing) continue;

        const categoryName=rawMeal.strCategory?.toLowerCase();
        const categoryId=categoryName?categoryMap.get(categoryName)||null:null;
        const originName=rawMeal.strArea?.toLowerCase();
        const originId=originName?originMap.get(originName)||null:null;

        const ingredients=[];
        for(let i=1;i<=20;i++){
            const ingName=rawMeal[`strIngredient${i}`];
            const measure=rawMeal[`strMeasure${i}`];
            if(typeof ingName==="string"&&ingName.trim()!==""){
                ingredients.push({
                    ingredient:ingName.trim(),
                    measure:typeof measure==="string"&&measure.trim()!==""?measure.trim():null
                });
            }
        }

        const recipe=new Recipe({
            mealId:String(rawMeal.idMeal),
            name:rawMeal.strMeal,
            categoryId,
            originId,
            instructions:rawMeal.strInstructions||null,
            imageUrl:rawMeal.strMealThumb||null,
            youtubeUrl:rawMeal.strYoutube||null,
            sourceUrl:rawMeal.strSource||null,
            ingredients
        });
        await recipe.save();
    }
    console.log("Meals seeding completed");
};