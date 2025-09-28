require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const axios = require("axios");
const fileUpload = require("express-fileupload");


const app = express();
const port = process.env.PORT || 5000;


// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// --- MongoDB Connection ---
 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dvaruep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect(); 

    console.log("✅ MongoDB connected successfully");

    // --- Collections ---
    const usersCollection = client.db("HobyHove").collection("users");
    const groupsCollection = client.db("HobyHove").collection("groups");

    // --- Routes ---

    // Test route
    app.get("/", (req, res) => {
      res.send("🚀 API is running...");
    });

 

    // Users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const existingUser = await usersCollection.findOne({ email: user.email });
        if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
        }
        const result = await usersCollection.insertOne(user);
        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Groups
    app.get("/groups", async (req, res) => {
      const groups = await groupsCollection.find().toArray();
      res.send(groups);
    });


    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      const result = await groupsCollection.insertOne(newGroup);
      res.send(result);
    });

    // Get single group by id
app.get("/groups/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/groups/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Group not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/groups/:id", async (req, res) => {
  const { id } = req.params;          // The ID from URL
  const { _id, ...updateData } = req.body; // Remove _id from update

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  try {
    const updated = await groupsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },   // Match using ObjectId
      { $set: updateData },        // Only update allowed fields
      { returnDocument: "after" }
    );

    if (!updated.value) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(updated.value);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Join group (example)
app.post("/groups/:id/join", async (req, res) => {
  try {
    const id = req.params.id;
   
    res.json({ success: true, message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Image Upload (imgbb)
    app.post("/upload-image", async (req, res) => {
      try {
        if (!req.files || !req.files.image) {
          return res.status(400).json({ message: "No image uploaded" });
        }

        const imageFile = req.files.image;
        const imageBase64 = imageFile.data.toString("base64");

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          { image: imageBase64 }
        );

        const imageUrl = response.data.data.display_url;
        res.status(200).json({ url: imageUrl });
      } catch (error) {
        console.error("Image upload error:", error.message);
        res.status(500).json({ message: "Image upload failed", error: error.message });
      }
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// --- Server Start ---
app.listen(port, () => {
  console.log(`🚀 Lamborghini server is running on port ${port}`);
});
