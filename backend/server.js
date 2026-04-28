const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, disability } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      disability,
    });

    await newUser.save();

    res.send("User saved securely");
  } catch (err) {
    res.send("Error saving user");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, "secretkey123");

    res.json({ token });
  } catch (err) {
    res.send("Error logging in");
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.send("Access denied. No token.");
  }

  try {
    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, "secretkey123");

    req.user = verified;
    next();
  } catch (err) {
    res.send("Invalid token");
  }
};

app.get("/profile", authMiddleware, (req, res) => {
  res.send("This is protected profile data 🔐");
});

mongoose
  .connect("mongodb+srv://9836shreeyanka_db_user:<db_password>@cluster0.vlcjhjl.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));
