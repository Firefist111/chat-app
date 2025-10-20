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
      userData: newUser,
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
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id });
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json({ success: true, token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


//Controller to update userProfile
export const updateProfile = async (req, res) => {
  try {
    console.log("🟣 updateProfile called");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found in request",
      });
    }

    const { fullname, bio, profilePic } = req.body;
    let updatedData = { bio, fullname };

    // ✅ If new image uploaded
    if (profilePic) {
      console.log("Uploading image to Cloudinary...");
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "chat-app-profiles", // optional folder
      });
      updatedData.profilePic = upload.secure_url;
      console.log("✅ Image uploaded:", upload.secure_url);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    console.log("✅ Updated user:", updatedUser);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
