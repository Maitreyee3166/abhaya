require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const db = require("./app/config/db");
// db();
const User = require("./app/models/user");
const Role = require("./app/models/role");
const logger = require('./app/utils/logger');

async function seed() {
  try {

    // Wait for database connection
    await db();
    console.log("Database connected");

    let AdminRole = await Role.findOne({ roleName: "admin" });
    if (!AdminRole) {
      AdminRole = await Role.create({ roleName: "admin" });
    }

    let UserRole = await Role.findOne({ roleName: "user" });
    if (!UserRole) {
      UserRole = await Role.create({ roleName: "user" });
    }

    let ParentRole = await Role.findOne({ roleName: "parent" });
    if (!ParentRole) {
      ParentRole = await Role.create({ roleName: "parent" });
    }

    let PoliceRole = await Role.findOne({ roleName: "police" });
    if (!PoliceRole) {
      PoliceRole = await Role.create({ roleName: "police" });
    }

    const isExist = await User.findOne({ email: "admin@gmail.com" });

    if (!isExist) {
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash("Admin@123", salt);
      await User.create({
        fullName: "Admin",
        email: "admin@gmail.com",
        phone: 9876543209,
        password: hashPass,
        dob: new Date("1995-01-01"),
        gender: "female",
        image: "https://res.cloudinary.com/dkkvythr1/image/upload/v1786310286/woman_safety/photo1_1786310283403.jpg",
        cloudinaryId: "woman_safety/photo1_1786310283403",
        roleId: AdminRole._id,
        district: "East Medinipur",
        city: "Tamluk",
        location: {
          type: "Point",
          coordinates: [87.9255933, 22.2896984]
        },
        refreshToken: "",
        isVerified: false,
        status: "Active",
        isDelete: false
      });
    }

    logger.info("seeding completed!");

  } catch (error) {

    logger.error("Seeding error:", error);

  }
}

seed();
