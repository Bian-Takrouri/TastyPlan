import {
    connectDatabase,
    disconnectDatabase
} from "../data-source.js";

import { seedCategories }
    from "./seedCategories.js";

import { seedOrigins }
    from "./seedOrigins.js";

import { seedMeals }
    from "./seedMeals.js";

const runAllSeeders =
    async () => {

        try {

            console.log(
                "🚀 Connecting to MongoDB..."
            );

            await connectDatabase();

            console.log(
                "🌱 Starting Full Database Seeding Process..."
            );

            await seedCategories();

            await seedOrigins();

            await seedMeals();

            console.log(
                "🎉 ALL SEEDING COMPLETED SUCCESSFULLY!"
            );

        } catch (error) {

            console.error(
                "❌ Error during seeding process:",
                error
            );

            process.exitCode = 1;

        } finally {

            await disconnectDatabase();
        }
    };

runAllSeeders();

// import { AppDataSource } from "../data-source.js";
// import { seedCategories } from "./seedCategories.js";
// import { seedOrigins } from "./seedOrigins.js";
// import { seedMeals } from "./seedMeals.js";

// const runAllSeeders = async () => {
//   try {
//     console.log("🚀 Initializing Database Connection...");
//     await AppDataSource.initialize();

//     console.log("🌱 Starting Full Database Seeding Process...");
    
//     // الترتيب إجباري لتجنب أخطاء الـ Foreign Keys
//     await seedCategories();
//     await seedOrigins();
//     await seedMeals();

//     console.log("🎉 ALL SEEDING COMPLETED SUCCESSFULLY!");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error during seeding process:", error);
//     process.exit(1);
//   }
// };

// runAllSeeders();