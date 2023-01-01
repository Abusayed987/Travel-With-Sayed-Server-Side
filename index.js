const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 4000;
const app = express()


// middle ware 
app.use(cors())
app.use(express.json())




app.get('/', (req, res) => {
    res.send('Travel with sayed Server is running')
})

app.listen(port, () => {
    console.log(`server running on port : ${port}`);
})
