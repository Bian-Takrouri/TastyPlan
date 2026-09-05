import mongoose,{Document,Schema} from "mongoose";

export interface IOrigin extends Document {
    name:string;
    country:string|null;
    flagUrl:string|null;
}

const originSchema=new Schema<IOrigin>({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        maxlength:100
    },
    country:{
        type:String,
        default:null,
        maxlength:100
    },
    flagUrl:{
        type:String,
        default:null,
        maxlength:500
    }
});

export const Origin=mongoose.model<IOrigin>("Origin",originSchema);