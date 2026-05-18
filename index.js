const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
dotenv.config();

const app = express()

const port = process.env.PORT

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('idea-vault')
    const ideasCollection = db.collection('ideas')

    app.get('/ideas' , async(req , res) => {
        
        const result = await ideasCollection.find().toArray();

        res.json(result)
    })

    app.post('/ideas' , async(req , res) => {
        const ideasData = req.body;
        console.log(ideasData)
        const result = await ideasCollection.insertOne(ideasData)

        res.json(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req , res) => {
    res.send('server in running fine!')
})

app.listen(port , () =>{
    console.log(`server running on port ${port}`)
})