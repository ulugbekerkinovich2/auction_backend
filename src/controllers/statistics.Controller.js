// controllers/userStatisticsController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { startOfDay, endOfDay } = require("date-fns");

const getUserRegistrationStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(0); // Default to epoch if no startDate
    const end = endDate ? new Date(endDate) : new Date(); // Default to now if no endDate

    const userRegistrations = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform the data to return count per day
    const registrationCountPerDay = userRegistrations.map((record) => {
      return {
        date: record.createdAt.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        count: record._count.id,
      };
    });

    res.json(registrationCountPerDay);
  } catch (error) {
    console.error("Error fetching user registration statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUserRegistrationStatistics,
};
