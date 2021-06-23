const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

mongoose.connect('mongodb+srv://hoopla:XxfQnridOJlUHvkC@cluster0.jk4rw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

// build schema
var userSchema = new mongoose.Schema({
  username: String,
  exercises: [{ description: String, duration: Number,date: Date}]
});

// build model
var UserModel = mongoose.model('UserModel', userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// form data creates new user, object returns username and _id
app.post('/api/users', urlencodedParser, function(req, res) {
  var username = req.body.username;

  // create document for new user based on form data
  var newUser = new UserModel({ username: username });
  newUser.save(function(err) {
    if (err) return console.error(err);
  });
  console.log(newUser._id);
  var _id = newUser._id;

  res.json({ username: username, _id: _id });
});

// get request should return as JSON list of all usersnames and associated ids
app.get('/api/users', function(req, res) {
  // perform a query on mongoDB, with no parameters
  var users = UserModel.find({ }, 'username _id', function(err, result) {
    if (err) return console.error(err);
    console.log(result);
    res.json(result);
  });
  // console.log(users);
  
});

// TODO: post form date to /api/users/:_id/exercises that returns object with exercise fields added

// TODO: get request to /api/users/:_id/logs retrives full exercise log of any user 
// must include count property
// can use parameters to request from date, to date, limit in # of records


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
