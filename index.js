const express = require('express');

const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggzrw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send("hello from db it's working ")
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("carService").collection("services");
  const adminCollection = client.db("carService").collection("admin");
  const addReviewCollection = client.db("carService").collection("addReview");
  const newServiceCollection = client.db("carService").collection("addNewService");
  // perform actions on the collection object

  //service
  app.post('/addService', (req, res) => {
    const service = req.body;
    console.log(service );
    serviceCollection.insertOne(service)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
});
// app.post('/addService', (req, res) => {
//     const queryEmail = req.query.email;
//     serviceCollection.find({email: queryEmail})
//     .toArray((err, documents) => {
//       res.send(documents)
//       console.log(documents)
//       console.log(err);
//     })
//   })
app.post('/orderCollection', (req, res) => {
  const date = req.body;
  const email = req.body.email;
  console.log(date.date );
  adminCollection.find({email:email})
      .toArray((err,doc)=>{
          const filter ={date: date.date}
          if(doc.length ===0){
              filter.email = email;
          }
          serviceCollection.find(filter)
          .toArray((err,documents)=>{
              res.send(documents);
          })
      })
  
});
app.get('/serviceData', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
})
app.post('/serviceByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    adminCollection.find({ email: email })
        .toArray((err, service) => {
            const filter = { date: date.date }
            if (service.length === 0) {
                filter.email = email;
            }
            serviceCollection.find(filter)
                .toArray((err, documents) => {
                    console.log(email, date.date, service, documents)
                    res.send(documents);
                })
        })

})
app.post('/addAdmin', (req, res) => {
    //   const file = req.files.file;
    //   const name = req.body.name;
      const email = req.body.email;
      console.log(email)
    //   const newImg = file.data;
    //   const encImg = newImg.toString('base64');
    
    //   var image = {
    //       contentType: file.mimetype,
    //       size: file.size,
    //       img: Buffer.from(encImg, 'base64')
    //   };
    
      adminCollection.insertOne({ email})
          .then(result => {
              res.send(result.insertedCount > 0);
          })
    })

app.post('/addReview', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event: ', newEvent)
    addReviewCollection.insertOne(newEvent)
    .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
    })
})
app.post('/addNewService', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event: ', newEvent)
    newServiceCollection.insertOne(newEvent)
    .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
    })
})
app.get('/review', (req, res) => {
    addReviewCollection.find()
    .toArray((err, items) => {
        res.send(items)
    })
})
app.get('/order', (req, res) => {
    const queryEmail = req.query.email;
    serviceCollection.find({email: queryEmail})
    .toArray((err, documents) => {
      res.send(documents)
      console.log(documents)
      console.log(err);
    })
  })
app.get('/newService', (req, res) => {
    newServiceCollection.find()
    .toArray((err, items) => {
        res.send(items)
    })
})

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, admins) => {
          res.send(admins.length > 0);
      })
})
app.delete('/delete', (req, res) => {
    const id = ObjectId (req.params._id);
    console.log('deleted id', id)
    adminCollection.findOneAndDelete({_id: id})
    .then(result => 
        {result.deletedCount > 0})
        
})


});



app.listen(process.env.PORT || port)
