const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Controller to handle broker user creation
const createBrokerUser = async (req, res) => {
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
    } = req.body;

    // Create new broker user in the database
    const newUser = await prisma.brokerusers.create({
      data: {
        loginUsrid,
        username,
        password, // Ideally, hash the password before storing
        role,
        marginType,
        segmentAllow,
        intradaySquare,
        ledgerBalanceClose: parseInt(ledgerBalanceClose),
        profitTradeHoldMinSec: parseInt(profitTradeHoldMinSec),
        lossTradeHoldMinSec: parseInt(lossTradeHoldMinSec),
      },
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBrokerUser };
