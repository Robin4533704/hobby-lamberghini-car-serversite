require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

// mongodb claster....

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dvaruep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(process.env.DB_USER)

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
await client.connect();

    // connect the client to the server (optional starting in v4.7) 
// add card 

    const carsCollection = client.db('carDB').collection('cars')

    app.get('/cars',async (req, res)=>{
      const result = await carsCollection.find().toArray();
      res.send(result);
    })

    // spacepic data base 
    app.get('/cars/:id', async (req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await carsCollection.findOne(query)
      res.send(result);
    })
// add data 
    app.post('/cars', async (req, res)=>{
const newCar = req.body;
console.log(newCar);
const result = await carsCollection.insertOne(newCar);
res.send(result)
    })

    // update data
    app.put('/cars/:id', async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const filter = { _id: new ObjectId(id) };

  const result = await carsCollection.updateOne(filter, { $set: updateData });
  res.send({ acknowledged: result.acknowledged, modifiedCount: result.modifiedCount });
});
   
// delete card
 app.delete('/cars/:id', async (req,res) =>{
  const id = req.params.id;
  const query ={_id: new ObjectId(id)}
  const result = await carsCollection.deleteOne(query);
  res.send(result);
 })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. you succesfully connected to mongodb!");
  }
  finally {
    // await client.close(); 
  }
}
run().catch(console.dir);




app.get('/', (req, res)=>{
    res.send('lamberghini  server is getting khotter')
});

app.listen( port, ()=>{
    console.log(`lamberghini server is running on port ${port}`)
})
