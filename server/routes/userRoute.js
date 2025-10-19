import express from 'express'
import { login, signup, updateProfile } from '../controller/userController.js'
import { authRoute } from '../middleware/auth.js'

const userRouter = express.Router()

// User SignUp

userRouter.post('/signup',signup)

//User Login

userRouter.post('/login',login)

userRouter.put('/update-profile',authRoute,updateProfile)
userRouter.get("/check", authRoute, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default userRouter


