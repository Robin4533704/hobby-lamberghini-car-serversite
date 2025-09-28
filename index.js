require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dvaruep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let usersCollection, groupsCollection;

async function connectDB() {
  try {
    await client.connect();
    usersCollection = client.db("HobyHove").collection("users");
    groupsCollection = client.db("HobyHove").collection("groups");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

app.get("/users", async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const existingUser = await usersCollection.findOne({ email: user.email });
  if (existingUser) return res.status(400).json({ error: "Email exists" });
  const result = await usersCollection.insertOne(user);
  res.status(201).json(result);
});

app.get("/groups", async (req, res) => {
  const groups = await groupsCollection.find().toArray();
  res.json(groups);
});

app.post("/groups", async (req, res) => {
  const result = await groupsCollection.insertOne(req.body);
  res.json(result);
});

app.get("/groups/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
  const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
  if (!group) return res.status(404).json({ error: "Group not found" });
  res.json(group);
});

app.put("/groups/:id", async (req, res) => {
  const { id } = req.params;
  const { _id, ...updateData } = req.body; // Remove _id
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  const updated = await groupsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: "after" }
  );

  if (!updated.value) return res.status(404).json({ error: "Group not found" });
  res.json(updated.value);
});

app.delete("/groups/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Group not found" });
  res.json({ success: true });
});

// Export app for Vercel
module.exports = app;
