const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const User = require("./models/User");
const Message = require("./models/message");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://together-able.vercel.app",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Add this near the top, after imports
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here"; // use env variable in production
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000;

// ================= MIDDLEWARE =================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`, {
    origin: req.headers.origin,
  });
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("CORS blocked origin")) {
    console.error("CORS ERROR:", err.message);
    return res.status(403).json({ success: false, message: err.message });
  }

  if (err instanceof SyntaxError && "body" in err) {
    console.error("REQUEST JSON PARSE ERROR:", err.message);
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  }

  next(err);
});

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined socket room`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ================= MONGODB =================
if (!MONGO_URI) {
  console.error("MongoDB connection error: MONGO_URI environment variable is missing");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP REQUEST RECEIVED");
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      email,
      password,
    });

    // Save user
    await newUser.save();

    console.log("USER SAVED SUCCESSFULLY");

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN REQUEST RECEIVED");
    console.log("LOGIN REQUEST:", {
      hasBody: Boolean(req.body),
      bodyKeys: req.body && typeof req.body === "object" ? Object.keys(req.body) : [],
    });

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ success: false, message: "Invalid request body" });
    }

    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const plainPassword = String(password || "");

    if (!normalizedEmail || !plainPassword) {
      console.log("LOGIN VALIDATION FAILED:", {
        hasEmail: Boolean(normalizedEmail),
        hasPassword: Boolean(plainPassword),
      });

      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    console.log("LOGIN EMAIL:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("LOGIN USER NOT FOUND:", normalizedEmail);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.password || typeof user.password !== "string") {
      console.error("LOGIN PASSWORD HASH MISSING:", {
        userId: user._id,
        email: normalizedEmail,
      });

      return res.status(500).json({
        success: false,
        message: "User password is not configured correctly",
      });
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      console.log("LOGIN INVALID PASSWORD:", normalizedEmail);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Sign a token instead of sending the raw user object
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("LOGIN SUCCESS:", {
      userId: user._id,
      email: normalizedEmail,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
});

// ================= GET USERS =================
app.get("/users", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { _id: { $ne: userId } } : {};

    // TODO: Reintroduce match-based filtering later.
    const users = await User.find(filter)
      .select("_id name email")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    console.log("GET USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// ================= SEND MESSAGE =================
app.post(["/send-message", "/messages"], async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const trimmedText = String(text || "").trim();

    if (!senderId || !receiverId || !trimmedText) {
      return res.status(400).json({ error: "senderId, receiverId, and text are required" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text: trimmedText,
    });

    await message.save();

    io.to(receiverId).emit("receiveMessage", message);
    io.to(senderId).emit("receiveMessage", message);

    res.json(message);
  } catch (err) {
    console.log("SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});


// ================= GET MESSAGES =================
app.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.log("GET MESSAGES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ================= GET CONVERSATIONS =================
app.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "_id name email")
      .populate("receiver", "_id name email");

    const conversationMap = new Map();

    messages.forEach((message) => {
      const sender = message.sender;
      const receiver = message.receiver;
      const otherUser =
        String(sender._id) === userId ? receiver : sender;

      if (!conversationMap.has(String(otherUser._id))) {
        conversationMap.set(String(otherUser._id), {
          user: otherUser,
          lastMessage: {
            _id: message._id,
            text: message.text,
            sender: sender._id,
            receiver: receiver._id,
            createdAt: message.createdAt,
          },
        });
      }
    });

    res.json([...conversationMap.values()]);
  } catch (err) {
    console.log("GET CONVERSATIONS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// ================= START SERVER =================
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
