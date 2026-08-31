import path from "path";
import { promises as fs } from "fs";

import { Origin } from "../entities/Origin.js";

export const seedOrigins =
    async () => {
        console.log(
            "⏳ Starting Origins Seeding..."
        );
        const originsPath =
            path.join(
                process.cwd(),
                "data",
                "origins.json"
            );
        const countriesPath =
            path.join(
                process.cwd(),
                "data",
                "countries.json"
            );

        const originsData =
            JSON.parse(
                await fs.readFile(
                    originsPath,
                    "utf-8"
                )
            );

        const countriesData =
            JSON.parse(
                await fs.readFile(
                    countriesPath,
                    "utf-8"
                )
            );

        const countryFlagMap =
            new Map<string, string>();

        for (const country of countriesData) {

            countryFlagMap.set(
                country.country.toLowerCase(),
                country.flag
            );
        }

        for (const item of originsData) {

            const areaName =
                item.strArea;

            const countryName =
                item.strCountry || areaName;

            const flagUrl =
                countryFlagMap.get(
                    countryName.toLowerCase()
                ) || null;

            const existing =
                await Origin.findOne({
                    name: areaName
                });

            if (!existing) {

                await Origin.create({
                    name: areaName,
                    country: countryName,
                    flagUrl
                });

            } else {

                existing.country =
                    countryName;

                existing.flagUrl =
                    flagUrl;

                await existing.save();
            }
        }

        console.log(
            "✅ Origins Seeding Completed!"
        );
    };
// import path from "path";
// import { promises as fs } from "fs";
// import { AppDataSource } from "../data-source.js";
// import { Origin } from "../entities/Origin.js";

// export const seedOrigins = async () => {
//   const originRepo = AppDataSource.getRepository(Origin);

//   console.log("⏳ Starting Origins Seeding...");

//   // قراءة الملفات من server/data/
//   const originsPath = path.join(process.cwd(), "data", "origins.json");
//   const countriesPath = path.join(process.cwd(), "data", "countries.json");

//   const originsData = JSON.parse(await fs.readFile(originsPath, "utf-8"));
//   const countriesData = JSON.parse(await fs.readFile(countriesPath, "utf-8"));

//   const countryFlagMap = new Map<string, string>();

//   for (const c of countriesData) {
//     countryFlagMap.set(c.country.toLowerCase(), c.flag);
//   }

//   for (const item of originsData) {
//     const areaName = item.strArea;
//     const countryName = item.strCountry || areaName;
//     const flagUrl = countryFlagMap.get(countryName.toLowerCase()) || null;

//     const existing = await originRepo.findOneBy({ name: areaName });

//     if (!existing) {
//       const origin = originRepo.create({
//         name: areaName,
//         country: countryName,
//         flagUrl: flagUrl
//       });

//       await originRepo.save(origin);
//     } else {
//       existing.country = countryName;
//       existing.flagUrl = flagUrl;

//       await originRepo.save(existing);
//     }
//   }

//   console.log("✅ Origins Seeding Completed!");
// };