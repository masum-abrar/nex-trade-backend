import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
// import SSLCommerzPayment from "sslcommerz-lts";
import allRoutes from "./routes/index.js";
import brokerUserRoutes from "../src/routes/auth/users.js";

// const store_id = "asdas";
// const store_passwd = "asdasd";
// const is_live = false; //true for live, false for sandbox

// const pid = process.pid;

//cluster module
// if (cluster.isPrimary) {
//   const cpus = os.cpus().length;

//   console.log(`Forking for ${cpus} CPUs`);

//   for (let i = 0; i < cpus; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
//main app
const app = express();

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(cookieParser());

//serve static files
app.use(express.static("public"));

dotenv.config();

const port = process.env.PORT || 4000;

//middlewares
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.json({ msg: "Voltech API is working..." });
});

app.use("/api", allRoutes);

//sslcommerz init
// app.get("/init", (req, res) => {
//   const data = {
//     total_amount: 100,
//     currency: "BDT",
//     tran_id: "REF123", // use unique tran_id for each api call
//     success_url: "http://localhost:4000/api/v1/orders-success",
//     fail_url: "http://localhost:3030/fail",
//     cancel_url: "http://localhost:3030/cancel",
//     ipn_url: "http://localhost:3030/ipn",
//     shipping_method: "Courier",
//     product_name: "Computer.",
//     product_category: "Electronic",
//     product_profile: "general",
//     cus_name: "Customer Name",
//     cus_email: "customer@example.com",
//     cus_add1: "Dhaka",
//     cus_add2: "Dhaka",
//     cus_city: "Dhaka",
//     cus_state: "Dhaka",
//     cus_postcode: "1000",
//     cus_country: "Bangladesh",
//     cus_phone: "01711111111",
//     cus_fax: "01711111111",
//     ship_name: "Customer Name",
//     ship_add1: "Dhaka",
//     ship_add2: "Dhaka",
//     ship_city: "Dhaka",
//     ship_state: "Dhaka",
//     ship_postcode: 1000,
//     ship_country: "Bangladesh",
//   };
//   const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
//   sslcz.init(data).then((apiResponse) => {
//     // Redirect the user to payment gateway
//     let GatewayPageURL = apiResponse.GatewayPageURL;
//     res.redirect(GatewayPageURL);
//     console.log("Redirecting to: ", GatewayPageURL);
//   });
// });
// app.use("/api", brokerUserRoutes);
app.listen(port, () => {
  console.log(`Voltech API is working on port ${port}`);
});
// }
