import "../config/env.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error("Usage: npm run seed:admin -w server -- \"Admin Name\" admin@example.com password123");
  process.exit(1);
}

if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    existingUser.name = name;
    existingUser.password = password;
    existingUser.role = "admin";
    await existingUser.save();
    console.log(`Updated admin account: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password,
      role: "admin"
    });
    console.log(`Created admin account: ${email}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
