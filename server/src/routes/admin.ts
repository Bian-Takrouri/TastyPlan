import mongoose from "mongoose";
import { Router, Request, Response, NextFunction } from "express";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { User } from "../entities/User.js";
import { Favorite } from "../entities/Favorite.js";
import { MealPlanItem } from "../entities/MealPlanItem.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";
router.get("/login", (req: Request, res: Response) => {
    if (req.cookies && req.cookies.adminToken) {
        try {
            const decoded = jwt.verify(req.cookies.adminToken, JWT_SECRET) as { role?: string };
            if (decoded.role === "admin") {
                return res.redirect("/admin/dashboard");
            }
        } catch (error) {
            // Invalid or expired token
        }
    }
    res.render("admin-login", { layout: false, error: null });
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render("admin-login", {
                layout: false,
                error: "Email and password are required."
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("admin-login", {
                layout: false,
                error: "Invalid email or password."
            });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.render("admin-login", {
                layout: false,
                error: "Invalid email or password."
            });
        }
        if (user.role !== "admin") {
            return res.render("admin-login", {
                layout: false,
                error: "Admin access required."
            });
        }
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );
        res.cookie("adminToken", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Login Error:", error);
        res.render("admin-login", {
            layout: false,
            error: "An unexpected error occurred."
        });
    }
});

router.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("adminToken");
    res.redirect("/admin/login");
});

/* JWT AUTHENTICATION MIDDLEWARE  */
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.redirect("/admin/login");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };
        if (decoded.role !== "admin") {
            res.clearCookie("adminToken");
            return res.redirect("/admin/login");
        }
        (req as any).user = decoded;
        // note : this make logged in admin available to Handlebars ^-^
        res.locals.adminUser = decoded;

        if (req.path.startsWith("/dashboard")) {
            res.locals.activePage = "dashboard";
        } else if (req.path.startsWith("/users")) {
            res.locals.activePage = "users";
        } else if (req.path.startsWith("/recipes")) {
            res.locals.activePage = "recipes";
        } else if (req.path.startsWith("/categories")) {
            res.locals.activePage = "categories";
        } else if (req.path.startsWith("/origins")) {
            res.locals.activePage = "origins";
        }
        next();
    } catch (error) {
        res.clearCookie("adminToken");
        return res.redirect("/admin/login");
    }
};
router.use(authenticateJWT);

/* Dashboard */
router.get("/dashboard", async (req: Request, res: Response) => {
    try {

        const [totalRecipes, totalUsers, totalCategories, totalOrigins, recentRecipes] =
            await Promise.all([Recipe.countDocuments(), User.countDocuments(), Category.countDocuments(), Origin.countDocuments(),
            Recipe.find()
                .populate("categoryId")
                .populate("originId")
                .sort({ _id: -1 })
                .limit(5)
                .lean()
            ]);
        res.render("admin-dashboard", {
            title: "Dashboard",
            stats: {
                totalRecipes,
                totalUsers,
                totalCategories,
                totalOrigins
            },
            recentRecipes
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.render("admin-dashboard", {
            title: "Dashboard",
            stats: {
                totalRecipes: 0,
                totalUsers: 0,
                totalCategories: 0,
                totalOrigins: 0
            },
            recentRecipes: []
        });
    }
});

/* Recipes Page */
router.get("/recipes", async (req: Request, res: Response) => {
    try {
        const { sort, page } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const limit = 100;
        const skip = (currentPage - 1) * limit;

        const [recipes, total, categories, origins] = await Promise.all([
            Recipe.find()
                .populate("categoryId")
                .populate("originId")
                .sort({ _id: sort === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Recipe.countDocuments(),
            Category.find().sort({ name: 1 }).lean(),
            Origin.find().sort({ name: 1 }).lean()
        ]);

        const totalPages = Math.ceil(total / limit);
        res.render("admin-recipes", {
            title: "Recipes",
            recipes,
            categories,
            origins,
            currentSort: sort || "desc",
            currentPage,
            totalPages,
            totalRecipes: total,
            skip
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        res.status(500).send("Error loading recipes");
    }
});

/*  Categories and Origin Page */
router.get("/categories", async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        res.render("admin-categories", {
            title: "Categories",
            categories
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        res.status(500).send(
            "Error loading categories"
        );
    }
});

router.get("/origins", async (req: Request, res: Response) => {
    try {
        const origins = await Origin.find().sort({ name: 1 }).lean();
        res.render("admin-origins", {
            title: "Origins",
            origins
        });
    } catch (error) {
        console.error("Error loading origins:", error);
        res.status(500).send(
            "Error loading origins"
        );
    }
});

/*  USERS PAGE */
router.get("/users", async (req: Request, res: Response) => {
    try {
        const users = await User.find().sort({ _id: -1 }).lean();
        res.render("admin-users", {
            title: "Users",
            users
        });
    } catch (error) {
        console.error("Error loading users:", error);
        res.status(500).send(
            "Error loading users"
        );
    }
});

router.post(
    "/users/add",
    async (req: Request, res: Response) => {
        try {
            const { username, email, password, role } = req.body;
            if (!username || !email || !password) {
                return res.redirect("/admin/users");
            }
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return res.redirect("/admin/users");
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = new User({
                username,
                email,
                passwordHash,
                role: role || "user"
            });
            await user.save();
            res.redirect("/admin/users");
        }
        catch (error) {
            console.error("Error adding user:", error);
            res.status(500).send("Error adding user");
        }
    }
);
router.post("/users/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid recipe ID");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.redirect("/admin/users");
        }
        const currentAdmin = (req as any).user;
        if (currentAdmin && currentAdmin.id === id) {
            return res.redirect("/admin/users");
        }
        await User.findByIdAndDelete(id);
        await Promise.all([
            Favorite.deleteMany({ userId: id }),
            MealPlanItem.deleteMany({ userId: id }),
            GroceryItem.deleteMany({ userId: id })
        ]);
        res.redirect("/admin/users");

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Error deleting user");
    }
});

/* CATEGORIES CRUD */
router.post("/categories/add", async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            imageUrl
        } = req.body;

        if (!name) {
            return res.redirect("/admin/categories");
        }

        const category = new Category({
            name,
            description: description || null,
            imageUrl: imageUrl || null
        });

        await category.save();

        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).send("Error adding category");
    }
});

router.post("/categories/edit/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid recipe ID");
        }
        const { name, description, imageUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/categories");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid category ID");
        }
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).send("Category not found");
        }

        category.name = name;
        category.description = description || null;
        category.imageUrl = imageUrl || null;

        await category.save();

        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Error updating category");
    }
});

router.post("/categories/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid recipe ID");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid category ID");
        }

        await Category.findByIdAndDelete(id);

        await Recipe.updateMany(
            { categoryId: id },
            { $set: { categoryId: null } }
        );

        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).send("Error deleting category");
    }
});

/* ORIGINS CRUD */
router.post("/origins/add", async (req: Request, res: Response) => {
    try {
        const { name, country, flagUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/origins");
        }
        const origin = new Origin({
            name,
            country: country || null,
            flagUrl: flagUrl || null
        });

        await origin.save();

        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error adding origin:", error);
        res.status(500).send("Error adding origin");
    }
});

router.post("/origins/edit/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid recipe ID");
        }
        const { name, country, flagUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/origins");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid origin ID");
        }
        const origin = await Origin.findById(id);
        if (!origin) {
            return res.status(404).send("Origin not found");
        }
        origin.name = name;
        origin.country = country || null;
        origin.flagUrl = flagUrl || null;

        await origin.save();
        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error updating origin:", error);
        res.status(500).send("Error updating origin");
    }
});

router.post("/origins/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid recipe ID");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid origin ID");
        }
        await Origin.findByIdAndDelete(id);
        await Recipe.updateMany(
            { originId: id },
            { $set: { originId: null } }
        );
        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error deleting origin:", error);
        res.status(500).send("Error deleting origin");
    }
});

export default router;