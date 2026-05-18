const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express()



const port = process.env.PORT



app.use(express.json())


app.get('/' , (req , res) => {
    res.send('server in running fine!')
})

app.listen(port , () =>{
    console.log(`server running on port ${port}`)
})