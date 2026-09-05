import mongoose,{Document,Schema} from "mongoose";

export interface IUser extends Document {
    username:string;
    email:string;
    passwordHash:string;
    role:"admin"|"user";
    createdAt:Date;
}

const userSchema=new Schema<IUser>({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        maxlength:100
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        maxlength:255
    },
    passwordHash:{
        type:String,
        required:true,
        maxlength:255
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

export const User=mongoose.model<IUser>("User",userSchema);