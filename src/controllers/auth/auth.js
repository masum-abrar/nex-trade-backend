import bcrypt from 'bcryptjs'
import sendEmail from '../../utils/emailService.js'
import jsonResponse from '../../utils/jsonResponse.js'
import jwtSign from '../../utils/jwtSign.js'
import prisma from '../../utils/prismaClient.js'
import validateInput from '../../utils/validateInput.js'

const module_name = 'auth'

//register
export const register = async (req, res) => {
  try {
    return await prisma.$transaction(async tx => {
      //Check user if exists
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: req.body.email }, { phone: req.body.phone }],
          isDeleted: false
        }
      })

      if (user) {
        return res
          .status(409)
          .json(jsonResponse(false, 'User already exists', null))
      }

      //Create a new user and Hash the password
      // const hashedPassword = hashPassword(req.body.password);

      const {
        roleId,
        parentId,
        name,
        email,
        phone,
        address,
        billingAddress,
        country,
        city,
        postalCode,
        image,
        // password,
        otp,
        otpCount,
        initialPaymentAmount,
        initialPaymentDue,
        installmentTime
      } = req.body

      console.log(req.body)

      //validate input
      const inputValidation = validateInput(
        [name, email, phone, address, billingAddress, country, city],
        [
          'Name',
          'Email',
          'Phone',
          'Shipping Address',
          'Billing Address',
          'Country',
          'City'
        ]
      )

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null))
      }

      //create user
      const createUser = await tx.user.create({
        data: {
          roleId,
          parentId,
          name,
          email,
          phone,
          address,
          billingAddress,
          country,
          city,
          postalCode,
          image: 'https://cdn-icons-png.flaticon.com/512/9368/9368192.png',
          // password: hashedPassword,
          otp,
          otpCount,
          initialPaymentAmount,
          initialPaymentDue,
          installmentTime,
          createdBy: req?.user?.id
        }
      })

      console.log({ createUser })

      if (createUser) {
        return res
          .status(200)
          .json(jsonResponse(true, 'User has been created', createUser))
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json(jsonResponse(false, error, null))
  }
}

//login with password
export const login = async (req, res) => {
  try {
    return await prisma.$transaction(async tx => {
      //login with phone or email
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: req.body.email }, { phone: req.body.phone }],
          isDeleted: false
        }
      })

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, 'Wrong credentials', null))

      if (user.isActive === false) {
        return res
          .status(401)
          .json(jsonResponse(false, 'You are not authenticated!', null))
      }

      //match password
      const checkPassword = bcrypt.compareSync(req.body.password, user.password)

      if (!checkPassword)
        return res.status(404).json(jsonResponse(false, 'Wrong password', null))

      //get modules for logged in user
      const roleModuleList = await tx.roleModule.findMany({
        where: { roleId: user.roleId ?? undefined, isDeleted: false },
        include: { module: true }
      })

      const roleModuleList_length = roleModuleList.length

      const module_names = []

      for (let i = 0; i < roleModuleList_length; i++) {
        module_names.push(roleModuleList[i].module.name)
      }

      const roleName = await tx.role.findFirst({
        where: { id: user.roleId, isDeleted: false }
      })

      const token = jwtSign({
        id: user.id,
        parentId: user.parentId ? user.parentId : user.id,
        phone: user.phone,
        email: user.email,
        roleId: user.roleId,
        roleName: roleName.name,
        isActive: user.isActive,
        moduleNames: module_names
      })

      const { password, otp, otpCount, ...others } = user

      res
        .cookie('accessToken', token, {
          httpOnly: true
        })
        .status(200)
        .json(
          jsonResponse(true, 'Logged In', { ...others, accessToken: token })
        )
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json(jsonResponse(false, error, null))
  }
}

//send login otp to mail
export const sendLoginOtp = async (req, res) => {
  try {
    return await prisma.$transaction(async tx => {
      //login with phone or email
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: req.body.email }, { phone: req.body.phone }],
          isDeleted: false,
          isActive: true
        }
      })

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, 'You are not registered', null))

      if (user.isActive === false) {
        return res
          .status(401)
          .json(jsonResponse(false, 'You are not authenticated!', null))
      }

      if (req.body.type === 'admin' && user?.roleId === null) {
        return res
          .status(401)
          .json(jsonResponse(false, 'You are not permitted!', null))
      }

      //update user otp
      const sixDigitOtp = Math.floor(100000 + Math.random() * 900000)
      let updateOtp

      if (!user?.otp) {
        updateOtp = await prisma.user.update({
          where: { id: user.id },
          data: {
            otp: sixDigitOtp,
            otpCount: user.otpCount + 1
          }
        })

        if (!updateOtp)
          return res
            .status(404)
            .json(jsonResponse(false, 'Something went wrong. Try again.', null))
      }

      // console.log(user.email);

      if (!user.email || user.email.trim() === '') {
        res
          .status(400)
          .json(jsonResponse(false, 'Email is not registered', null))
      }

      // await sendEmail(
      //   "user.email@email.com",
      //   "Ecommerce OTP",
      //   `<p>Your otp is ${updateOtp?.otp}</p>`
      // );

      // if (!updateOtp?.otp) {
      const emailGenerate = await sendEmail(
        updateOtp?.email ?? user.email,
        'Voltech OTP',
        `<p>Your otp is ${updateOtp?.otp ?? user?.otp}</p>`
      )
      // }

      // console.log({ emailGenerate });

      // if (emailGenerate) {
      res.status(200).json(jsonResponse(true, 'Otp is sent to your mail', null))
      // }

      // if (user.email && user.email.trim() !== "") {
      //   const promise1 = new Promise((resolve, reject) => {
      //     resolve(
      //       sendEmail(
      //         user.email,
      //         "Ecommerce OTP",
      //         `<p>Your otp is ${sixDigitOtp}</p>`
      //       )
      //     );
      //   });
      //   // const send_email = sendEmail(
      //   //   user.email,
      //   //   "Ecommerce OTP",
      //   //   `<p>Your otp is ${sixDigitOtp}</p>`
      //   // );

      //   promise1
      //     .then(() => {
      //       res
      //         .status(200)
      //         .json(jsonResponse(true, "Otp is sent to your mail", null));
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     });
      // }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json(jsonResponse(false, error, null))
  }
}

//login with otp
export const loginWithOtp = async (req, res) => {
  try {
    return await prisma.$transaction(async tx => {
      //login with otp
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: req.body.email }, { phone: req.body.phone }],
          isDeleted: false,
          isActive: true
        }
      })

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, 'You are not registered', null))

      if (user.isActive === false) {
        return res
          .status(401)
          .json(jsonResponse(false, 'You are not authenticated!', null))
      }

      //match user otp and login
      if (user.otp !== null && user.otp !== '') {
        if (user.otp === req.body.otp) {
          const updateOtp = await prisma.user.update({
            where: { id: user.id },
            data: {
              otp: null
            }
          })

          if (!updateOtp)
            return res
              .status(500)
              .json(
                jsonResponse(false, 'Something went wrong. Try again.', null)
              )

          //get modules for logged in user
          let roleModuleList = []
          roleModuleList = user?.roleId
            ? await tx.roleModule.findMany({
                where: { roleId: user.roleId, isDeleted: false },
                include: { module: true }
              })
            : []

          const roleModuleList_length = roleModuleList.length

          const roleName = user?.roleId
            ? await tx.role.findFirst({
                where: { id: user.roleId, isDeleted: false }
              })
            : { name: 'customer' }

          const module_names = []

          for (let i = 0; i < roleModuleList_length; i++) {
            module_names.push(roleModuleList[i]?.module?.name)
          }

          const token = jwtSign({
            id: user.id,
            parentId: user.parentId ? user.parentId : user.id,
            phone: user.phone,
            email: user.email,
            roleId: user.roleId,
            roleName: roleName.name,
            isActive: user.isActive,
            moduleNames: module_names
          })

          const { password, otp, otpCount, ...others } = user

          res
            .cookie('accessToken', token, {
              httpOnly: true
            })
            .status(200)
            .json(
              jsonResponse(true, 'Logged In', { ...others, accessToken: token })
            )
        } else {
          return res.status(400).json(jsonResponse(false, 'Wrong OTP', null))
        }
      } else {
        return res
          .status(400)
          .json(jsonResponse(false, "You didn't receive any OTP yet", null))
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json(jsonResponse(false, error, null))
  }
}

//logout
export const logout = (req, res) => {
  res
    .clearCookie('accessToken', {
      secure: true,
      sameSite: 'none'
    })
    .status(200)
    .json(jsonResponse(true, 'Logged out', null))
}
export const createBrokerUser = async (req, res) => {
  try {
    const {
      loginUsrid,
      username,
      password,
      role,
      marginType,
      segmentAllow,
      intradaySquare,
      ledgerBalanceClose,
      profitTradeHoldMinSec,
      lossTradeHoldMinSec,
      mcx_maxExchLots,
      mcx_commissionType,
      mcx_commission,
      mcx_maxLots,
      mcx_orderLots,
      mcx_limitPercentage,
      mcx_intraday,
      mcx_holding,
      mcxOPTBUY_commissionType,
      mcxOPTBUY_commission,
      mcxOPTBUY_strike,
      mcxOPTBUY_allow,
      mcxOPTSELL_commissionType,
      mcxOPTSELL_commission,
      mcxOPTSELL_strike,
      mcxOPTSELL_allow,

      // New fields for MCX options
      mcxOPT_maxLots, // Added Max Lots field
      mcxOPT_orderLots, // Added Order Lots field
      mcxOPT_limitPercentage, // Added Limit Percentage field
      mcxOPT_intraday, // Added Intraday field
      mcxOPT_holding, // Added Holding field
      mcxOPT_sellingOvernight, // Added Selling Overnight field

      // New fields for NSE and IDXNSE
      nse_maxExchLots, // Added NSE Max Exch Lots field
      idxNSE_commissionType, // Added IDXNSE CommissionType field
      idxNSE_commission, // Added IDXNSE Commission field
      idxNSE_maxLots, // Added IDXNSE Max Lots field
      idxNSE_orderLots, // Added IDXNSE Order Lots field
      idxNSE_limitPercentage, // Added IDXNSE Limit Percentage field
      idxNSE_intraday, // Added IDXNSE Intraday field
      idxNSE_holding, // Added IDXNSE Holding field

      // New fields for IDXOPTBUY
      idxOPTBUY_commissionType, // Added CommissionType field for IDXOPTBUY
      idxOPTBUY_commission, // Added Commission field for IDXOPTBUY
      idxOPTBUY_strike, // Added Strike field for IDXOPTBUY
      idxOPTBUY_allow, // Added Allow field for IDXOPTBUY

      // New fields for IDXOPTSELL
      idxOPTSELL_commissionType, // Added CommissionType field for IDXOPTSELL
      idxOPTSELL_commission, // Added Commission field for IDXOPTSELL
      idxOPTSELL_strike, // Added Strike field for IDXOPTSELL
      idxOPTSELL_allow, // Added Allow field for IDXOPTSELL

      // New fields for IDXOPT
      idxOPT_maxLots, // Added Max Lots field for IDXOPT
      idxOPT_orderLots, // Added Order Lots field for IDXOPT
      idxOPT_expiryLossHold, // Added Expiry Loss Hold field for IDXOPT
      idxOPT_expiryProfitHold, // Added Expiry Profit Hold field for IDXOPT
      idxOPT_expiryIntradayMargin, // Added Expiry Intraday Margin for IDXOPT
      idxOPT_limitPercentage, // Added Limit Percentage field for IDXOPT
      idxOPT_intraday, // Added Intraday field for IDXOPT
      idxOPT_holding, // Added Holding field for IDXOPT
      idxOPT_sellingOvernight, // Added Selling Overnight field for IDXOPT

      // New fields for STKOPTBUY
      stkOPTBUY_commissionType, // Added CommissionType field for STKOPTBUY
      stkOPTBUY_commission, // Added Commission field for STKOPTBUY
      stkOPTBUY_strike, // Added Strike field for STKOPTBUY
      stkOPTBUY_allow,

      STKOPTSELL_commissionType,
      STKOPTSELL_commission,
      STKOPTSELL_strike,
      STKOPTSELL_allow,

      //Added for STKOP

      STKOPT_maxLots,
      STKOPT_orderLots,
      STKOPT_limitPercentage,
      STKOPT_intraday,
      STKOPT_holding,
      STKOPT_sellingOvernight // Added Allow field for STKOPTBUY
    } = req.body

    const newUser = await prisma.brokerusers.create({
      data: {
        loginUsrid,
        username,
        password,
        role,
        marginType,
        segmentAllow,
        intradaySquare,
        ledgerBalanceClose,
        profitTradeHoldMinSec,
        lossTradeHoldMinSec,
        mcx_maxExchLots,
        mcx_commissionType,
        mcx_commission,
        mcx_maxLots,
        mcx_orderLots,
        mcx_limitPercentage,
        mcx_intraday,
        mcx_holding,
        mcxOPTBUY_commissionType,
        mcxOPTBUY_commission,
        mcxOPTBUY_strike,
        mcxOPTBUY_allow,
        mcxOPTSELL_commissionType,
        mcxOPTSELL_commission,
        mcxOPTSELL_strike,
        mcxOPTSELL_allow,

        // New fields for MCX options
        mcxOPT_maxLots,
        mcxOPT_orderLots,
        mcxOPT_limitPercentage,
        mcxOPT_intraday,
        mcxOPT_holding,
        mcxOPT_sellingOvernight,

        // New fields for NSE and IDXNSE
        nse_maxExchLots,
        idxNSE_commissionType,
        idxNSE_commission,
        idxNSE_maxLots,
        idxNSE_orderLots,
        idxNSE_limitPercentage,
        idxNSE_intraday,
        idxNSE_holding,

        // New fields for IDXOPTBUY
        idxOPTBUY_commissionType,
        idxOPTBUY_commission,
        idxOPTBUY_strike,
        idxOPTBUY_allow,

        // New fields for IDXOPTSELL
        idxOPTSELL_commissionType,
        idxOPTSELL_commission,
        idxOPTSELL_strike,
        idxOPTSELL_allow,

        // New fields for IDXOPT
        idxOPT_maxLots,
        idxOPT_orderLots,
        idxOPT_expiryLossHold,
        idxOPT_expiryProfitHold,
        idxOPT_expiryIntradayMargin,
        idxOPT_limitPercentage,
        idxOPT_intraday,
        idxOPT_holding,
        idxOPT_sellingOvernight,

        // New fields for STKOPTBUY
        stkOPTBUY_commissionType,
        stkOPTBUY_commission,
        stkOPTBUY_strike,
        stkOPTBUY_allow,

        STKOPTSELL_commissionType,
        STKOPTSELL_commission,
        STKOPTSELL_strike,
        STKOPTSELL_allow,

        //Added for STKOP

        STKOPT_maxLots,
        STKOPT_orderLots,
        STKOPT_limitPercentage,
        STKOPT_intraday,
        STKOPT_holding,
        STKOPT_sellingOvernight
      }
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error })
  }
}

export const placeOrder = async (req, res) => {
  try {
    const {
      scriptName,
      ltp,
      bidPrice,
      askPrice,
      ltq,
      orderType,
      lotSize,
      orderLots,
      quantity,
      priceType,
      isStopLossTarget,
      stopLoss,
      target,
      margin,
      carry,
      marginLimit,
      userId
    } = req.body

    const newOrder = await prisma.TradeOrder.create({
      data: {
        scriptName,
        ltp: parseFloat(ltp),
        bidPrice: parseFloat(bidPrice),
        askPrice: parseFloat(askPrice),
        ltq: parseFloat(ltq),
        orderType,
        lotSize: parseInt(lotSize),
        orderLots: parseInt(orderLots),
        quantity: parseInt(quantity),
        priceType,
        isStopLossTarget,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        target: target ? parseFloat(target) : null,
        margin: parseFloat(margin),
        carry: parseFloat(carry),
        marginLimit: parseFloat(marginLimit),
        userId
      }
    })

    return res.status(201).json({ success: true, order: newOrder })
  } catch (error) {
    console.error('Order placement error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}

export const getExecutedOrders = async (req, res) => {
  try {
    const executedOrders = await prisma.TradeOrder.findMany({
      where: {},
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ success: true, orders: executedOrders })
  } catch (error) {
    console.error('Error fetching executed orders:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}

// Delete an Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    // Check if order exists
    const existingOrder = await prisma.tradeOrder.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' })
    }

    // Delete order
    await prisma.tradeOrder.delete({
      where: { id }
    })

    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Delete Error:', error)
    res.status(500).json({ success: false, message: 'Error deleting order' })
  }
}

export const loginBrokerUser = async (req, res) => {
  const { userId, password , username } = req.body;
  console.log(req.body);
  
  try {
    // Check for user in the database
    const user = await prisma.brokerusers.findFirst({
      where: { loginUsrid: userId } // Assuming loginUsrid is unique
    });

    // If user is not found, send response and exit
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Send username along with other details
    return res.status(200).json({
      message: 'Login successful',
      role: user.role,  // Send user role
      userId: user.loginUsrid, // Send userId
      username: user.username // ✅ Include username
    });
  } catch (error) {
    console.error('Login error:', error);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  res.status(500).json({ error: 'Something went wrong' });
};

export const createDeposit = async (req, res) => {
  try {
    const { depositAmount, loginUserId, depositType } = req.body;
    const depositImage = req.file ? req.file.path : null; // Save path or URL if needed

    // Save deposit data to the database
    const deposit = await prisma.deposit.create({
       data: {
          depositAmount: parseFloat(depositAmount), // Convert depositAmount to a float
          depositImage, // Store the image path (or null if no image)
          loginUserId, // Include the user ID from the frontend
          depositType, // Static Deposit value
        },
    });

    res.status(201).json({
      message: 'Deposit created successfully',
      deposit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the deposit' });
  }
};

export const getDeposits = async (req, res) => {
  try {
    const deposits = await prisma.Deposit.findMany();
    res.json(deposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};