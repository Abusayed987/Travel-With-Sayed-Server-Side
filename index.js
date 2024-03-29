const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;
const app = express()

require('dotenv').config()

// middle ware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dptn3ue.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: 'Unauthorized Access' })
        }
        req.decoded = decoded
        next()
    })

}


async function run() {
    try {
        const serviceCollection = client.db('travelWithSayed').collection('services')
        const reviewCollection = client.db('travelWithSayed').collection('review')

        // jwt api 
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
            res.send({ token })
        })



        // servicesForHome Api
        app.get('/servicesForHome', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            // const services = await cursor.toArray();;
            const services = await cursor.limit(3).toArray();
            res.send(services)
        });


        // Services Api 
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();;
            res.send(services)
        });

        // Services Api for get Dynamic Data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        })


        //Review Api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        })

        // particular review
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized Access' })
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        })

        // particular review by id

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query)
            res.send(review)
        })

        // update Review 

        app.put('reviews/:id', async (req, res) => {
            // const id = req.params.id
            // const query = { _id: ObjectId(id) }
            // const updateReview = req.body
            // console.log(updateReview);
            // const review = req.body
            // const option = { upsert: true }
            // const updateDoc = {
            //     $set: {
            //         review

            //         // reviewerName: review.review,
            //         // reviewerPhoto: review.reviewerPhoto,
            //         // reviewerText: review.reviewerText
            //     }
            // }
            // const result = await reviewCollection.updateOne(query, updateDoc)
            // res.sendDate(result)
        })


        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })











        app.get('/allReviews', async (req, res) => {

            let query = {}
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        })


    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Travel with sayed Server is running')
})

app.listen(port, () => {
    console.log(`server running on port : ${port}`);
})
