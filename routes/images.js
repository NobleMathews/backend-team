const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')

const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'

const storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        }
        resolve(fileInfo)
      })
    })
  }
})

const upload = multer({ storage,
fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    // png jpg gif and jpeg allowed
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //enable this line if abort should be aborted || currently the file is just ignored & not sent for upload
        // return callback(new Error('Only images are allowed'))              
        return callback(null, false)

    }
    callback(null, true)
},
limits:{
    fileSize: 50 * 1024 // 50 Mb limit imposed
} 
})

// <form method="POST" action="/users/profile/upload/<%=id%>"
// invoked from form to upload

// app.post('/upload/:id', upload.single('file'), (req, res) => {
//   const id = req.params.id
//   res.redirect(`/users/profile/image/update?id=${id}&?url=${req.file.filename}`)
// })

// // returns an image stream to show as prof pic    || todo add it to the ejs once the server is made online
// app.get('/:filename', (req, res) => {
//   const file = gfs
//     .find({
//       filename: req.params.filename
//     })
//     .toArray((err, files) => {
//       if (!files || files.length === 0) {
//         return res.status(404).json({
//           err: 'no files exist'
//         })
//       }
//       gfs.openDownloadStreamByName(req.params.filename).pipe(res)
//     })
// })

// app.post('/delete/:img', (req, res) => {
//   gfs.delete(new mongoose.Types.ObjectId(req.params.img), (err, data) => {
//     if (err) return res.status(404).json({ err: err.message })
//     res.status(200)
//   })
// })

// // to save the event in database
// // <form action="/users/add_event/<%=club_head_id%>/add_event/<%=club_name%>/add" method="POST" enctype="multipart/form-data">
// // from the add_event form
// app.post('/add_event', upload.single('poster'), (req, res) => {
//   const event = new Event({
//     name: req.body.event_name,
//     venue: req.body.event_venue,
//     date: req.body.event_date,
//     description: req.body.description,
//     poster_url: `/events/posters/${req.file.filename}`,
//     owner: new mongoose.Types.ObjectId(req.body.club_head_id),
//     categories: req.body.categories,
//     speaker: req.body.speaker
//   })
//   event.save((err) => { // saving the event in database
//     console.error.bind(console, 'event not saved check the input')
//   })

//   // poupulate the owner field
//   Event.findById(event._id)
//     .populate({
//       path: 'owner',
//       model: 'Users'
//     })
//     .exec((err, event) => {
//       console.error.bind(console, ' error while executing the event population')
//     })

//   res.send('success')
// })

// app.get('/:poster', (req, res) => {
//   const filename = req.params.poster

//   const file = gfs
//     .find({
//       filename: req.params.poster
//     })
//     .toArray((err, files) => {
//       if (!files || files.length === 0) {
//         return res.status(404).json({
//           err: 'no files exist'
//         })
//       }
//       gfs.openDownloadStreamByName(req.params.poster).pipe(res)
//     })
// })

module.exports = upload ;