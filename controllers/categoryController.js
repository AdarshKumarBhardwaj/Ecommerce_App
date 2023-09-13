import CategoryModel from "../models/CategoryModel.js"
import slugify from 'slugify'      //when we pur space between the category name then it add - in between them

export const createCategoryController=async(req,resp)=>{
    try {
        const {name}=req.body
        if(!name){
            return resp.status(401).send({message:"Name is Required"})
        }
        const existingCategory=await CategoryModel.findOne({name})
        if(existingCategory){
            return resp.status(200).send({
                success:true,
                message:'Category Already Exists'
            })
        }
        const category=await new CategoryModel({name,slug:slugify(name)}).save()
        resp.status(201).send({
            success:true,
            message:"new Category Created",
            category
        })
        
    } catch (error) {
        console.log(error)
        resp.status(500).send({
            success:false,
            error,
            message:"error in Category"
        })
        
    }
}




//update category
export const updateCategoryController=async(req,resp)=>{
    try {
        const {name}=req.body
        const {id}=req.params
        const category=await CategoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true})
        resp.status(200).send({
            success:true,
             message:"Category Updated Successfully",
             category,
        })
    } catch (error) {
        console.log(error)
        resp.status(500).send({
            success:false,
            error,
            message:"Error while updating category"
        })
    }

}


//get all category
export const categoryController=async(req,resp)=>{
   try {
       const {name}=req.body
       const category=await CategoryModel.find({})
       resp.status(200).send({
        success:true,
         message:"All category list",
         category,
    })
   } catch (error) {
    console.log(error)
    resp.status(500).send({
        success:false,
        error,
        message:"Error while fetching category"
    })
}
   }



   //get single category
   export const singleCategoryController=async(req,resp)=>{
    try {
       
        const category=await CategoryModel.findOne({slug:req.params.slug})
        resp.status(200).send({
         success:true,
          message:"Get single category successfully",
          category,
     })
        
    } catch (error) {
        console.log(error)
        resp.status(500).send({
            success:false,
            error,
            message:"Error while fetching single category"
        })
    }
    }
   


    //delete category

    export const deleteCategoryController=async(req,resp)=>{
        try {
            const {id}=req.params
        const category=await CategoryModel.findByIdAndDelete(id)
        resp.status(200).send({
            success:true,
             message:"Category Deleted Successfully",
             category,
        })
            
        } catch (error) {
            console.log(error)
            resp.status(500).send({
                success:false,
                error,
                message:"Error while fetching single category"
            })
        }
        }
   
