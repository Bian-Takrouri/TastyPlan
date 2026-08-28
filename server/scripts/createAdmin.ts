import bcrypt from "bcrypt";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entities/User"
async function createAdmin() {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({ where :{email:"admin@tastyplan.com"}})
    if(existingAdmin){
        console.log("Admin already exists!");
        await AppDataSource.destroy();
        return ;
    }
    const passwordHash = await bcrypt.hash("123456",10)
    const admin = userRepository.create({
        username:"admin",
        email :"admin@tastyplan.com",
        passwordHash ,
        role: "admin"
    })
    await userRepository.save(admin);
    console.log("Admin created successfully");
    await AppDataSource.destroy();
}
createAdmin().catch((error) => {
    console.error(error);
    process.exit(1);
})
