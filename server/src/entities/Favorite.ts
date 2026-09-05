import mongoose,{Document,Schema} from "mongoose";

export interface IFavorite extends Document {
    userId:mongoose.Types.ObjectId;
    recipeId:mongoose.Types.ObjectId;
    createdAt:Date;
}

const favoriteSchema=new Schema<IFavorite>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    recipeId:{
        type:Schema.Types.ObjectId,
        ref:"Recipe",
        required:true,
        index:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

favoriteSchema.index({userId:1,recipeId:1},{unique:true});

export const Favorite=mongoose.model<IFavorite>("Favorite",favoriteSchema);