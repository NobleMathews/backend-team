const express = require('express');
const cors = require('cors');
const mongoose =  require('mongoose');
const bodyParser = require('body-parser');
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

// const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended:true,}));
app.set('view engine','ejs');

const uri = "mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority";
// for testing
// const uri ="mongodb://127.0.0.1:27017/database";

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

let gfs;
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
  gfs = new mongoose.mongo.GridFSBucket(connection.db, {bucketName: "uploads"});
});

const homeRouter = require('./routes/home');
const userRouter = require('./routes/users');

app.get('/',(req,res)=>{
  res.render('index');
})

app.get('/profile',(req,res)=>{
  res.render('profile',{id:req.query.id});
})
// app.use(morgan('tiny'));
app.use('/users',userRouter);

app.listen(port,()=>{
    console.log(`listening on port : ${port}`);
});


const storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
      return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
              if (err) {
                  return reject(err);
              }
              const filename = buf.toString('hex') + path.extname(file.originalname);
              const fileInfo = {
                  filename: filename,
                  bucketName: 'uploads'
              };
              resolve(fileInfo);
          });
      });
  }
});

const upload = multer({ storage });

//invoked from form to upload
app.post('/users/profile/image/upload/:id', upload.single('file'),(req, res) => {
  const id = req.params.id;
  // Sending back file name to server
  res.redirect(`/users/profile/image/update?id=${id}&?url=${req.file.filename}`);
  // res.json({file:req.file});
});


// returns an image stream to show as prof pic    || todo add it to the ejs once the server is made online
app.get("/users/profile/image/:filename", (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

//delete request as per documentation to clear all chunks probably need to preserve the object id
app.post("/users/profile/image/del/:img", (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.img), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
    res.sendStatus(200);
  });
});