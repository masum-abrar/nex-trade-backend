// import pkg from "sslcommerz-lts";
// import dotenv from "dotenv";
import SSLCommerzPayment from "sslcommerz-lts";
import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import sendEmail from "../../utils/emailService.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";

// dotenv.config();

const module_name = "order";

const store_id = "strik679cf43feb667";
const store_passwd = "strik679cf43feb667@ssl";
const is_live = false; //true for live, false for sandbox

//create order
export const createOrder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const {
        userId,
        couponId,
        customerName,
        customerPhone,
        customerAddress,
        customerBillingAddress,
        customerEmail,
        customerCity,
        customerPostalCode,
        invoiceNumber,
        paymentMethod,
        deliveryChargeInside,
        deliveryChargeOutside,
        // totalItems,
        // subtotalCost,
        // subtotal,
        orderItems,
      } = req.body;

      //validate input
      const inputValidation = validateInput(
        [
          customerName,
          customerPhone,
          customerAddress,
          customerBillingAddress,
          customerEmail,
          customerCity,
          invoiceNumber,
          paymentMethod,
        ],
        [
          "Name",
          "Phone",
          "Shipping Address",
          "Billing Address",
          "Email",
          "City",
          "Invoice",
          "Payment Method",
        ]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // console.log("SSL");

      //count total items and subtotal price for order and get name,size,prices info
      let totalNumberOfItems = 0;
      let subtotal = 0;
      let subtotalCost = 0;
      let newOrderItems = [];
      let allProductNames = "";

      if (orderItems && orderItems.length > 0) {
        const orderItemLength = orderItems.length;
        for (let i = 0; i < orderItemLength; i++) {
          //get product and product attribute for getting prices,name,size info
          const product = await tx.product.findFirst({
            where: {
              id: orderItems[i].productId,
              isDeleted: false,
              isActive: true,
            },
          });
          const productAttribute = await tx.productAttribute.findFirst({
            where: { id: orderItems[i].productAttributeId, isDeleted: false },
          });

          if (!product && !productAttribute) {
            return res
              .status(409)
              .json(jsonResponse(false, "Product does not exist", null));
          }

          newOrderItems.push({
            ...orderItems[i],
            name: product.name,
            size: productAttribute.size,
            costPrice: productAttribute.costPrice,
            retailPrice: productAttribute.retailPrice,
            discountPercent: productAttribute.discountPercent,
            discountPrice: productAttribute.discountPrice,
            discountedRetailPrice: productAttribute.discountedRetailPrice,
            totalCostPrice: orderItems[i].quantity * productAttribute.costPrice,
            totalPrice:
              orderItems[i].quantity * productAttribute.discountedRetailPrice,
            quantity: orderItems[i].quantity,
          });

          //calculate total number of items
          totalNumberOfItems = totalNumberOfItems + orderItems[i].quantity;

          //calculate discount prices
          let discountPrice =
            productAttribute.retailPrice *
            (productAttribute.discountPercent / 100);
          let discountedRetailPrice =
            (productAttribute.retailPrice - discountPrice) *
            orderItems[i].quantity;

          //calculate subtotal and subtotal cost price
          // subtotal = subtotal + discountedRetailPrice;
          subtotal = subtotal + orderItems[i]?.totalPrice;
          subtotalCost = subtotalCost + orderItems[i]?.totalCostPrice;
          // subtotalCost =
          //   subtotalCost + orderItems[i].quantity * productAttribute.costPrice;

          allProductNames = allProductNames + ", " + orderItems[i]?.name;
        }
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Please select at least 1 item", null));
      }

      //get coupon
      let coupon = await tx.coupon.findFirst({
        where: { id: couponId, isActive: true },
      });

      //create order
      let newOrder = await tx.order.create({
        data: {
          userId,
          couponId,
          customerName,
          customerPhone,
          customerAddress,
          customerEmail,
          customerBillingAddress,
          customerCity,
          customerPostalCode,
          invoiceNumber,
          totalItems: totalNumberOfItems,
          subtotalCost: subtotalCost,
          subtotal:
            subtotal +
            (deliveryChargeInside ?? deliveryChargeOutside) -
            (coupon?.discountAmount ?? 0),
          paymentMethod,
          deliveryChargeInside: deliveryChargeInside ?? null,
          deliveryChargeOutside: deliveryChargeOutside ?? null,
          orderItems: {
            create: newOrderItems,
          },
        },
      });

      if (!newOrder) {
        return res
          .status(200)
          .json(jsonResponse(false, `Order cannot be placed`, null));
      }

      //reduce stock amount
      for (let i = 0; i < orderItems.length; i++) {
        await tx.productAttribute.update({
          where: { id: orderItems[i].productAttributeId },
          data: {
            stockAmount: { decrement: orderItems[i].quantity },
          },
        });
      }

      console.log("ORDER CHECK");

      // <tr>
      //             <td></td>
      //             <td></td>
      //             <td><b>Discount: </b></td>
      //             <td>${subtotal + deliveryChargeInside - subtotal} TK</td>
      //           </tr>

      //send email invoice
      const emailGenerate = await sendEmail(
        customerEmail,
        `Order Invoice #${invoiceNumber}`,
        `<p>Dear ${customerName},</p>

          <p>Your order has been placed successfully!</p>

          <p><b>Order Information:</b></p>
          <p><b>Phone:</b> ${customerPhone}</p>
          <p><b>Shipping Address:</b> ${customerAddress}</p>
          <p><b>Billing Address:</b> ${customerBillingAddress}</p>
          <p><b>City:</b> ${customerCity}</p>
          <p><b>Postal Code:</b> ${customerPostalCode}</p>
          <p><b>Payment Method:</b> ${paymentMethod}</p>
          <p><b>Total Items:</b> ${totalNumberOfItems}</p>
          <p><b>Order Status:</b> Pending</p>
          <br/>
          <table border="1">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems?.map(
                (orderItm) =>
                  `<tr>
                  <td>
                    ${orderItm?.name} (${orderItm?.size})
                  </td>
                  <td>${orderItm?.discountedRetailPrice} TK</td>
                  <td>${orderItm?.quantity}</td>
                  <td>${orderItm?.totalPrice} TK</td>
                </tr>`
              )}
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Coupon Discount: </b></td>
                  <td>${coupon?.discountAmount ?? 0} TK</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Delivery Charge: </b></td>
                  <td>${deliveryChargeInside ?? 0} TK</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Subtotal: </b></td>
                  <td><b>${
                    subtotal +
                    deliveryChargeInside -
                    (coupon?.discountAmount ?? 0)
                  } TK</b></td>
                </tr>
            </tbody>
          </table>

          <br/><br/>
          <p>Thank you for shopping. Your order status will be updated soon.</p>
        `
      );

      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            "Order has been placed successfully! We have sent an invoice to your mail. Thank you.",
            newOrder
          )
        );
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//create order ssl
export const createOrderSsl = async (req, res) => {
  const {
    userId,
    couponId,
    customerName,
    customerPhone,
    customerAddress,
    customerBillingAddress,
    customerEmail,
    customerCity,
    customerPostalCode,
    invoiceNumber,
    paymentMethod,
    deliveryChargeInside,
    deliveryChargeOutside,
    // totalItems,
    // subtotalCost,
    // subtotal,
    orderItems,
  } = req.body;

  //count total items and subtotal price for order and get name,size,prices info
  let totalNumberOfItems = 0;
  let subtotal = 0;
  let subtotalCost = 0;
  let newOrderItems = [];
  let allProductNames = "";

  if (orderItems && orderItems.length > 0) {
    const orderItemLength = orderItems.length;
    for (let i = 0; i < orderItemLength; i++) {
      //get product and product attribute for getting prices,name,size info
      const product = await prisma.product.findFirst({
        where: {
          id: orderItems[i].productId,
          isDeleted: false,
          isActive: true,
        },
      });
      const productAttribute = await prisma.productAttribute.findFirst({
        where: { id: orderItems[i].productAttributeId, isDeleted: false },
      });

      if (!product && !productAttribute) {
        return res
          .status(409)
          .json(jsonResponse(false, "Product does not exist", null));
      }

      newOrderItems.push({
        ...orderItems[i],
        name: product.name,
        size: productAttribute.size,
        costPrice: productAttribute.costPrice,
        retailPrice: productAttribute.retailPrice,
        discountPercent: productAttribute.discountPercent,
        discountPrice: productAttribute.discountPrice,
        discountedRetailPrice: productAttribute.discountedRetailPrice,
        totalCostPrice: orderItems[i].quantity * productAttribute.costPrice,
        totalPrice:
          orderItems[i].quantity * productAttribute.discountedRetailPrice,
        quantity: orderItems[i].quantity,
      });

      //calculate total number of items
      totalNumberOfItems = totalNumberOfItems + orderItems[i].quantity;

      //calculate discount prices
      let discountPrice =
        productAttribute.retailPrice * (productAttribute.discountPercent / 100);
      let discountedRetailPrice =
        (productAttribute.retailPrice - discountPrice) * orderItems[i].quantity;

      //calculate subtotal and subtotal cost price
      subtotal = subtotal + orderItems[i]?.totalPrice;
      subtotalCost = subtotalCost + orderItems[i]?.totalCostPrice;
      // subtotal = subtotal + discountedRetailPrice;
      // subtotalCost =
      //   subtotalCost + orderItems[i].quantity * productAttribute.costPrice;

      allProductNames = allProductNames + ", " + orderItems[i]?.name;
    }
  } else {
    return res
      .status(404)
      .json(jsonResponse(false, "Please select at least 1 item", null));
  }

  //get coupon
  let coupon = await prisma.coupon.findFirst({
    where: { id: couponId, isActive: true },
  });

  //ssl commerz
  if (paymentMethod?.toLowerCase() === "digital payment") {
    const data = {
      total_amount:
        subtotal + deliveryChargeInside - (coupon?.discountAmount ?? 0),
      currency: "BDT",
      tran_id: invoiceNumber, // use unique tran_id for each api call
      // success_url: "http://localhost:4000/api/v1/orders-success",
      // fail_url: "http://localhost:4000/api/v1/orders-fail",
      // cancel_url: "http://localhost:4000/api/v1/orders-fail",
      success_url: "https://voltech-core.vercel.app/api/v1/orders-success",
      fail_url: "https://voltech-core.vercel.app/api/v1/orders-fail",
      cancel_url: "https://voltech-core.vercel.app/api/v1/orders-fail",
      ipn_url: "http://localhost:3000/ipn/",
      shipping_method: "Courier",
      product_name: allProductNames,
      product_category: "Product",
      product_profile: "general",
      cus_name: customerName,
      cus_email: customerEmail,
      cus_add1: customerBillingAddress,
      cus_add2: "",
      cus_city: customerCity,
      cus_state: customerCity,
      cus_postcode: customerPostalCode,
      cus_country: "Bangladesh",
      cus_phone: customerPhone,
      cus_fax: "",
      ship_name: customerName,
      ship_add1: customerAddress,
      ship_add2: "",
      ship_city: customerCity,
      ship_state: customerCity,
      ship_postcode: Number(customerPostalCode),
      ship_country: "Bangladesh",
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    await sslcz.init(data).then((apiResponse) => {
      console.log("Full API Response:", apiResponse); // Debugging API response

      if (!apiResponse || !apiResponse.GatewayPageURL) {
        return res.status(400).json(
          jsonResponse(false, "Failed to get Gateway URL", {
            error: apiResponse,
          })
        );
      }

      let GatewayPageURL = apiResponse.GatewayPageURL;
      console.log("Redirecting to:", GatewayPageURL);

      // ✅ Ensure only ONE response is sent
      if (!res.headersSent) {
        return res.status(200).json(
          jsonResponse(true, "Redirecting to SSL COMMERZ.", {
            gateway: GatewayPageURL,
          })
        );
      }
    });
    // return;
  }
};

export const createOrderSuccess = async (req, res) => {
  // console.log({ req });
  // res.redirect("http://localhost:3000/checkout?isSuccess=true");
  res.redirect("https://voltech-commerce.vercel.app/checkout?isSuccess=true");
};

export const createOrderFail = async (req, res) => {
  // console.log({ res });
  // res.redirect("http://localhost:3000/checkout?isSuccess=false");
  res.redirect("https://voltech-commerce.vercel.app/checkout?isSuccess=false");
};

//get orders ssl
export const getOrdersSsl = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all orders
export const getOrders = async (req, res) => {
  if (req.user.roleName !== "super-admin") {
    getOrdersByUser(req, res);
  } else {
    try {
      const orders = await prisma.order.findMany({
        where: {
          isDeleted: false,
          // AND: [
          //   {
          //     customerName: {
          //       contains: req.query.customer_name,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     customerPhone: {
          //       contains: req.query.customer_phone,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     customerAddress: {
          //       contains: req.query.customer_address,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     customerCity: {
          //       contains: req.query.customer_city,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     customerPostalCode: {
          //       contains: req.query.customer_postal_code,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     invoiceNumber: {
          //       contains: req.query.invoice_number,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     paymentMethod: {
          //       contains: req.query.payment_method,
          //       mode: "insensitive",
          //     },
          //   },
          //   {
          //     status: {
          //       contains: req.query.status,
          //       mode: "insensitive",
          //     },
          //   },
          // ],
        },
        include: {
          orderItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip:
          req.query.limit && req.query.page
            ? parseInt(req.query.limit * (req.query.page - 1))
            : parseInt(defaultLimit() * (defaultPage() - 1)),
        take: req.query.limit
          ? parseInt(req.query.limit)
          : parseInt(defaultLimit()),
      });

      if (orders.length === 0)
        return res
          .status(200)
          .json(jsonResponse(true, "No order is available", null));

      if (orders) {
        return res
          .status(200)
          .json(jsonResponse(true, `${orders.length} orders found`, orders));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Something went wrong. Try again", null));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(jsonResponse(false, error, null));
    }
  }
};

//get all orders by user
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.params.id,
        isDeleted: false,
        // AND: [
        //   {
        //     customerName: {
        //       contains: req.query.customer_name,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     customerPhone: {
        //       contains: req.query.customer_phone,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     customerAddress: {
        //       contains: req.query.customer_address,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     customerCity: {
        //       contains: req.query.customer_city,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     customerPostalCode: {
        //       contains: req.query.customer_postal_code,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     invoiceNumber: {
        //       contains: req.query.invoice_number,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     paymentMethod: {
        //       contains: req.query.payment_method,
        //       mode: "insensitive",
        //     },
        //   },
        //   {
        //     status: {
        //       contains: req.query.status,
        //       mode: "insensitive",
        //     },
        //   },
        // ],
      },
      include: {
        orderItems: true,
      },

      orderBy: {
        createdAt: "desc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (orders.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No order is available", null));

    if (orders) {
      return res
        .status(200)
        .json(jsonResponse(true, `${orders.length} orders found`, orders));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "Something went wrong. Try again", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get single order
export const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: {
        orderItems: true,
      },
    });

    if (order) {
      return res.status(200).json(jsonResponse(true, `1 order found`, order));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No order is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update order status
export const updateOrder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { status } = req.body;

      const orderItems = await tx.orderItem.findMany({
        where: { orderId: req.params.id },
      });

      const orderItemsLength = orderItems.length;

      const getOrder = await tx.order.findFirst({
        where: { id: req.params.id },
      });

      //update order status
      let order;
      if (orderItems && orderItemsLength > 0) {
        order = await tx.order.update({
          where: { id: req.params.id },
          data: {
            status,
          },
        });

        if (order) {
          //stock amount reduction calculation
          // if (order.status === "DELIVERED") {
          //   for (let i = 0; i < orderItemsLength; i++) {
          //     const productAttribute = await tx.productAttribute.update({
          //       where: { id: orderItems[i].productAttributeId },
          //       data: {
          //         stockAmount: { decrement: orderItems[i].quantity },
          //       },
          //     });
          //   }
          // }

          if (order.status === "CANCELED" || order.status === "RETURNED") {
            for (let i = 0; i < orderItemsLength; i++) {
              const productAttribute = await tx.productAttribute.update({
                where: { id: orderItems[i].productAttributeId },
                data: {
                  stockAmount: { increment: orderItems[i].quantity },
                },
              });
            }
          }
        }
      }

      if (order && orderItemsLength > 0) {
        //send email invoice
        let orderStatus = "SHIPPED";
        if (order?.status === "CANCELED") {
          orderStatus = "CANCELED";
        }
        if (order?.status === "RETURNED") {
          orderStatus = "RETURNED";
        }
        if (order?.status === "DELIVERED") {
          orderStatus = "DELIVERED";
        }
        const emailGenerate = await sendEmail(
          order?.customerEmail,
          `Order Status Updated For Invoice #${order?.invoiceNumber}`,
          `<p>Dear ${order?.customerName},</p>

          <p>Your order has been ${orderStatus}!</p>

          <p><b>Order Information:</b></p>
          <p><b>Phone:</b> ${order?.customerPhone}</p>
          <p><b>Shipping Address:</b> ${order?.customerAddress}</p>
          <p><b>Billing Address:</b> ${order?.customerBillingAddress}</p>
          <p><b>City:</b> ${order?.customerCity}</p>
          <p><b>Postal Code:</b> ${order?.customerPostalCode}</p>
          <p><b>Payment Method:</b> ${order?.paymentMethod}</p>
          <p><b>Total Items:</b> ${order?.totalItems}</p>
          <p><b>Order Status:</b> ${status}</p>
          <br/>
          <table border="1">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems?.map(
                (orderItm) =>
                  `<tr>
                  <td>
                    ${orderItm?.name} (${orderItm?.size})
                  </td>
                  <td>${orderItm?.discountedRetailPrice} TK</td>
                  <td>${orderItm?.quantity}</td>
                  <td>${orderItm?.totalPrice} TK</td>
                </tr>`
              )}
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Coupon Discount: </b></td>
                  <td>${coupon?.discountAmount ?? 0} TK</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Delivery Charge: </b></td>
                  <td>${order?.deliveryChargeInside ?? 0} TK</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td><b>Subtotal: </b></td>
                  <td><b>${order?.subtotal} TK</b></td>
                </tr>
            </tbody>
          </table>

          <br/><br/>
          <p>Thank you for shopping.</p>
        `
        );

        return res
          .status(200)
          .json(jsonResponse(true, `Order status has been updated`, order));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Order status has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete order
export const deleteOrder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      if (order) {
        return res
          .status(200)
          .json(jsonResponse(true, `Order has been deleted`, order));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Order has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
