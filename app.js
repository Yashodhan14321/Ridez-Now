const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const localtunnel = require('localtunnel');

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open', function(){
  console.log('connection to mongodb');
})

//check for DB error
db.on('error', function(err){
  console.log(err);
});

//Init App
const app = express();

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//parse application
app.use(bodyParser.urlencoded({extended: false}))
//parse application/json
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//express session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//express messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//expressValidator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam+='[' + namespace.shift()+']';
    }
    return{
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

//passport config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
})


//Home Route
app.get('/', (req, res)=>{
    res.render('home');
});

//Route filters
//Route User
let users = require('./routes/users');
app.use('/users', users);

app.listen(4000,()=>{
  console.log('server started on port 4000 .....');
});
