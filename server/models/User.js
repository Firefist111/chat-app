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

// Define methods before creating the model
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User
