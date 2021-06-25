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
  log: [{ description: String, duration: Number, date: String }]
});

// build model
var UserModel = mongoose.model('UserModel', userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// form data creates new user, object returns username and _id
app.post('/api/users', urlencodedParser, function (req, res) {
  var username = req.body.username;

  // create document for new user based on form data
  var newUser = new UserModel({ username: username });
  newUser.save(function (err) {
    if (err) return console.error(err);
  });
  console.log(newUser._id);
  var _id = newUser._id;

  res.json({ username: username, _id: _id });
});

// get request should return as JSON list of all usernames and associated ids
app.get('/api/users', function (req, res) {
  // perform a query on mongoDB, with no parameters
  var users = UserModel.find({}, 'username _id', function (err, result) {
    if (err) return console.error(err);
    // console.log(result);
    res.json(result);
  });
  // console.log(users);

});

// post form date to /api/users/:_id/exercises that returns object with exercise fields added
app.post('/api/users/:_id/exercises', urlencodedParser, function (req, res) {
  // find user with _id
  UserModel.findById({ _id: req.params._id }, function (err, result) {
    if (err) return console.error(err);
    // console.log(result, req.body);
    // add current exercise
    var exer = {
      description: req.body.description,
      duration: Number(req.body.duration),
      date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
    };
    result.log.push(exer);
    // save result
    result.save(function (err) {
      if (err) console.error(err);
    });
    // output result
    res.json({ _id: req.params._id, username: result.username, date: exer.date, duration: exer.duration, description: exer.description });
  });

});

// get request to /api/users/:_id/logs retrives full exercise log of any user 
app.get('/api/users/:_id/logs', function (req, res) {
  // can use parameters to request from date, to date, limit in # of records
  // use req.query to access these
  var qFrom, qTo, qLimit;
  if (req.query.from) {
    qFrom = new Date(req.query.from);
  } else {
    qFrom = new Date(1900, 0);
  };
  if (req.query.to) {
    qTo = new Date(req.query.to);
  } else {
    qTo = new Date();
  };

  //  can use parameters to request from date, to date, limit in # of records
  UserModel.findById({ _id: req.params._id }, function (err, result) {
    if (err) console.error(err);
    // must include count property
    var filtered = result.log.filter(function (e, i, a) {
      var exDate = new Date(e.date);
      return exDate >= qFrom && exDate <= qTo;
    });
    if (req.query.limit) {
      filtered = filtered.slice(0, req.query.limit);
    }
    res.json({ _id: result._id, username: result.username, count: result.log.length, log: filtered });
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
