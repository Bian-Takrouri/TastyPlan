import bcrypt from "bcrypt";

import {
    connectDatabase,
    disconnectDatabase
} from "../src/data-source.js";

import { User } from "../src/entities/User.js";

async function createAdmin() {

    try {

        await connectDatabase();

        const existingAdmin =
            await User.findOne({
                email: "admin@tastyplan.com"
            });

        if (existingAdmin) {

            console.log(
                "Admin already exists!"
            );

            return;
        }

        const passwordHash =
            await bcrypt.hash(
                "123456",
                10
            );

        await User.create({
            username: "admin",

            email:
                "admin@tastyplan.com",

            passwordHash,

            role: "admin"
        });

        console.log(
            "Admin created successfully"
        );

    } catch (error) {

        console.error(error);

        process.exitCode = 1;

    } finally {

        await disconnectDatabase();
    }
}

createAdmin();

// import bcrypt from "bcrypt";
// import { AppDataSource } from "../src/data-source";
// import { User } from "../src/entities/User"
// async function createAdmin() {
//     await AppDataSource.initialize();
//     const userRepository = AppDataSource.getRepository(User);
//     const existingAdmin = await userRepository.findOne({ where :{email:"admin@tastyplan.com"}})
//     if(existingAdmin){
//         console.log("Admin already exists!");
//         await AppDataSource.destroy();
//         return ;
//     }
//     const passwordHash = await bcrypt.hash("123456",10)
//     const admin = userRepository.create({
//         username:"admin",
//         email :"admin@tastyplan.com",
//         passwordHash ,
//         role: "admin"
//     })
//     await userRepository.save(admin);
//     console.log("Admin created successfully");
//     await AppDataSource.destroy();
// }
// createAdmin().catch((error) => {
//     console.error(error);
//     process.exit(1);
// })
