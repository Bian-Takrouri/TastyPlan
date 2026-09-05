import path from "path";
import { promises as fs } from "fs";
import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";

export const seedCategories = async () => {
  const categoryRepo = AppDataSource.getRepository(Category);
  const filePath = path.join(process.cwd(), "data", "categories.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const categoriesData = JSON.parse(fileData);

  for (const item of categoriesData) {
    const existing = await categoryRepo.findOneBy({ name: item.strCategory });
    if (!existing) {
      const category = categoryRepo.create({
        name: item.strCategory,
        description: item.strCategoryDescription,
        imageUrl: item.strCategoryThumb
      });
      await categoryRepo.save(category);
    }
    else {
      existing.description = item.strCategoryDescription;
      existing.imageUrl = item.strCategoryThumb;
      await categoryRepo.save(existing);
    }
  }
  console.log("categories seeding completed");
};