const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const planRoutes = require("./routes/planRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const discountRoutes = require("./routes/discountRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);



const PORT = process.env.PORT || 5000;

app.use("/api/products", productRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/discounts", discountRoutes);


app.get("/", (req, res) => {
    res.send("SubFlow API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});