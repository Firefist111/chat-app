import jwt from 'jsonwebtoken'

export const generateToken = (data)=>{
  const token = jwt.sign({id:data.id},process.env.SECRET_KEY)
  return token 
}