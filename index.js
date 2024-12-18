const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Updated import
const bodyParser = require('body-parser'); // Updated import
const session = require('express-session');
const passport = require('./passport/passportConfig'); // Import the Passport configuration
const mongoose = require('mongoose');

const DB_URL = "mongodb+srv://whomtalkto:9hfuwScC7AgIIKpE@cluster0.j2yax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const UserRouter = require('./src/router/userRouter');
const InventoryRouter = require("./src/router/inventoryRouter");
// const MembershipRouter = require('./router/membershipRouter');

const app = express();
const port = 3000;

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Updated import
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
  
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  
  // Session middleware
  app.use(
    session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // Should be true in production with HTTPS
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', UserRouter);
app.use('/api/v1/inventory', InventoryRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});