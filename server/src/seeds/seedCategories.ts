import path from "path";
import { promises as fs } from "fs";

import { Category } from "../entities/Category.js";

export const seedCategories =
    async () => {

        console.log(
            "⏳ Starting Categories Seeding..."
        );

        const filePath =
            path.join(
                process.cwd(),
                "data",
                "categories.json"
            );

        const fileData =
            await fs.readFile(
                filePath,
                "utf-8"
            );

        const categoriesData =
            JSON.parse(fileData);

        for (const item of categoriesData) {

            const existing =
                await Category.findOne({
                    name: item.strCategory
                });

            if (!existing) {

                await Category.create({
                    name: item.strCategory,

                    description:
                        item.strCategoryDescription
                        || null,

                    imageUrl:
                        item.strCategoryThumb
                        || null
                });
            }
        }

        console.log(
            "✅ Categories Seeding Completed!"
        );
    };
// import path from "path";
// import { promises as fs } from "fs";
// import { AppDataSource } from "../data-source.js";
// import { Category } from "../entities/Category.js";

// export const seedCategories = async () => {
//   const categoryRepo = AppDataSource.getRepository(Category);

//   console.log("⏳ Starting Categories Seeding...");

//   // قراءة الملف من مجلد server/data/ مباشرة
//   const filePath = path.join(process.cwd(), "data", "categories.json");
//   const fileData = await fs.readFile(filePath, "utf-8");
//   const categoriesData = JSON.parse(fileData);

//   for (const item of categoriesData) {
//     const existing = await categoryRepo.findOneBy({ name: item.strCategory });
//     if (!existing) {
//       const category = categoryRepo.create({
//         name: item.strCategory,
//         description: item.strCategoryDescription,
//         imageUrl: item.strCategoryThumb
//       });
//       await categoryRepo.save(category);
//     }
//   }

//   console.log("✅ Categories Seeding Completed!");
// };