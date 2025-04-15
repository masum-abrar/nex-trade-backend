import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

let roles = [];
let modules = [];
let users = [];
let categories = [];
let campaigns = [];
let suppliers = [];
let products = [];
let productAttributes = [];
let productImages = [];

async function main() {
  // create roles
  const roleData = [
    {
      name: "super-admin",
      price: 0,
    },
    {
      name: "admin",
      price: 0,
    },
    {
      name: "manager",
      price: 0,
    },
    {
      name: "basic",
      price: 20000,
    },
    {
      name: "standard",
      price: 35000,
    },
    {
      name: "premium",
      price: 50000,
    },
    {
      name: "customer",
      price: 0,
    },
  ];

  for (let data of roleData) {
    const rolesData = await prisma.role.create({
      data,
    });

    roles.push(rolesData);
  }

  // create modules
  const moduleData = [
    {
      name: "role-create",
    },
    {
      name: "role-list",
    },
    {
      name: "role-user-list",
    },
    {
      name: "role-single",
    },
    {
      name: "role-edit",
    },
    {
      name: "role-remove",
    },
    {
      name: "module-create",
    },
    {
      name: "module-list",
    },
    {
      name: "module-user-list",
    },
    {
      name: "module-single",
    },
    {
      name: "module-edit",
    },
    {
      name: "module-remove",
    },
    {
      name: "user-create",
    },
    {
      name: "user-list",
    },
    {
      name: "user-user-list",
    },
    {
      name: "user-single",
    },
    {
      name: "user-edit",
    },
    {
      name: "user-ban",
    },
    {
      name: "user-remove",
    },
    {
      name: "monthly-payment-create",
    },
    {
      name: "monthly-payment-list",
    },
    {
      name: "monthly-payment-user-list",
    },
    {
      name: "monthly-payment-single",
    },
    {
      name: "monthly-payment-edit",
    },
    {
      name: "monthly-payment-remove",
    },
    {
      name: "category-create",
    },
    {
      name: "category-list",
    },
    {
      name: "category-user-list",
    },
    {
      name: "category-single",
    },
    {
      name: "category-edit",
    },
    {
      name: "category-ban",
    },
    {
      name: "category-remove",
    },
    {
      name: "campaign-create",
    },
    {
      name: "campaign-list",
    },
    {
      name: "campaign-user-list",
    },
    {
      name: "campaign-single",
    },
    {
      name: "campaign-edit",
    },
    {
      name: "campaign-ban",
    },
    {
      name: "campaign-remove",
    },
    {
      name: "product-create",
    },
    {
      name: "product-list",
    },
    {
      name: "product-user-list",
    },
    {
      name: "product-single",
    },
    {
      name: "product-edit",
    },
    {
      name: "product-ban",
    },
    {
      name: "product-remove",
    },
    {
      name: "supplier-create",
    },
    {
      name: "supplier-list",
    },
    {
      name: "supplier-user-list",
    },
    {
      name: "supplier-single",
    },
    {
      name: "supplier-edit",
    },
    {
      name: "supplier-ban",
    },
    {
      name: "supplier-remove",
    },
    {
      name: "order-create",
    },
    {
      name: "dashboard-campaign-total",
    },
    {
      name: "dashboard-category-total",
    },
    {
      name: "dashboard-product-total",
    },
    {
      name: "dashboard-order-total",
    },
    {
      name: "dashboard-order-status-total",
    },
    {
      name: "dashboard-revenue-total",
    },
    {
      name: "customer",
    },
  ];

  for (let data of moduleData) {
    const modulesData = await prisma.module.create({
      data,
    });

    modules.push(modulesData);
  }

  // create user
  const userData = [
    {
      roleId: roles[0].id,
      name: "Deepta Barua",
      email: "deepta.barua@northsouth.edu",
      phone: "01775172680",
      address: "Dhaka",
      billingAddress: "Dhaka",
      city: "Dhaka",
      country: "Bangladesh",
      image: "https://cdn-icons-png.flaticon.com/512/9368/9368192.png",
    },
    {
      roleId: roles[0].id,
      name: "Voltech",
      email: "voltech@gmail.com",
      phone: "01987263542",
      address: "Dhaka",
      billingAddress: "Dhaka",
      city: "Dhaka",
      country: "Bangladesh",
      image: "https://cdn-icons-png.flaticon.com/512/9368/9368192.png",
    },
    {
      roleId: roles[0].id,
      name: "Shamim Rahman",
      email: "shamimrahman920@gmail.com",
      phone: "01827364523",
      address: "Dhaka",
      billingAddress: "Dhaka",
      city: "Dhaka",
      country: "Bangladesh",
      image: "https://cdn-icons-png.flaticon.com/512/9368/9368192.png",
    },
    {
      roleId: roles[2].id,
      name: "Manager1",
      email: "manager1@gmail.com",
      phone: "01875172681",
      address: "Dhaka",
      billingAddress: "Dhaka",
      city: "Dhaka",
      country: "Bangladesh",
      image: "https://cdn-icons-png.flaticon.com/512/9368/9368192.png",
    },
    {
      roleId: roles[6].id,
      name: "Customer 1",
      email: "damlip195@ichigo.me",
      phone: "01875172682",
      address: "Dhaka",
      billingAddress: "Dhaka",
      city: "Dhaka",
      country: "Bangladesh",
      image: "https://cdn-icons-png.flaticon.com/512/9368/9368192.png",
    },
  ];

  for (let data of userData) {
    const usersData = await prisma.user.create({
      data,
    });

    users.push(usersData);
  }

  // create RoleModule
  let roleModuleData = [];

  for (var i = 0; i < modules.length; i++) {
    roleModuleData.push({ roleId: roles[0].id, moduleId: modules[i].id });
  }

  for (let data of roleModuleData) {
    await prisma.roleModule.create({
      data,
    });
  }

  // create payment
  // const paymentData = [
  //   {
  //     userId: users[0].id,
  //     amount: 0.0,
  //     date: "2023-03-20T19:51:15.581Z",
  //   },
  //   {
  //     userId: users[1].id,
  //     amount: 0.0,
  //     date: "2023-04-19T19:51:15.581Z",
  //   },
  // ];

  // for (let data of paymentData) {
  //   await prisma.payment.create({
  //     data,
  //   });
  // }

  // create category
  // const categoryData = [
  //   {
  //     userId: users[0].id,
  //     name: "Jamdani Sharee",
  //     image: "jamdani.png",
  //     slug: "deepta-barua-jamdani-sharee",
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Silk Sharee",
  //     image: "silk.png",
  //     slug: "rafi-hasnain-silk-sharee",
  //     createdBy: users[1].id,
  //   },
  //   {
  //     userId: users[0].id,
  //     name: "Men's Shirt",
  //     image: "shirt.png",
  //     slug: "deepta-barua-men's-shirt",
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Women's Tops",
  //     image: "top.png",
  //     slug: "rafi-hasnain-women's-top",
  //     createdBy: users[1].id,
  //   },
  // ];

  // for (let data of categoryData) {
  //   const categoriesData = await prisma.category.create({
  //     data,
  //   });
  //   categories.push(categoriesData);
  // }

  // create campaign
  // const campaignData = [
  //   {
  //     userId: users[0].id,
  //     name: "Eid offer",
  //     image: "jamdani.png",
  //     slug: "deepta-barua-eid-offer",
  //     date: "2023-03-20T19:51:15.581Z",
  //     categoryId: categories[0].id,
  //     viewCount: 50,
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[0].id,
  //     name: "Eid offer(new)",
  //     image: "jamdani.png",
  //     slug: "deepta-barua-eid-offer-new",
  //     date: "2023-04-20T19:51:15.581Z",
  //     categoryId: categories[0].id,
  //     viewCount: 50,
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Ramadan offer",
  //     image: "silk.png",
  //     slug: "rafi-hasnain-ramadan-offer",
  //     date: "2023-03-20T19:51:15.581Z",
  //     categoryId: categories[1].id,
  //     viewCount: 100,
  //     createdBy: users[1].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Ramadan offer(new)",
  //     image: "silk.png",
  //     slug: "rafi-hasnain-ramadan-offer-new",
  //     date: "2023-05-20T19:51:15.581Z",
  //     categoryId: categories[1].id,
  //     viewCount: 100,
  //     createdBy: users[1].id,
  //   },
  //   {
  //     userId: users[0].id,
  //     name: "Boishakh Offer",
  //     image: "shirt.png",
  //     slug: "deepta-barua-boishakh-offer",
  //     date: "2023-03-20T19:51:15.581Z",
  //     categoryId: categories[2].id,
  //     viewCount: 20,
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Flat sale",
  //     image: "top.png",
  //     slug: "rafi-hasnain-flat-sale",
  //     date: "2023-03-20T19:51:15.581Z",
  //     categoryId: categories[3].id,
  //     viewCount: 200,
  //     createdBy: users[1].id,
  //   },
  // ];

  // for (let data of campaignData) {
  //   const campaignsData = await prisma.campaign.create({
  //     data,
  //   });

  //   campaigns.push(campaignsData);
  // }

  // create supplier
  // const supplierData = [
  //   {
  //     userId: users[0].id,
  //     name: "Korim",
  //     address: "Mirpur-1",
  //     phone: "01937353053",
  //     email: "korim@gmail.com",
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[0].id,
  //     name: "Rorim",
  //     address: "Mirpur-2",
  //     phone: "01937353054",
  //     email: "Rorim@gmail.com",
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     name: "Joshim",
  //     address: "Mirpur-10",
  //     phone: "01937353055",
  //     email: "joshim@gmail.com",
  //     createdBy: users[1].id,
  //   },
  // ];

  // for (let data of supplierData) {
  //   const suppliersData = await prisma.supplier.create({
  //     data,
  //   });

  //   suppliers.push(suppliersData);
  // }

  // create product
  // const productData = [
  //   {
  //     userId: users[0].id,
  //     categoryId: categories[0].id,
  //     campaignId: campaigns[0].id,
  //     supplierId: suppliers[0].id,
  //     productCode: "9B2P18",
  //     name: "Red Jamdani Sharee",
  //     shortDescription: "Red Jamdani",
  //     slug: "deepta-barua-red-jamdani-sharee",
  //     createdBy: users[0].id,
  //   },
  //   {
  //     userId: users[1].id,
  //     categoryId: categories[3].id,
  //     campaignId: campaigns[1].id,
  //     supplierId: suppliers[1].id,
  //     productCode: "3A2R1C",
  //     name: "Red Tops",
  //     shortDescription: "Red Tops",
  //     slug: "rafi-hasnain-red-tops",
  //     createdBy: users[1].id,
  //   },
  //   {
  //     userId: users[0].id,
  //     categoryId: categories[0].id,
  //     campaignId: campaigns[0].id,
  //     supplierId: suppliers[0].id,
  //     productCode: "9B2P18",
  //     name: "Red Silk Sharee",
  //     shortDescription: "Red Silk",
  //     slug: "deepta-barua-red-silk-sharee",
  //     createdBy: users[0].id,
  //   },
  // ];

  // for (let data of productData) {
  //   const productsData = await prisma.product.create({
  //     data,
  //   });
  //   products.push(productsData);
  // }

  // create product attributes
  // const productAttributeData = [
  //   {
  //     productId: products[0].id,
  //     size: "Regular",
  //     costPrice: 600.0,
  //     retailPrice: 800.0,
  //     discountPercent: 10.0,
  //     discountPrice: 80,
  //     discountedRetailPrice: 720,
  //     stockAmount: 200.0,
  //   },
  //   {
  //     productId: products[0].id,
  //     size: "Large",
  //     costPrice: 700.0,
  //     retailPrice: 1000.0,
  //     discountPercent: 0,
  //     discountPrice: 0,
  //     discountedRetailPrice: 1000.0,
  //     stockAmount: 400.0,
  //   },
  //   {
  //     productId: products[1].id,
  //     size: "Small",
  //     costPrice: 300.0,
  //     retailPrice: 350.0,
  //     discountPercent: 0,
  //     discountPrice: 0,
  //     discountedRetailPrice: 350.0,
  //     stockAmount: 320.0,
  //   },
  //   {
  //     productId: products[1].id,
  //     size: "Medium",
  //     costPrice: 420.0,
  //     retailPrice: 485.0,
  //     discountPercent: 0,
  //     discountPrice: 0,
  //     discountedRetailPrice: 485.0,
  //     stockAmount: 109.0,
  //   },
  //   {
  //     productId: products[1].id,
  //     size: "Large",
  //     costPrice: 525.0,
  //     retailPrice: 625.0,
  //     discountPercent: 0,
  //     discountPrice: 0,
  //     discountedRetailPrice: 625.0,
  //     stockAmount: 900.0,
  //   },
  // ];

  // for (let data of productAttributeData) {
  //   const productAttributesData = await prisma.productAttribute.create({
  //     data,
  //   });
  //   productAttributes.push(productAttributesData);
  // }

  // create product images
  // const productImageData = [
  //   {
  //     productId: products[0].id,
  //     image: "jamdanisharee.jpg",
  //   },
  //   {
  //     productId: products[0].id,
  //     image: "jamdanisharee1.jpg",
  //   },
  //   {
  //     productId: products[1].id,
  //     image: "tops.jpg",
  //   },
  //   {
  //     productId: products[1].id,
  //     image: "tops1.jpg",
  //   },
  // ];

  // for (let data of productImageData) {
  //   const productImagesData = await prisma.productImage.create({
  //     data,
  //   });
  //   productImages.push(productImagesData);
  // }
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
