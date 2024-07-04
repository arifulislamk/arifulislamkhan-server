const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

console.log(process.env.secret);
app.use(express.json());
app.use(cors());

//  send email
const sendEmail = (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.TRANSPORT_EMAIL,
      pass: process.env.TRANSPORT_PASS,
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailBody = {
    from: `"portfolio" <${process.env.TRANSPORT_EMAIL}>`, // sender address
    to: emailAddress, // list of receivers
    subject: emailData.subject, // Subject line
    html: emailData.message, // html body
  };

  transporter.sendMail(mailBody, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  // console.log("Message sent: %s", info.messageId);
};
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwicj3r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const datacollection = client.db("portfolio").collection("project");
    const contactcollection = client.db("portfolio").collection("contactMe");

    app.get("/projects", async (req, res) => {
      const result = await datacollection.find().toArray();
      res.send(result);
    });

    app.post("/contactMe", async (req, res) => {
      const info = req.body;
      const result = await contactcollection.insertOne(info);

      // welcome email new user
      sendEmail(process.env.TRANSPORT_EMAIL, {
        subject: "Any Company Try to you contact!",
        message: `${info.name} Contact you!.
        
         Company Email: ${info.email} .   
         Message : ${info.message}.`,
      });
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to profile server");
});
app.listen(port, () => {
  console.log(`The Server is running now! ${port}`);
});
