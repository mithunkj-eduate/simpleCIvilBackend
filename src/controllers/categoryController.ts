import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import { AuthRequest } from "../helpers/verifyjwt";
import Category from "../models/categoryModel";
import logger from "../helpers/loggerInfo";
import { categoryLevel, catrgroryStatus } from "../types/category";
import { level } from "winston";

//@desc create  category
//@route /category
//@access protected
//create category starts
// careate category
// POST
export const createCategory = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.name) {
      logger.error("name are required");
      return res.status(400).json({
        message: "name are required",
      });
    }

    if (req.body.level === categoryLevel.CATEGORY) {
      const group = await Category.findOne({
        _id: req.body.parentCatId,
        level: categoryLevel.GROUP,
      });

      if (!group) {
        logger.error("invalid group");
        res.status(400);
        throw new Error("invalid group");
      }
    } else if (req.body.level === categoryLevel.SUBSIDIARY) {
      const cat = await Category.findOne({
        _id: req.body.parentCatId,
        level: categoryLevel.CATEGORY,
      });

      if (!cat) {
        logger.error("invalid group");
        res.status(400);
        throw new Error("invalid group");
      }
    }

    const category = await Category.create({
      name: req.body.name,
      description: req.body.description,
      level: req.body.level,
      parentCatId: req.body.parentCatId,
      status: req.body.statue,
    });
    console.log("category", category);

    res.status(200).json({
      data: category,
      message: "Created successfully",
    });
  }
);

//@desc get  categories
//@route /category
//@access protected
// get categories

export const categories = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let filter: any = {};

    const { level, status, parentCatId } = req.query;

    if (level) filter.level = { $eq: level };
    if (status) filter.status = { $eq: status };
    if (parentCatId) {
      filter.$and = [
        { parentCatId: { $ne: null } },
        { parentCatId: { $eq: parentCatId } },
      ];
    }
    console.log("filter", filter);
    const data = await Category.find(filter);

    const totalCount = await Category.find(filter).countDocuments();
    return res.status(200).json({
      data,
      totalCount,
    });
  }
);

// get category by id
// GET /:id
export const categoryById = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) {
      logger.error("Category ID is required");
      return res.status(400).json({
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      logger.error(`Category not found with id: ${id}`);
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      data: category,
    });
  }
);

// update status of category
// POST /:id/status
export const updateCategoryStatus = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { status }: { status: catrgroryStatus } = req.body;

    if (!id) {
      logger.error("Category ID is required");
      return res.status(400).json({
        message: "Category ID is required",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!category) {
      logger.error(`Category not found with id: ${id}`);
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category status updated successfully",
      data: category,
    });
  }
);

// get category by parentCatId
// GET /:id

//temp imp
// createCategory = expressAsyncHandler(async (req, res) => {
//   if (req.file) {
//     console.log(req.file.location);
//     console.log(req.file)
//   }
//   console.log(req.body);
//   res.send("testing multer funcitonaliy");
// });
//temp imp end

// //@desc create  category
// //@route /category
// //@access protected
// //create category starts
// createCategory = expressAsyncHandler(async (req, res) => {
//   const validateObj = catSchema(req.body);
//   let catData = req.body;
//   if (validateObj.error) {
//     logger.error(validateObj.error.details[0].message);
//     res.status(400);
//     throw new Error(validateObj.error.details[0].message);
//   }

//   if (!req.body.pid && req.body.pid != 0) {
//     const cat = await Category.findById(req.body.pid);
//     if (cat == null || cat.isLeaf == true || cat.isDefault == true) {
//       logger.error("invalid category or leaf category or default category");
//       res.status(400);
//       throw new Error("invalid category or leaf category or default category");
//     }
//   }

//   const defaultCat = await Category.findOne({ isDefault: true });
//   if (!defaultCat) {
//     catData = { ...catData, isDefault: true, isLeaf: true };
//   }

//   //if user add file
//   if (req.file) {
//     catData = {
//       ...catData,
//       // img: `${req.file.location}`
//       img: `${req.protocol}://${req.get("host")}/api/public/${
//         req.file.filename
//       }`,
//     };
//   }

//   const category = new Category(catData);
//   const newCat = await category.save();
//   res.json({ title: "new  Category created", data: newCat });
// });

// //create category end

// //update category
// updateCategory = expressAsyncHandler(async (req, res) => {
//   //check weather category is leaf
//   cat = await Category.findOne({ _id: req.params.id });
//   if (req.body.pid !== undefined && req.body.pid != 0) {
//     parentcat = await Category.findOne({ _id: req.body.pid });
//     if (parentcat.isLeaf) {
//       logger.error("Cannot add under leaf categrory");
//       throw new Error("Cannot add under leaf categrory");
//     }
//   }

//   if (cat == null || cat.isDefault === true) {
//     logger.error(
//       "category not found or categroy is default or trying to add category under default category"
//     );
//     throw new Error(
//       "category not found or categroy is default or trying to add category under default category"
//     );
//   }

//   //update image of categpru
//   if (req.file != undefined && req.file.filename != "") {
//     // req.body = { ...req.body, img: `${req.file.location}` };
//     req.body = {
//       ...req.body,
//       img: `${req.protocol}://${req.get("host")}/api/public/${
//         req.file.filename
//       }`,
//     };
//   }

//   const category = await Category.findOneAndUpdate(
//     {
//       _id: req.params.id,
//     },
//     req.body,

//     { new: true }
//   );

//   if (!category) {
//     logger.error(`category not found of id:${req.params.is}`);
//     res.status(404);
//     throw new Error(`category not found of id:${req.params.is}`);
//   }

//   res.json({ title: "updated category detials", data: category });
// });

// //@desc delete  items by  category
// //@route /category
// //@access protected
// deleteCategory = expressAsyncHandler(async (req, res) => {
//   if (req.params.id === undefined) {
//     logger.errror("CategoryId is missing");
//     res.status(400);
//     throw new Error("CategoryId is missing");
//   }

//   //check weather category have any other category under it
//   cat = await Category.findOne({ _id: req.params.id });
//   if (cat == null || cat.isDefault === true) {
//     throw new Error("category not found or categroy is default");
//   }

//   catLength = await Category.find({ pid: cat._id });
//   if (catLength.length > 0) {
//     logger.error(
//       "category has some children category please delete those first"
//     );
//     res.status(500);
//     throw new Error(
//       "category has some children category please delete those first"
//     );
//   }

//   productList = await Product.findOne({ category: req.params.id });
//   if (productList) {
//     // defaultCat = await Category.findOne({ isDefault: true });
//     // updatedProducts = await Product.updateMany(
//     //   { category: req.params.id },
//     //   { $set: { category: defaultCat._id } }
//     // );
//     res.status(500);
//     throw new Error(
//       "category has some products please move those products and then try to delete"
//     );
//   }

//   const deletedCategory = await Category.deleteOne({
//     _id: req.params.id,
//   });
//   if (!deletedCategory) {
//     logger.error("Item not found");
//     res.status(400);
//     throw new Error("Item not found");
//   }

//   res.json({ title: "deleted category", data: deletedCategory });
// });
