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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    app.get("/ideas/trending", async (req, res) => {
        const result = await ideasCollection.aggregate([
          {
            $limit: 6
          }
        ]).toArray();

        res.send(result);
    });
    
    app.get("/ideas/:id" , async (req, res) => {
          const { id } = req.params;
    
          const result = await ideasCollection.findOne({
            _id: new ObjectId(id),
          });
    
          res.json(result);
        });
        app.patch('/ideas/:id/comments', async (req, res) => {
          const id = req.params.id;
          const commentData = req.body;
          

          const result = await ideasCollection.updateOne(
              { _id: new ObjectId(id) },
              {
                  $push: {
                      comments: commentData
                  }
              }
          );

          res.send(result);
      });

    app.post('/ideas' , async(req , res) => {
        const ideasData = req.body;
        console.log(ideasData)
        const result = await ideasCollection.insertOne(ideasData)

        res.json(result)
    })
    app.patch('/ideas/:ideaId/comments/:index/delete', async (req, res) => {
      const { ideaId, index } = req.params;

      const idea = await ideasCollection.findOne({
          _id: new ObjectId(ideaId)
      });

      const updatedComments = idea.comments.filter(
          (comment, currentIndex) => currentIndex !== parseInt(index)
      );

      const result = await ideasCollection.updateOne(
          { _id: new ObjectId(ideaId) },
          {
              $set: {
                  comments: updatedComments
              }
          }
      );

      res.send(result);
  });
    app.patch('/ideas/:ideaId/comments/:index', async (req, res) => {
      const { ideaId, index } = req.params;
      const { text } = req.body;

      const idea = await ideasCollection.findOne({
          _id: new ObjectId(ideaId)
      });

      idea.comments[index].text = text;
      idea.comments[index].time = new Date().toLocaleString();

      const result = await ideasCollection.updateOne(
          { _id: new ObjectId(ideaId) },
          {
              $set: {
                  comments: idea.comments
              }
          }
      );

      res.send(result);
    });
    app.get("/my-interactions/:userId", async (req, res) => {
        const userId = req.params.userId;

        const ideas = await ideasCollection
            .find({
            "comments.userId": userId,
            })
            .toArray();

        const userComments = [];

        ideas.forEach((idea) => {
            idea.comments.forEach((comment) => {
            if (comment.userId === userId) {
                userComments.push({
                ideaId: idea._id,
                ideaTitle: idea.title,
                commentText: comment.text,
                commentTime: comment.time,
                });
            }
            });
        });

        res.send(userComments);
        });
        app.get("/my-ideas/:email", async (req, res) => {
            const email = req.params.email;

            const query = {
                userEmail: email,
            };

            const result = await ideasCollection.find(query).toArray();

            res.send(result);
        });
        app.delete("/ideas/:id", async (req, res) => {
            const id = req.params.id;

            const result = await ideasCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.send(result);
        });
        app.patch("/ideas/:id", async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const result = await ideasCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                $set: updatedData,
                }
            );

            res.send(result);
            });
    
    
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