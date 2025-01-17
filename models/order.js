import mongoose from "mongoose";

const { Schema } = mongoose;

const singleProduct = Schema({
  name: {
    type: String,
    required: [true, "Nama produk harus diisi"],
  },
  quantity: {
    type: Number,
    required: [true, "Jumlah produk harus diisi"],
  },
  price: {
    type: Number,
    required: [true, "Harga produk harus diisi"],
  },
  product: {
    type: Schema.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = new Schema({
  total: {
    type: Number,
    required: [true, "Total harga harus diisi"],
  },
  itemDetails: [singleProduct],
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: [true, "Status pesanan harus diisi"],
    enum: ["pending", "cancelled", "success"],
    default: "pending",
  },

  firstName: {
    type: String,
    required: [true, "Nama depan harus diisi"],
  },
  lastName: {
    type: String,
    required: [true, "Nama belakang harus diisi"],
  },
  email: {
    type: String,
    required: [true, "Alamat email harus diisi"],
  },
  phone: {
    type: String,
    required: [true, "Nomor telepon harus diisi"],
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
