const router = require('express').Router();
const Event = require('../models/Event');
const Users = require('../models/Users');
const nodemailer = require('nodemailer')

router.route('/push_notification/:event_id').get((req, res) => {
    res.render('contact',{layout:false}); //For testing this I have rendered the contact form here
});

//The values sent from the contact form all retrived below.
router.route('/push_notification/send/:id').post((req, res) => {

    const event_id = req.params.id
    var mailing_list = []
    var name,contact,email_id
    var eventname

    Event.findById(event_id)
    .then(event=>{
        event.participants.forEach(person => {
          mailing_list.push(person)
        });
        console.log(event)
        eventname = event.name
        Users.findById(event.owner)
        .then(user=>{
          name = user.name
          contact = user.contact
          email_id = user.email_id
          console.log(mailing_list)
          const output = 
          `
          <p>Dear All,</p>
          <h3>Event name: ${eventname}</h3>
          <p>${req.body.message}</p>
            <p>Regards,</p>
            <ul>  
              <li>Name: ${name}</li>
              <li>Email: ${email_id}</li>
              <li>Phone: ${contact}</li>
            </ul>
            <h3>Message</h3>
          `;
          var atc=req.body.file;
     
    
          let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: 'Tech.iittp@gmail.com', // club-head email-id to be put here.
                pass: 'Tech.iittp@123'  
            },
            tls:{
              rejectUnauthorized:false
            }
          });
  
    
          let mailOptions = {
              from: 'Tech.iittp@gmail.com', // sender address
              to: `${mailing_list}`, // list of receivers, here I have sent it to only my mail ID, To send the message to all people registered in a event, We can filter the users from the schema based on the event obtained from contact form
              subject: `${req.body.subject}`, // Subject line
              
              html: output, // html body
              attachments: [
                
                { 
                  filename:atc, //For now There is only 1 possible atachments, we can add more if required
                }
              ]
              
          };
  
   
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);   
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
              res.render('message_success');
          });
              })
          }).catch(err=>{
              res.status(400).json(err)
          })
});

module.exports = router