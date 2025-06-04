import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
				selectedWeight: {
					type: String,
					required: true,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		deliveryCharge: {
			type: Number,
			default: 0,
			min: 0,
		},
		discount: {
			type: Number,
			default: 0,
			min: 0,
		},
		orderStatus: {
			type: String,
			enum: ["Pending", "Processing", "Shipped", "Delivered", "Canceled"],
			default: "Pending",
		},
		stripeSessionId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
