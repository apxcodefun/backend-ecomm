import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  // clientKey: process.env.MIDTRANS_CLIENT_KEY,
  // transactionUrl: "https://api.sandbox.midtrans.com/v2/charge",
  // transactionUrl: "https://api.midtrans.com/v2/charge",
  // production: false,
});

export const createOrder = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, phone, cartItem } = req.body;

  // validasi cart kosong
  if (!cartItem || cartItem.length < 1) {
    return res.status(400).json({
      message: "Cart is empty",
    });
  }

  let orderItem = [];
  let orderMidTrans = [];
  let total = 0;
  for (const cart of cartItem) {
    const productData = await Product.findOne({ _id: cart.product });
    if (!productData) {
      return res.status(404).json({
        message: "Id Product not found",
      });
    }

    // Ambil data Product yang di dapatkan
    const { name, price, _id, stock } = productData;

    if (cart.quantity > stock) {
      return res.status(400).json({
        message: `Product ${name} only has ${stock} stock`,
      });
    }

    const singleProduct = {
      quantity: cart.quantity,
      name,
      price,
      product: _id,
    };

    const shortName = name.substring(0, 30);
    const singleProductMidtrans = {
      quantity: cart.quantity,
      name: shortName,
      price,
      id: _id,
    };

    orderItem = [...orderItem, singleProduct];
    orderMidTrans = [...orderMidTrans, singleProductMidtrans];
    total += cart.quantity * price;
  }

  // Ambil dari req.body di const awal
  const order = await Order.create({
    itemDetails: orderItem,
    total,
    firstName,
    lastName,
    email,
    phone,
    user: req.user.id,
  });

  let parameter = {
    transaction_details: {
      order_id: order._id,
      gross_amount: total,
    },
    item_details: orderMidTrans,
    customer_details: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
    },
  };
  try {
    const token = await snap.createTransaction(parameter);
    return res.status(201).json({
      order,
      total,
      message: "Order Product created",
      token,
    });
  } catch (error) {
    console.error("Midtrans Error:", error.message);
    return res.status(500).json({
      message: "Failed to create Midtrans transaction",
      error: error.message,
    });
  }

  // const token = await snap.createTransaction(parameter);

  // return res.status(201).json({
  //   order,
  //   total,
  //   message: "Order Product created",
  //   token,
  // });
});

export const allOrder = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  return res.status(201).json({
    data: orders,
    message: "All Order Product ",
  });
});

export const detailOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id); // id diambil d router yg udah d buat

  return res.status(201).json({
    data: order,
    message: "Detail Order Product ",
  });
});

export const currentOrder = asyncHandler(async (req, res) => {
  const order = await Order.find({ user: req.user.id });

  return res.status(201).json({
    data: order,
    message: "Current User Order",
  });
});

export const callbackPayment = asyncHandler(async (req, res) => {
  try {
    // Notifikasi dari Midtrans
    const statusRes = await snap.transaction.notification(req.body);

    console.log("Midtrans Notification:", statusRes); // Debug log

    const orderId = statusRes.order_id; // Pastikan ini sesuai dengan format ID di database Anda
    const transactionStatus = statusRes.transaction_status;
    const fraudStatus = statusRes.fraud_status;

    // Cari order berdasarkan ID
    const orderData = await Order.findById(orderId);

    if (!orderData) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    console.log("Order Data Found:", orderData); // Debug log

    // Handle status transaksi
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept") {
        // Kurangi stok produk
        for (const itemProduct of orderData.itemDetails) {
          const productData = await Product.findById(itemProduct.product);

          if (!productData) {
            console.error("Product not found:", itemProduct.product); // Debug log
            continue;
          }

          productData.stock -= itemProduct.quantity;
          await productData.save();
        }

        orderData.status = "success";
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderData.status = "failed";
    } else if (transactionStatus === "pending") {
      orderData.status = "pending";
    }

    // Simpan perubahan pada order
    await orderData.save();

    console.log("Order Updated:", orderData); // Debug log

    return res.status(200).json({
      message: "Payment Status Updated",
      data: orderData,
    });
  } catch (error) {
    console.error("Callback Payment Error:", error.message); // Debug log
    return res.status(500).json({
      message: "Failed to process payment callback",
      error: error.message,
    });
  }
});
