import mongoose, {
    Document,
    Schema,
    Types
} from "mongoose";

export interface IFavorite extends Document {
    user: Types.ObjectId;
    recipe: Types.ObjectId;
    createdAt: Date;
}

const favoriteSchema =
    new Schema<IFavorite>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            recipe: {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                required: true,
                index: true
            }
        },
        {
            timestamps: {
                createdAt: true,
                updatedAt: false
            }
        }
    );

favoriteSchema.index(
    {
        user: 1,
        recipe: 1
    },
    {
        unique: true
    }
);

export const Favorite =
    mongoose.model<IFavorite>(
        "Favorite",
        favoriteSchema
    );
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     CreateDateColumn,
//     ManyToOne,
//     JoinColumn,
//     Unique,
//     Index
// } from "typeorm";

// import { User } from "./User.js";
// import { Recipe } from "./Recipe.js";

// @Entity("favorites")
// @Unique(["user", "recipe"])
// export class Favorite {

//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Index("idx_favorite_user")
//     @ManyToOne(
//         () => User,
//         (user) => user.favorites,
//         {
//             onDelete: "CASCADE"
//         }
//     )
//     @JoinColumn({
//         name: "user_id"
//     })
//     user!: User;

//     @Index("idx_favorite_recipe")
//     @ManyToOne(
//         () => Recipe,
//         (recipe) => recipe.favorites,
//         {
//             onDelete: "CASCADE"
//         }
//     )
//     @JoinColumn({
//         name: "recipe_id"
//     })
//     recipe!: Recipe;

//     @CreateDateColumn({
//         name: "created_at",
//         type: "timestamp"
//     })
//     createdAt!: Date;
// }