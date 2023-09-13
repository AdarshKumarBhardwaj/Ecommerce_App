import express from "express"
import {registerController,loginController,testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController} from "../controllers/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js"

//router object 
const router=express.Router()

//routing
//REGISTER || METHOD POST
router.post("/register",registerController)

//Login || METHOD POST
router.post("/login",loginController)

//forgot Password ||POST
router.post("/forgotpassword",forgotPasswordController)

//test Route
router.get("/test",requireSignIn,isAdmin,testController)

//protected route auth for user
router.get("/user-auth",requireSignIn,(req,resp)=>{
    resp.status(200).send({ok:true})
})

//protected route auth for admin
router.get("/admin-auth",requireSignIn,isAdmin,(req,resp)=>{
    resp.status(200).send({ok:true})
})


//update profile
router.put("/profile",requireSignIn,updateProfileController)

//orders
router.get("/orders",requireSignIn,getOrdersController)


//all orders
router.get("/all-orders",requireSignIn,isAdmin ,getAllOrdersController)


//order status update
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController)
export default router