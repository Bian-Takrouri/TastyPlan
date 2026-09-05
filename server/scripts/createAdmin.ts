import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDB } from "../src/data-source.js";
import { User } from "../src/entities/User.js";

async function createAdmin(){
    try{
        if(!process.env.ADMIN_PASSWORD){
            throw new Error("ADMIN_PASSWORD is not defined in .env");
        }
        await connectDB();
        const existingAdmin=await User.findOne({email:"admin@tastyplan.com"});
        if(existingAdmin){
            console.log("Admin already exists!");
            return;
        }
        const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,10);
        const admin=new User({
            username:"admin",
            email:"admin@tastyplan.com",
            passwordHash,
            role:"admin"
        });
        await admin.save();
        console.log("Admin created successfully");
    }catch(error){
        console.error("Failed to create admin:",error);
        process.exit(1);
    }finally{
        process.exit(0);
    }
}

createAdmin();