import path from "path";
import { promises as fs } from "fs";
import { Category } from "../entities/Category.js";

export const seedCategories=async()=>{
    const filePath=path.join(process.cwd(),"data","categories.json");
    const fileData=await fs.readFile(filePath,"utf-8");
    const categoriesData=JSON.parse(fileData);
    for(const item of categoriesData){
        const existing=await Category.findOne({name:item.strCategory});
        if(!existing){
            const category=new Category({
                name:item.strCategory,
                description:item.strCategoryDescription,
                imageUrl:item.strCategoryThumb
            });
            await category.save();
        }else{
            existing.description=item.strCategoryDescription;
            existing.imageUrl=item.strCategoryThumb;
            await existing.save();
        }
    }
    console.log("Categories seeding completed");
};