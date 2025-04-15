const hasModuleAccess = (req, res, module_name) => {
  //check if user has module access
  if (req.user && req.user.moduleNames.includes(module_name) === false)
    return res.status(409).json({
      success: false,
      message: "You do not have permission to access this module",
      data: null,
    });
};

export default hasModuleAccess;
