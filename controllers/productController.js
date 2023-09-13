import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from '../models/CategoryModel.js'
import orderModel from "../models/orderModel.js";
import fs from "fs";
import  braintree from "braintree";
import dotenv from 'dotenv'

dotenv.config();

//payment from braintree
const  gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey:  process.env.BRAINTREE_PUBLIC_KEY,
  privateKey:process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, resp) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return resp.status(500).send({ error: "Name is Required" });
      case !description:
        return resp.status(500).send({ error: "Description is Required" });
      case !price:
        return resp.status(500).send({ error: "Price is Required" });
      case !category:
        return resp.status(500).send({ error: "Category is Required" });
      case !quantity:
        return resp.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return resp
          .status(500)
          .send({ error: "Photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) }); //all the above items are added inside formdata of body in postman
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    resp.status(201).send({
      success: true,
      message: "product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error in Crating product",
    });
  }
};

//get all products
export const getProductController = async (req, resp) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    resp.status(200).send({
      success: true,
      TotalCount: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error in Getting product",
    });
  }
};

//get single product

export const getSingleProductController = async (req, resp) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    resp.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error in Getting product",
    });
  }
};

//get photo
export const productPhotoController = async (req, resp) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      resp.set("Content-type", product.photo.contentType);
      return resp.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error while getting photo",
    });
  }
};

//delete product

export const deleteProductController = async (req, resp) => {
  try {
    const product = await productModel
      .findByIdAndDelete(req.params.pid)
      .select("-photo");
    resp.status(200).send({
      success: true,
      message: "Product deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error while Deleting photo",
    });
  }
};

//update product
export const updateProductController = async (req, resp) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return resp.status(500).send({ error: "Name is Required" });
      case !description:
        return resp.status(500).send({ error: "Description is Required" });
      case !price:
        return resp.status(500).send({ error: "Price is Required" });
      case !category:
        return resp.status(500).send({ error: "Category is Required" });
      case !quantity:
        return resp.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return resp
          .status(500)
          .send({ error: "Photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    resp.status(201).send({
      success: true,
      message: "product updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "error in updating product",
    });
  }
};

//filter product
export const productFilterController = async (req, resp) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error While Filtering Products",
      error,
    });
  }
};

//product count

export const productCountController = async (req, resp) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    resp.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in Products Count",
      error,
    });
  }
};

//product list base on page
export const productListController = async (req, resp) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
      resp.status(200).send({
        success:true,
        products,
      })
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};



//search product
export const searchProductController=async(req,resp)=>{
  try {
       const {keyword}=req.params
       const results=await productModel.find({
        $or:[
          {name:{$regex:keyword,$options:"i"}},
          {description:{$regex:keyword,$options:"i"}}

        ]
       }).select("-photo")
       resp.json(results)
  } catch (error) {
    console.log(error)
    resp.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
}



//related product 

export const relatedProductController=async(req,resp)=>{
  try {
    const {pid,cid}=req.params
    const products=await productModel.find({
      category:cid,
      _id:{$ne:pid},
    })
    .select("-photo")
    .limit(3)
    .populate("category");
    resp.status(200).send({
      success:true,
      products,
    })
  } catch (error) {
    console.log(error)
    resp.status(400).send({
      success: false,
      message: "Error while getting related product",
      error,
    });
  }
}



//get product by category

export const productCategoryController=async(req,resp)=>{
  try {
         const category=await categoryModel.findOne({slug:req.params.slug})
         const products=await productModel.find({category}).populate('category')
         resp.status(200).send({
          success:true,
          category,
          products,
         })
  } catch (error) {
    console.log(error)
    resp.status(400).send({
      success: false,
      message: "Error while getting  product",
      error,
    });
  }
}




//payment gateway api
//token
// export const braintreeTokenController = async (req, resp) => {
//   try {
//     gateway.clientToken.generate({}, function (err, response) {
      
//       if (err) {
//         resp.status(500).send(err);
//       } else {
//         resp.send(response);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

export const braintreeTokenController=(req,resp)=>{
  gateway.clientToken.generate({}).then((response)=>{
    resp.status(200).send(response)
  }).catch(err=>resp.status(500).send(err))
}




//payment
export const braintreePaymentController=async(req,resp)=>{
try {
     const {cart,nonce}=req.body
     let total=0
     cart.map((i)=>{
      total+=i.price;
     });
     let newTransaction=gateway.transaction.sale({
      amount:total,
      paymentMethodNonce:nonce,
      options:{
        submitForSettlement:true
      }
     },
     function(error,result){
      if(result){
        const order=new orderModel({
          products:cart,
          payment:result,
          buyer:req.user._id
        }).save()
        resp.json({ok:true})
      }else{
        resp.status(500).send(error)
      }
     })
} catch (error) {
  console.log(error)
 
}
}