const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });
admin.initializeApp();

//to make it work you need gmail account

const gmailEmail = "";
const gmailPassword = "";

var goMail = function(mail, message, type) {
  //transporter is a way to send your emails

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword
    }
  });

  // setup email data with unicode symbols
  //this is how your email are going to look like
  const mailOptions = {
    from: gmailEmail, // sender address
    to: mail, // list of receivers
    subject: "HI", // Subject line
    text: "" + message, // plain text body
    html: "" + message // html body
  };

  //this is callback function to return status to firebase console
  const getDeliveryStatus = function(error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  };

  //call of this function send an email, and return status
  transporter.sendMail(mailOptions, getDeliveryStatus);
};

exports.onDataAddedDemoRequest = functions.database
  .ref("/users/{sessionId}")
  .onCreate((snap, context) => {
    const createdData = snap.val();
    var message = createdData.code;
    var mail = createdData.mail;

    goMail(mail, message);
  });

exports.signup = functions.https.onRequest(async (req, res) => {
  const mail = req.query.mail;
  const pass = req.query.pass;

  const snapshot = await admin
    .database()
    .ref("/users")
    .push({
      mail: mail,
      pass: pass,
      code: 548694,
      date: Date.now()
    });
  res.redirect(200, snapshot.ref.toString());
});

exports.verify = functions.https.onRequest(async (req, res) => {
  var id = req.query.id;
  const code_client = req.query.code;
  console.log(id);
  console.log(code_client);

  // eslint-disable-next-line promise/catch-or-return
  await admin
    .database()
    .ref("/users/" + id)
    .once("value")
    .then(snapshot => {
      var code = snapshot.val().code;

      console.log("if disi" + code);
      // eslint-disable-next-line promise/always-return
      if (code_client.toString() === code.toString()) {
        res.status(200).send("guzel");
      } else {
        console.log("code else girdi");
        console.log(code_client === code);
        res.status(409).send("conflict");
      }
    });
  res.status(500).send("bisiler ters gitti");
});

exports.login = functions.https.onRequest(async (req, res) => {
  var mail_client = req.query.mail;
  const pass_client = req.query.pass;
  console.log(mail_client);
  console.log(pass_client);

  // eslint-disable-next-line promise/catch-or-return
  await admin
    .database()
    .ref("/users")
    .orderByChild("mail")
    .equalTo(mail_client)
    .once("value")
    // eslint-disable-next-line promise/always-return
    .then(snapshot => {
      console.log(snapshot.val());
      snapshot.forEach(childSnapshot => {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        var pass = childData.pass;
        console.log(pass);
        console.log(pass === pass_client.toString());
        // eslint-disable-next-line promise/always-return
        if (pass.toString() === pass_client.toString()) {
          res.status(200).send("guzel");
        } else {
          res.status(409).send("conflict");
        }
      });
      res.status(500).send("bisiler ters gitti");
    });
  res.status(500).send("bisiler ters gitti");
});
