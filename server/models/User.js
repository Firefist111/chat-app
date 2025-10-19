import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema({
  email : {
    type:String,
    required:true,
    unique:true
  },
  fullname : {
    type:String,
    required:true
  },
  password : {
    type:String,
    required:true,
    minlength:6
  },
  profilePic : {
    type:String,
    default:""
  },
  bio : {
    type:String,
    default : ""
  }

},{timestamps : true})

const User = mongoose.model('User',userSchema)

userSchema.methods.comparePassword = async(password)=>{
  const result = await bcrypt.compare(password,this.password)

  return result 

}

export default User