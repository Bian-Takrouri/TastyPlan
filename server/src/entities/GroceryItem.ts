import mongoose,{Document,Schema} from "mongoose";

export interface IGroceryItem extends Document {
    userId:mongoose.Types.ObjectId;
    name:string;
    quantity:number;
    completed:boolean;
    custom:boolean;
}

const groceryItemSchema=new Schema<IGroceryItem>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:255
    },
    quantity:{
        type:Number,
        default:1
    },
    completed:{
        type:Boolean,
        default:false
    },
    custom:{
        type:Boolean,
        default:false
    }
});

groceryItemSchema.index({userId:1,name:1},{unique:true});

export const GroceryItem=mongoose.model<IGroceryItem>("GroceryItem",groceryItemSchema);