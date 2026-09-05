import mongoose,{Document,Schema} from "mongoose";

export interface ICategory extends Document {
    name:string;
    description:string|null;
    imageUrl:string|null;
}

const categorySchema=new Schema<ICategory>({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        maxlength:100
    },
    description:{
        type:String,
        default:null
    },
    imageUrl:{
        type:String,
        default:null,
        maxlength:500
    }
});

export const Category=mongoose.model<ICategory>("Category",categorySchema);