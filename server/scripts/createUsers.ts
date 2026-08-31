import "dotenv/config";
import bcrypt from "bcrypt";

import { AppDataSource } from "../src/data-source.js";
import { User } from "../src/entities/User.js";

const users = [
    {
        username: "user1",
        email: "user1@tastyplan.com",
        password: process.env.USER1_PASSWORD
    },
    {
        username: "user2",
        email: "user2@tastyplan.com",
        password: process.env.USER2_PASSWORD
    },
    {
        username: "user3",
        email: "user3@tastyplan.com",
        password: process.env.USER3_PASSWORD
    }
];

async function createUsers() {
    try {
        // Check that all passwords are defined
        for (const user of users) {
            if (!user.password) {
                throw new Error(
                    `Password for ${user.email} is not defined in .env`
                );
            }
        }

        // Connect to database
        await AppDataSource.initialize();

        const userRepository = AppDataSource.getRepository(User);

        for (const userData of users) {

            // Check if user already exists
            const existingUser = await userRepository.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                console.log(`${userData.email} already exists.`);
                continue;
            }

            // Hash password before saving
            const passwordHash = await bcrypt.hash(
                userData.password!,
                10
            );

            // Create user
            const user = userRepository.create({
                username: userData.username,
                email: userData.email,
                passwordHash,
                role: "user"
            });

            await userRepository.save(user);

            console.log(`${userData.email} created successfully.`);
        }

    } catch (error) {
        console.error("Failed to create users:", error);
        process.exit(1);

    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

createUsers();
