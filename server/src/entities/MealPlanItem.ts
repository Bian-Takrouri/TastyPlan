import mongoose,{Document,Schema} from "mongoose";

export type DayOfWeek="Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday";

export interface IMealPlanItem extends Document {
    userId:mongoose.Types.ObjectId;
    recipeId:mongoose.Types.ObjectId;
    dayOfWeek:DayOfWeek;
}

const mealPlanItemSchema=new Schema<IMealPlanItem>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    recipeId:{
        type:Schema.Types.ObjectId,
        ref:"Recipe",
        required:true
    },
    dayOfWeek:{
        type:String,
        enum:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        required:true
    }
});

mealPlanItemSchema.index({userId:1,dayOfWeek:1},{unique:true});

export const MealPlanItem=mongoose.model<IMealPlanItem>("MealPlanItem",mealPlanItemSchema);