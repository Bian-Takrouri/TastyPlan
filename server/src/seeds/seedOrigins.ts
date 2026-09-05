import path from "path";
import { promises as fs } from "fs";
import { Origin } from "../entities/Origin.js";

import { connectDB } from "../data-source.js";

export const seedOrigins=async()=>{
    await connectDB();
    const originsPath=path.join(process.cwd(),"data","origins.json");
    const countriesPath=path.join(process.cwd(),"data","countries.json");
    const originsData=JSON.parse(await fs.readFile(originsPath,"utf-8"));
    const countriesData=JSON.parse(await fs.readFile(countriesPath,"utf-8"));
    const countryFlagMap=new Map<string,string>();
    for(const c of countriesData){
        countryFlagMap.set(c.country.toLowerCase(),c.flag);
    }
    for(const item of originsData){
        const areaName=item.strArea;
        const countryName=item.strCountry||areaName;
        const flagUrl=countryFlagMap.get(countryName.toLowerCase())||null;
        const existing=await Origin.findOne({name:areaName});
        if(!existing){
            const origin=new Origin({name:areaName,country:countryName,flagUrl});
            await origin.save();
        }else{
            existing.country=countryName;
            existing.flagUrl=flagUrl;
            await existing.save();
        }
    }
    console.log("Origins seeding completed");
};