import "reflect-metadata";
import express from "express";
import cors from "cors";
import path from "path";
import { engine } from "express-handlebars";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./data-source.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import originsRoutes from "./routes/origins.js";
import recipesRoutes from "./routes/recipes.js";
import adminRoutes from "./routes/admin.js";
import userApi from "./routes/userApi.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "main",

        helpers: {
            eq: (a: string, b: string) => a === b,
            gt: (a: number, b: number) => a > b,
            lt: (a: number, b: number) => a < b,
            add: (a: number, b: number) => a + b,
            subtract: (a: number, b: number) => a - b,
            range: (start: number, end: number) => {
                const numbers = [];
                for (let i = start; i <= end; i++) {
                    numbers.push(i);
                }
                return numbers;
            }
        }
    })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoriesRoutes);
app.use("/api/origins", originsRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/user", userApi);

app.use("/admin", adminRoutes);

app.get("/api/health",
    async (_req, res) => {
        try {
            await AppDataSource.query("SELECT 1");
            return res.json({
                success: true,
                message: "server and database are working"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "database connection failed"
            });
        }
    }
);
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected successfully");
        app.listen(
            PORT,
            () => {
                console.log(`server running on http://localhost:${PORT}`);
            }
        );
    } catch (error) {
        console.error(
            "Database initialization failed:",
            error
        );
        process.exit(1);
    }
};
startServer();