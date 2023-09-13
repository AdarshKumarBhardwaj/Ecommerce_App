import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken"

export const registerController=async(req,resp)=>{
      try {
           const{name,email,password,phone,address,answer}=req.body
           if(!name){
            return resp.send({message:"Name is Required"})
           }
           if(!email){
            return resp.send({message:"Email is Required"})
           }
           if(!password){
            return resp.send({message:"Password is Required"})
           }
           if(!phone){
            return resp.send({message:"Phone is Required"})
           }
           if(!address){
            return resp.send({message:"Address is Required"})
           }
           if(!answer){
            return resp.send({message:"Answer is Required"})
           }

           //existing user
           const existingUser=await userModel.findOne({email})
           if(existingUser){
               return resp.status(200).send({
                success:false,
                message:"Already Register Please Login"
               })               
           }

           //register user
           const hashedPassword=await hashPassword(password)
           //save
           const user=await new userModel({name,email,phone,address,password:hashedPassword,answer}).save();
           resp.status(201).send({
            success:true,
            message:"User Register Successfully",
            user,
           })
      } catch (error) {
        console.log(error)
        resp.status(500).send({
            success:false,
            message:"error in Registration"
        })
      }
};


//POST LOGIN
export const loginController=async(req,resp)=>{
  try {
     const {email,password}=req.body
    //validation
    if(!email || !password){
      return resp.status(404).send({
        success:false,
        message:"Invalid email or Password",
      })
    }
     //check user
     const user=await userModel.findOne({email})
     if(!user){
      return resp.status(404).send({
      success:false,
      message:"Email is not registered",
      })
     }
     const match=await comparePassword(password,user.password)
     if(!match){
      return resp.status(200).send({
        success:false,
        message:"Invalid Password",
        })
     }

     //token
     const token=await jwt.sign({_id:user._id},process.env.JWT_SECRET,{
      expiresIn:"20d",
     })
     resp.status(200).send({
      success:true,
      message:"login Successfully",
      user:{
        _id:user._id,
        name:user.name,
        email:user.email, 
        phone:user.phone,
        address:user.address ,
        role:user.role 
      },
      token,
     })
  } catch (error) {
    console.log(error)
    resp.status(500).send({
      success:false,
      message:"Error in Login",
      error
    })

  }

}


//test controller

export const testController=(req,resp)=>{
  console.log("protected route")
  resp.send("test executed")
}


//forgot password

export const forgotPasswordController=async(req,resp)=>{
  try {
       const {email,answer,newpassword,}=req.body
       if(!email){
        return resp.send({message:"Email is Required"})
       }
       if(!answer){
        return resp.send({message:"Answer is Required"})
       }
       if(!newpassword){
        return resp.send({message:"NewPassword is Required"})
       }

       //check
       const user=await userModel.findOne({email,answer})
       if(!user){
         return resp.status(404).send({
          success:false,
          message:"Wrong Email or Answer"
         })
       }
       const hashed=await hashPassword(newpassword)
       await userModel.findByIdAndUpdate(user._id,{password:hashed})
       resp.status(200).send({
        success:true,
        message:"Password Reset Successfully"
       })
  } catch (error) {
    console.log(error)
    resp.status(500).send({
      success:false,
      message:"something went wrong",
      error
    })
  }
}




//update profile

export const updateProfileController=async(req,resp)=>{
  try {
      const {name,email,password,address,phone}=req.body
      const user=await userModel.findById(req.user._id)

      //password
      if(password && password.length<6){
        return resp.json({error:"Password is required and 6 character long"})
      }

      const hashedPassword=password?await hashPassword(password):undefined
      const updatedUser=await userModel.findByIdAndUpdate(req.user._id,{
        name:name || user.name,
        password:hashedPassword || user.hashedPassword,
        phone:phone || user.phone,
        address:address || user.address,
      },{new:true})
      resp.status(200).send({
        success:true,
        message:"Profile Updates Successfully",
        updatedUser,
      })
  } catch (error) {
    console.log(error)
    resp.status(500).send({
      success:false,
      message:"Error while updating password",
      error
    })
  }
}



//orders
export const getOrdersController=async(req,resp)=>{
try {
     const orders=await orderModel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name");
     resp.json(orders)
} catch (error) {
  console.log(error)
    resp.status(500).send({
      success:false,
      message:"Error while getting Orders",
      error
    })
}
}



//all orders

export const getAllOrdersController=async(req,resp)=>{
  try {
    const orders=await orderModel.find({}).populate("products","-photo").populate("buyer","name").sort({createdAt:"-1"});
    resp.json(orders)
} catch (error) {
 console.log(error)
   resp.status(500).send({
     success:false,
     message:"Error while getting Orders",
     error
   })
}
}


//order status
export const orderStatusController=async(req,resp)=>{
  try {
      const {orderId}=req.params
      const {status}=req.body
      const orders=await orderModel.findByIdAndUpdate(orderId,{status},{new:true})
      resp.json(orders)
  } catch (error) {
    console.log(error)
   resp.status(500).send({
     success:false,
     message:"Error while Updating Orders",
     error
   })
  }
}