CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500)
);

CREATE TABLE origins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    flag_url VARCHAR(500)
);

CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    origin_id INT,
    instructions TEXT,
    image_url VARCHAR(500),
    youtube_url VARCHAR(500),
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    FOREIGN KEY (origin_id)
        REFERENCES origins(id)
        ON DELETE SET NULL,

    INDEX idx_recipe_name (name),
    INDEX idx_recipe_category (category_id),
    INDEX idx_recipe_origin (origin_id)
);

CREATE TABLE recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient VARCHAR(255) NOT NULL,
    measure VARCHAR(100),

    FOREIGN KEY (recipe_id)
        REFERENCES recipes(id)
        ON DELETE CASCADE,

    INDEX idx_recipe_id (recipe_id),
    INDEX idx_ingredient_name (ingredient)
);

CREATE TABLE meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE meal_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT NOT NULL,
    recipe_id INT NOT NULL,
    day_of_week ENUM(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ) NOT NULL,

    FOREIGN KEY (meal_plan_id)
        REFERENCES meal_plans(id)
        ON DELETE CASCADE,

    FOREIGN KEY (recipe_id)
        REFERENCES recipes(id)
        ON DELETE CASCADE,

    UNIQUE (meal_plan_id, day_of_week)
);

CREATE TABLE grocery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    custom BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (recipe_id)
        REFERENCES recipes(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, recipe_id)
);