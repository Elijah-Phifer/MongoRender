const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://el:1234@cluster0.twsoe6v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

//"mongodb+srv://<user>:<password>@ckmdb.5oxvqja.mongodb.net/?retryWrites=true&w=majority";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
var cookieParser = require('cookie-parser') //needed for cookies
const app = express();
app.use(cookieParser()); //needed for cookies
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get('/', function(req, res) {
  if (req.cookies.auth) {
    // If it exists, show cookie condition
    res.send('Your cookie exists! Your cookie value is: ' + req.cookies.auth + '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>');
  } 
  else{
    var form = '<form action="/login" method="GET"><input type="submit" value="Login"></form>'
    form += '<form action="/register" method="GET"><input type="submit" value="Register"></form>'
    form += '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>'
    res.send(form);
  }

});


app.get('/register', function(req, res) {
  var form = '<form action="/doregister" method="GET">User ID: <input type="text" name="userId" required><br>'
  form += 'Password: <input type="password" name="password" required><br><input type="submit" value="Register"></form>'
  form += '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>'

  res.send(form);
});

app.get('/doregister', async function(req, res) {
  const client = new MongoClient(uri);
  const { userId, password } = req.query;

  try {
    await client.connect();
    const database = client.db('ElijahDatabase');
    const users = database.collection('Newest');;

    // Insert the new user
    await users.insertOne({ userId, password });
    console.log({userId, password})
    res.send('Registration successful. <a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>');
  } finally {
    await client.close();
  }
});

app.get('/login', function(req, res) {
  var form = '<form action="/dologin" method="GET">User ID: <input type="text" name="userId" required><br>'
  form += 'Password: <input type="password" name="password" required><br><input type="submit" value="Login"></form>'
  form += '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>'
  res.send(form);
});

app.get('/dologin', async function(req, res) {
  const client = new MongoClient(uri);
  const { userId, password } = req.query;

  try {
    await client.connect();
    const database = client.db('ElijahDatabase');
    const users = database.collection('Newest');;

    
    const user = await users.findOne({ userId, password });
    if (user) {
      // Set auth cookie
      res.cookie('auth', 'true', { maxAge: 60000 }); //Sets auth = true expiring in 60 seconds 
      res.send('Login successful. Welcome to the app!<br> <a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>');
      console.log('cookie set')
      console.log('user logged in')
    } else {
      res.send('Invalid credentials. <a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>');
    }
  } finally {
    await client.close();
  }
});

// Access and show cookies
app.get('/showcookie', function (req, res) {
  mycookies=req.cookies;
  res.send(JSON.stringify(mycookies) + '<br> <a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>'); //Send the cookies
});

// app.get('/deletecookie', function (req, res) {
//   res.clearCookie(req.params.auth); //Shortcut for setting expiration in the past
//   res.send('Cookie deleted' + '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/deletecookie">Delete Cookie</a>');
// });

app.get('/clearcookie/:cookiename', function (req, res) {
  res.clearCookie(req.params.cookiename); //Shortcut for setting expiration in the past
  res.send('Cookie deleted' + '<br><a href="/">Home</a> <br> <a href="/showcookie">View Your cookies</a> <br> <a href="/clearcookie/auth">Delete Cookie</a>');
});


app.get('/say/:name', function(req, res) {
  res.send('Hello ' + req.params.name + '!');
});


// Route to access database:
app.get('/api/mongo/:item', function(req, res) {
const client = new MongoClient(uri);
const searchKey = "{ userId: '" + req.params.item + "' }";
console.log("Looking for: " + searchKey);

async function run() {
  try {
    const database = client.db('ElijahDatabase');
    const parts = database.collection('Newest'); //ElijahCollection

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    const query = { userId: req.params.item };

    const part = await parts.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});
