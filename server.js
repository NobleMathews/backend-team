const express = require('express');
const cors = require('cors');
const mongoose =  require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

const uri = "mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

const homeRouter = require('./routes/home');
const userRouter = require('./routes/users');

app.get('/',(req,res)=>{
  res.render('index');
})

app.get('/profile',(req,res)=>{
  res.render('profile',{id:req.query.id});
})

app.use('/users',userRouter);

app.listen(port,()=>{
    console.log(`listening on port : ${port}`);
});