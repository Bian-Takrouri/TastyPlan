import { connectDB } from "../data-source.js";
import { seedCategories } from "./seedCategories.js";
import { seedOrigins } from "./seedOrigins.js";
import { seedMeals } from "./seedMeals.js";

const runAllSeeders=async()=>{
    try{
        console.log("Initializing Database Connection...");
        await connectDB();
        console.log("Starting full database seeding...");
        await seedCategories();
        await seedOrigins();
        await seedMeals();
        console.log("ALL SEEDING COMPLETED SUCCESSFULLY");
        process.exit(0);
    }catch(error){
        console.error("Error during seeding process:",error);
        process.exit(1);
    }
};

runAllSeeders();