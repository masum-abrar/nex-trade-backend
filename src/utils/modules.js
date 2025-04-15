//main modules
const user = "user";
const role = "role";
const module = "module";
const roleModule = "role-module";
const category = "category";
const campaign = "campaign";
const product = "product";
const supplier = "supplier";
const order = "order";
const monthlyPayment = "monthly-payment";
const dashboard = "dashboard";
const revenue = "revenue";
const customer = "customer";

//modules postfix
const list = "list";
const userList = "user-list";
const create = "create";
const single = "single";
const edit = "edit";
const ban = "ban";
const remove = "remove";
const total = "total";
const status = "status";

//campaign
export const campaignList = (req, res, next) => {
  res.locals.module_name = `${campaign}-${list}`;
  next();
};

export const campaignUserList = (req, res, next) => {
  res.locals.module_name = `${campaign}-${userList}`;
  next();
};

export const campaignSingle = (req, res, next) => {
  res.locals.module_name = `${campaign}-${single}`;
  next();
};

export const campaignCreate = (req, res, next) => {
  res.locals.module_name = `${campaign}-${create}`;
  next();
};

export const campaignEdit = (req, res, next) => {
  res.locals.module_name = `${campaign}-${edit}`;
  next();
};

export const campaignBan = (req, res, next) => {
  res.locals.module_name = `${campaign}-${ban}`;
  next();
};

export const campaignRemove = (req, res, next) => {
  res.locals.module_name = `${campaign}-${remove}`;
  next();
};

//category
export const categoryList = (req, res, next) => {
  res.locals.module_name = `${category}-${list}`;
  next();
};

export const categoryUserList = (req, res, next) => {
  res.locals.module_name = `${category}-${userList}`;
  next();
};

export const categorySingle = (req, res, next) => {
  res.locals.module_name = `${category}-${single}`;
  next();
};

export const categoryCreate = (req, res, next) => {
  res.locals.module_name = `${category}-${create}`;
  next();
};

export const categoryEdit = (req, res, next) => {
  res.locals.module_name = `${category}-${edit}`;
  next();
};

export const categoryBan = (req, res, next) => {
  res.locals.module_name = `${category}-${ban}`;
  next();
};

export const categoryRemove = (req, res, next) => {
  res.locals.module_name = `${category}-${remove}`;
  next();
};

//product
export const productList = (req, res, next) => {
  res.locals.module_name = `${product}-${list}`;
  next();
};

export const productUserList = (req, res, next) => {
  res.locals.module_name = `${product}-${userList}`;
  next();
};

export const productSingle = (req, res, next) => {
  res.locals.module_name = `${product}-${single}`;
  next();
};

export const productCreate = (req, res, next) => {
  res.locals.module_name = `${product}-${create}`;
  next();
};

export const productEdit = (req, res, next) => {
  res.locals.module_name = `${product}-${edit}`;
  next();
};

export const productBan = (req, res, next) => {
  res.locals.module_name = `${product}-${ban}`;
  next();
};

export const productRemove = (req, res, next) => {
  res.locals.module_name = `${product}-${remove}`;
  next();
};

//order
export const orderList = (req, res, next) => {
  res.locals.module_name = `${order}-${list}`;
  next();
};

export const orderUserList = (req, res, next) => {
  res.locals.module_name = `${order}-${userList}`;
  next();
};

export const orderSingle = (req, res, next) => {
  res.locals.module_name = `${order}-${single}`;
  next();
};

export const orderCreate = (req, res, next) => {
  res.locals.module_name = `${order}-${create}`;
  next();
};

export const orderEdit = (req, res, next) => {
  res.locals.module_name = `${order}-${edit}`;
  next();
};

export const orderBan = (req, res, next) => {
  res.locals.module_name = `${order}-${ban}`;
  next();
};

export const orderRemove = (req, res, next) => {
  res.locals.module_name = `${order}-${remove}`;
  next();
};

//monthly-payment
export const monthlyPaymentList = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${list}`;
  next();
};

export const monthlyPaymentUserList = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${userList}`;
  next();
};

export const monthlyPaymentSingle = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${single}`;
  next();
};

export const monthlyPaymentCreate = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${create}`;
  next();
};

export const monthlyPaymentEdit = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${edit}`;
  next();
};

export const monthlyPaymentBan = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${ban}`;
  next();
};

export const monthlyPaymentRemove = (req, res, next) => {
  res.locals.module_name = `${monthlyPayment}-${remove}`;
  next();
};

//supplier
export const supplierList = (req, res, next) => {
  res.locals.module_name = `${supplier}-${list}`;
  next();
};

export const supplierUserList = (req, res, next) => {
  res.locals.module_name = `${supplier}-${userList}`;
  next();
};

export const supplierSingle = (req, res, next) => {
  res.locals.module_name = `${supplier}-${single}`;
  next();
};

export const supplierCreate = (req, res, next) => {
  res.locals.module_name = `${supplier}-${create}`;
  next();
};

export const supplierEdit = (req, res, next) => {
  res.locals.module_name = `${supplier}-${edit}`;
  next();
};

export const supplierBan = (req, res, next) => {
  res.locals.module_name = `${supplier}-${ban}`;
  next();
};

export const supplierRemove = (req, res, next) => {
  res.locals.module_name = `${supplier}-${remove}`;
  next();
};

//user
export const usersList = (req, res, next) => {
  res.locals.module_name = `${user}-${list}`;
  next();
};

export const usersUserList = (req, res, next) => {
  res.locals.module_name = `${user}-${userList}`;
  next();
};

export const usersSingle = (req, res, next) => {
  res.locals.module_name = `${user}-${single}`;
  next();
};

export const usersCreate = (req, res, next) => {
  res.locals.module_name = `${user}-${create}`;
  next();
};

export const usersEdit = (req, res, next) => {
  res.locals.module_name = `${user}-${edit}`;
  next();
};

export const usersBan = (req, res, next) => {
  res.locals.module_name = `${user}-${ban}`;
  next();
};

export const usersRemove = (req, res, next) => {
  res.locals.module_name = `${user}-${remove}`;
  next();
};

//module
export const moduleList = (req, res, next) => {
  res.locals.module_name = `${module}-${list}`;
  next();
};

export const moduleUserList = (req, res, next) => {
  res.locals.module_name = `${module}-${userList}`;
  next();
};

export const moduleSingle = (req, res, next) => {
  res.locals.module_name = `${module}-${single}`;
  next();
};

export const moduleCreate = (req, res, next) => {
  res.locals.module_name = `${module}-${create}`;
  next();
};

export const moduleEdit = (req, res, next) => {
  res.locals.module_name = `${module}-${edit}`;
  next();
};

export const moduleBan = (req, res, next) => {
  res.locals.module_name = `${module}-${ban}`;
  next();
};

export const moduleRemove = (req, res, next) => {
  res.locals.module_name = `${module}-${remove}`;
  next();
};

//role
export const roleList = (req, res, next) => {
  res.locals.module_name = `${role}-${list}`;
  next();
};

export const roleUserList = (req, res, next) => {
  res.locals.module_name = `${role}-${userList}`;
  next();
};

export const roleSingle = (req, res, next) => {
  res.locals.module_name = `${role}-${single}`;
  next();
};

export const roleCreate = (req, res, next) => {
  res.locals.module_name = `${role}-${create}`;
  next();
};

export const roleEdit = (req, res, next) => {
  res.locals.module_name = `${role}-${edit}`;
  next();
};

export const roleBan = (req, res, next) => {
  res.locals.module_name = `${role}-${ban}`;
  next();
};

export const roleRemove = (req, res, next) => {
  res.locals.module_name = `${role}-${remove}`;
  next();
};

//roleModule
export const roleModuleList = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${list}`;
  next();
};

export const roleModuleUserList = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${userList}`;
  next();
};

export const roleModuleSingle = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${single}`;
  next();
};

export const roleModuleCreate = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${create}`;
  next();
};

export const roleModuleEdit = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${edit}`;
  next();
};

export const roleModuleBan = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${ban}`;
  next();
};

export const roleModuleRemove = (req, res, next) => {
  res.locals.module_name = `${roleModule}-${remove}`;
  next();
};

//dashboard
export const categoryTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${category}-${total}`;
  next();
};

export const campaignTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${campaign}-${total}`;
  next();
};

export const productTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${product}-${total}`;
  next();
};

export const orderTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${order}-${total}`;
  next();
};

export const orderStatusTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${order}-${status}-${total}`;
  next();
};

export const revenueTotal = (req, res, next) => {
  res.locals.module_name = `${dashboard}-${revenue}-${total}`;
  next();
};

export const customerModule = (req, res, next) => {
  res.locals.module_name = `${customer}`;
  next();
};
