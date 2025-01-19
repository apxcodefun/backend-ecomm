import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: null },
  image: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      "sepatu",
      "kemeja",
      "baju",
      "celana",
      "handphone",
      "laptop",
      "aksesori",
      "tas",
      "jaket",
      "perhiasan",
      "sepatu olahraga",
      "kamera",
    ],
  },
  stock: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
