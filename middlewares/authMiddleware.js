import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Protected Routes token base
//for executing this middleware we must add authorization as key and generated token as value in header of postman
export const requireSignIn = async (req, resp, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
    
  } catch (error) {
    console.log(error);
  }
};

export const isAdmin = async (req, resp, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {     //if role=1 in database then it is a admin then this middleware executed 
      return resp.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    resp.status(401).send({
      success: false,
      message: "error in admin middleware",
    });
  }
};
