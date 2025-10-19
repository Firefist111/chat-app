import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

// User signup

export const signup = async(req,res)=>{
  try {
    const {email,fullname,password} = req.body

    if(!email || !fullname || !password){
      return res.status(401).json({
        success : false,
        message : "Missing some credentials"
      })
    }

    const user = await User.findOne({email})

    if(user){
      return res.status(401).json({
         success : false,
        message : "User already exists"
      })
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password,salt)

    const newUser = await User.create({
      email,
      password:hashPassword,
      fullname
    })

    const token = generateToken({
      id : newUser.id
    })


    res.status(200).json({
      success : true,
      token,
      message : "User created successfully"

    })
  } catch (error) {
    res.status(500).json({
      message : `Server Error : ${error.message}` 
    })
  }
}

//User login 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Missing credentials"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = generateToken({ id: user.id });

    res.status(200).json({
      success: true,
      token,
      userData: user,
      message: "User logged in successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//Controller to update userProfile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, bio, profilePic } = req.body;

    let updatedData = { bio, fullname };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
