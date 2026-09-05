import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source.js";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { User } from "../entities/User.js";
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
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ email });
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
                id: user.id,
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
            id: number;
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
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const userRepo = AppDataSource.getRepository(User);
        const categoryRepo = AppDataSource.getRepository(Category);
        const originRepo = AppDataSource.getRepository(Origin);

        const [totalRecipes, totalUsers, totalCategories, totalOrigins, recentRecipes] =
            await Promise.all([recipeRepo.count(), userRepo.count(), categoryRepo.count(), originRepo.count(),
            recipeRepo.find({
                take: 5,
                order: { id: "DESC" },
                relations: {
                    category: true,
                    origin: true
                }
            })]);
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
        const orderDirection = sort === "asc" ? "ASC" : "DESC";
        const currentPage = Math.max(Number(page) || 1, 1);
        const limit = 100;
        const skip = (currentPage - 1) * limit;

        const [recipes, total] = await AppDataSource.getRepository(Recipe)
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.category", "category")
            .leftJoinAndSelect("recipe.origin", "origin")
            .orderBy("recipe.id", orderDirection)
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const categories = await AppDataSource.getRepository(Category).find();
        const origins = await AppDataSource.getRepository(Origin).find();
        const totalPages = Math.ceil(total / limit);

        res.render("admin-recipes", {
            title: "Recipes",
            recipes,
            categories,
            origins,
            currentSort: sort || "desc",
            currentPage,
            totalPages,
            totalRecipes: total
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        res.status(500).send("Error loading recipes");
    }
});

/*  Categories and Origin Page */
router.get("/categories", async (req: Request, res: Response) => {
    try {
        const categories = await AppDataSource
            .getRepository(Category)
            .find({
                order: { id: "ASC" }
            });
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
        const origins = await AppDataSource
            .getRepository(Origin)
            .find({
                order: { id: "ASC" }
            });
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

// ==========================================
// 6. USERS PAGE
// ==========================================

router.get("/users", async (req: Request, res: Response) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const users = await userRepo.find({
            order: { id: "DESC" }
        });
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
            const userRepo = AppDataSource.getRepository(User);
            const existingUser = await userRepo.findOneBy({ email });
            if (existingUser) {
                return res.redirect("/admin/users");
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = userRepo.create({
                username,
                email,
                passwordHash,
                role: role || "user"
            });
            await userRepo.save(user);
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
        const id = Number(req.params.id);
        const userRepo = AppDataSource.getRepository(User);
        const currentAdmin = (req as any).user;
        if (currentAdmin && Number(currentAdmin.id) === id) {
            return res.redirect("/admin/users");
        }
        await userRepo.delete(id);
        res.redirect("/admin/users");

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Error deleting user");
    }
});

/* RECIPES CRUD */
router.post("/recipes/add", async (req: Request, res: Response) => {
    try {
        const { name, categoryId, originId, imageUrl, instructions } = req.body;
        if (!name) {
            return res.redirect("/admin/recipes");
        }
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const newRecipe = new Recipe();
        newRecipe.name = name;
        newRecipe.mealId = `custom_${Date.now()}`;
        newRecipe.imageUrl = imageUrl || null;
        newRecipe.instructions = instructions || null;
        if (categoryId) {
            const category = new Category();
            category.id = parseInt(categoryId, 10);
            newRecipe.category = category;
            newRecipe.categoryId = category.id;
        } else {
            newRecipe.category = null;
            newRecipe.categoryId = null;
        }
        if (originId) {
            const origin = new Origin();
            origin.id = parseInt(originId, 10);
            newRecipe.origin = origin;
            newRecipe.originId = origin.id;
        } else {
            newRecipe.origin = null;
            newRecipe.originId = null;
        }
        await recipeRepo.save(newRecipe);
        res.redirect("/admin/recipes");

    } catch (error) {
        console.error("Error adding recipe:", error);
        res.status(500).send("Error adding recipe");
    }
});

router.post("/recipes/edit/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, categoryId, originId, imageUrl, instructions } = req.body;
        if (!name) {
            return res.redirect("/admin/recipes");
        }
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const recipe = await recipeRepo.findOneBy({ id: Number(id) });
        if (!recipe) {
            return res.status(404).send("Recipe not found");
        }
        recipe.name = name;
        recipe.imageUrl = imageUrl || null;
        recipe.instructions = instructions || null;

        if (categoryId) {
            const category = new Category();
            category.id = parseInt(categoryId, 10);
            recipe.category = category;
            recipe.categoryId = category.id;
        } else {
            recipe.category = null;
            recipe.categoryId = null;
        }
        if (originId) {
            const origin = new Origin();
            origin.id = parseInt(originId, 10);
            recipe.origin = origin;
            recipe.originId = origin.id;

        } else {
            recipe.origin = null;
            recipe.originId = null;
        }
        await recipeRepo.save(recipe);
        res.redirect("/admin/recipes");

    } catch (error) {
        console.error("Error editing recipe:", error);
        res.status(500).send("Error editing recipe");
    }
});

router.post("/recipes/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recipeRepo = AppDataSource.getRepository(Recipe);
        await recipeRepo.delete(Number(id));
        res.redirect("/admin/recipes");

    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).send("Error deleting recipe");
    }
}
);

/* CATEGORIES CRUD */
router.post("/categories/add", async (req: Request, res: Response) => {
    try {
        const { name, description, imageUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/categories");
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const category = categoryRepo.create({
            name,
            description: description || null,
            imageUrl: imageUrl || null
        });

        await categoryRepo.save(category);
        res.redirect("/admin/categories");

    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).send("Error adding category");
    }
});

router.post("/categories/edit/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name, description, imageUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/categories");
        }
        const categoryRepo = AppDataSource.getRepository(Category);
        const category = await categoryRepo.findOneBy({ id });

        if (!category) {
            return res.status(404).send("Category not found");
        }

        category.name = name;
        category.description = description || null;
        category.imageUrl = imageUrl || null;

        await categoryRepo.save(category);

        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Error updating category");
    }
});

router.post("/categories/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoryRepo = AppDataSource.getRepository(Category);

        await categoryRepo.delete(Number(id));

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

        const originRepo = AppDataSource.getRepository(Origin);
        const origin = originRepo.create({
            name,
            country: country || null,
            flagUrl: flagUrl || null
        });

        await originRepo.save(origin);

        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error adding origin:", error);
        res.status(500).send("Error adding origin");
    }
});

router.post("/origins/edit/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, country, flagUrl } = req.body;
        if (!name) {
            return res.redirect("/admin/origins");
        }

        const originRepo = AppDataSource.getRepository(Origin);
        const origin = await originRepo.findOneBy({ id: Number(id) });
        if (!origin) {
            return res.status(404).send("Origin not found");
        }
        origin.name = name;
        origin.country = country || null;
        origin.flagUrl = flagUrl || null;

        await originRepo.save(origin);

        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error updating origin:", error);
        res.status(500).send("Error updating origin");
    }
});

router.post("/origins/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const originRepo = AppDataSource.getRepository(Origin);

        await originRepo.delete(Number(id));

        res.redirect("/admin/origins");
    } catch (error) {
        console.error("Error deleting origin:", error);
        res.status(500).send("Error deleting origin");
    }
});

export default router;