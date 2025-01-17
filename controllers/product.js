import asyncHandler from "./../middleware/asyncHandler.js";
import Product from "./../models/product.js";

export const createProduct = asyncHandler(async (req, res) => {
  const newProduct = await Product.create(req.body);

  return res.status(201).json({
    message: "Product created",
    data: newProduct,
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const paramsId = req.params.id;
  const data = await Product.findById(paramsId);

  if (!data) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.status(200).json({
    message: "Get Product",
    data,
  });
});

export const allProduct = asyncHandler(async (req, res) => {
  // Req Query
  const queryObject = { ...req.query };

  // fungsi untuk mengabaikan jika ada req berupa page dan limit
  const excludeField = ["page", "limit", "name"];
  excludeField.forEach((el) => delete queryObject[el]);

  let query;
  if (req.query.name) {
    query = Product.find({
      name: {
        $regex: req.query.name,
        $options: "i",
      },
    });
  } else {
    // fungsi filternya
    query = Product.find(queryObject);
  }

  // fungsi pagination
  const page = req.query.page * 1 || 1;
  const limitData = req.query.limit * 1 || 30;
  const skipData = (page - 1) * limitData;

  query = query.skip(skipData).limit(limitData);

  let countProduct = await Product.countDocuments(queryObject);
  if (req.query.page) {
    if (skipData >= countProduct) {
      res.status(400);
      throw new Error("Page not found");
    }
  }

  const data = await query;
  const totalPage = Math.ceil(countProduct / limitData);

  res.status(200).json({
    message: "All Product",
    data,
    pagination: {
      totalPage,
      page,
      totalProduct: countProduct,
    },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const paramsId = req.params.id;
  const data = await Product.findById(paramsId);

  if (!data) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const updatedProduct = await Product.findByIdAndUpdate(paramsId, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    message: "Product updated",
    data: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const paramsId = req.params.id;
  const data = await Product.findById(paramsId);

  if (!data) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  await Product.findByIdAndDelete(paramsId);

  return res.status(200).json({
    message: "Product deleted",
  });
});

export const fileUpload = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Please upload a file",
    });
  }

  const imageFile = file.filename;
  const pathImageFile = `/uploads/${imageFile}`;

  res.status(200).json({
    message: "File uploaded",
    image: pathImageFile,
  });
});
