import  express  from "express";
import{isAdmin,requireSignIn} from './../middlewares/authMiddleware.js'
import {createCategoryController,updateCategoryController,categoryController,singleCategoryController,deleteCategoryController} from './../controllers/categoryController.js'

const router=express.Router()

//create category
router.post('/create-category',requireSignIn,isAdmin,createCategoryController)


//update category
router.put('/update-category/:id',requireSignIn,isAdmin,updateCategoryController)
export default router


//get all category
router.get('/get-category',categoryController)


//get single category
router.get('/single-category/:slug',singleCategoryController)        //pass the value of slug from database in url in postman


//delete category
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController)