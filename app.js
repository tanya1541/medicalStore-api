const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

mongoose.connect('mongodb://localhost/blog');
let db = mongoose.connection;

db.on('error', function(err){
    console.log(err);
});

db.once('open', function(){
    console.log("Connected to mongodb");
})

const app = express();
var cors = require('cors');
var corsOptions = {
  origin: ['http://example.com'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

const User = require("./models/users");
app.use(express.json());

app.post("/signup", async (req, res, next) => {
    const { name, username, password } = req.body;
    const newUser = User({
      name,
      username,
      password,
    });
   
    try {
      await newUser.save();
    } catch {
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
    
    res
      .status(201)
      .json({
        success: true,
        data: { userId: newUser.id,
            username: newUser.username },
      });
  });


app.post("/login", async (req, res, next) => {
    let { username, password } = req.body;
   
    let existingUser;
    try {
      existingUser = await User.findOne({ username: username });
    } catch {
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
    if (!existingUser || existingUser.password != password) {
      const error = Error("Wrong details please check at once");
      return next(error);
    }
    let token;
    try {
      //Creating jwt token
      token = jwt.sign(
        { userId: existingUser.id, username: existingUser.username },
        "mashup_secret_key",
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
   
    res
      .status(200)
      .json({
        success: true,
        data: {
          userId: existingUser.id,
          username: existingUser.username,
          token: token,
        },
      });
  });

  app.get('/', (req, res)=>{
    const token = req.headers.authorization.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if(!token)
    {
      res.status(200).json({success:false, message: "Error!Token was not provided."});
    }
    //Decoding the token
    const decodedToken = jwt.verify(token,"mashup_secret_key" );
    res.status(200).json({success:true, data:{userId:decodedToken.userId,username:decodedToken.username}});
    })

let Medicine = require('./models/medicines');

app.get('/medicines', function(req, res){
    Medicine.find({})
    .then((medicines)=> {
      res.json(medicines);
    })
    .catch((err)=> res.json({message: "Something went wrong"}));
  });

  app.post('/medicines', function(req, res){
    let medicine = new Medicine();
    medicine.name = req.body.name;
    medicine.company = req.body.company;
    medicine.expiry_date = req.body.expiry_date;
    medicine.save()
    .then((medicine)=> {
      res.json({message: "Medicine created"});
    })
    .catch((err)=> {
      res.json({message: "Something went wrong"});
    });
  });

  app.get('/medicines/:id', function(req, res){
    let medicineId = req.params.id
    Medicine.findById(medicineId)
    .then((medicine)=> {
       res.json(medicine);
    })
    .catch((err)=> res.json({message: "Something went wrong"}));
  });

  app.put('/medicines/:id', function(req, res){
    let medicineId = req.params.id;
    let medicine = {};
    medicine.name = req.body.name;
    medicine.company = req.body.company;
    medicine.expiry_date = req.body.expiry_date;
  
    let query = {_id:medicineId};
    Medicine.update(query, medicine)
    .then((medicine)=> {
      res.json({message: "Medicine updated"});
    })
    .catch((err)=> {res.json({message: "Something went wrong"})
    });
  });

  app.delete('/medicines/:id', function(req, res){
    let medicineId = req.params.id;
    let query = {_id:medicineId};
    Medicine.remove(query)
    .then((medicine)=> {
      res.json({message: "Medicine deleted"});
    })
    .catch((err)=> {
      res.json({message: "Something went wrong"});
    });
  });
  
app.listen(3000, function(){
    console.log('Server started on port 3000...');
})