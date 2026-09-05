import "dotenv/config";
import bcrypt from "bcrypt";
import { AppDataSource } from "../src/data-source.js";
import { User } from "../src/entities/User.js";

async function createAdmin() {
    try {
        if (!process.env.ADMIN_PASSWORD) {
            throw new Error("ADMIN_PASSWORD is not defined in .env");
        }
        await AppDataSource.initialize();
        const userRepository = AppDataSource.getRepository(User);
        const existingAdmin = await userRepository.findOne({
            where: { email: "admin@tastyplan.com" }
        });
        if (existingAdmin) {
            console.log("Admin already exists!");
            return;
        }
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD,10);
        const admin = userRepository.create({
            username: "admin",
            email: "admin@tastyplan.com",
            passwordHash,
            role: "admin"
        });
        await userRepository.save(admin);
        console.log("Admin created successfully");

    } catch (error) {
        console.error("Failed to create admin:", error);
        process.exit(1);

    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

createAdmin();