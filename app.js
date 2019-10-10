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
var moment = require('moment');
var formidable = require('formidable');
var fs = require('fs');
moment().format();

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

//Bring in models
let Cities = require('./models/cities');
let User = require('./models/user');
let Bikes = require('./models/bikes');
let Booking = require('./models/bookings');
//Home Route
app.get('/',(req, res)=>{
  res.render('splash');
});

app.get('/home',ensureAuthenticated, (req, res)=>{
  Cities.find({}, function(err,cities){
    if(err){
      console.log(err);
    }
    else{
      res.render('home',{
        cities: cities,
        admin: req.user
      });
    }
  });
});

app.get('/add',ensureAuthenticated,(req,res)=>{
  res.render('add');
});

app.post('/add',ensureAuthenticated,(req,res)=>{
  var cityname=req.body.cityname;
  var pincode = req.body.pincode;
  var cityimg = "/imagedb/cityimg/"+pincode+".png";

  let newCity = new Cities({
      cityname:cityname,
      postalcode:pincode,
      cityimg:cityimg
    });
  newCity.save(function(err){
        if(err){
          console.log(err);
          return;
        }
        else {
          req.flash('success', 'City Added Successfully');
          res.redirect('/');
        }
      });
});

app.get('/delete/:id',ensureAuthenticated, function(req, res){
  let query = {_id:req.params.id};

  Cities.findById(req.params.id, function(err, cities){
      Cities.deleteOne(query, function(err){
        if(err){
          console.log(err);
        }
        res.redirect('/');
      });
    });
});

app.get('/done',ensureAuthenticated, function(req, res){
  res.render('done');
});

app.get('/deletebike/:id/:id1',ensureAuthenticated, function(req, res){
  let query = {_id:req.params.id};
  Bikes.findById(req.params.id, function(err, bikes){
      Bikes.deleteOne(query, function(err){
        if(err){
          console.log(err);
        }
        else
        {
          res.redirect('/bikes/'+req.params.id1);
        }
      });
    });
});

app.get('/bikes/:id',ensureAuthenticated, function(req, res){
  let query = {_id:req.params.id};
  Cities.findById(req.params.id, function(err, cities){
    Bikes.find({},function(err, bikes){
      if(err){
      console.log(err);
      }
      else{
        res.render('bikes',{
            bikes:bikes,
            cities:cities,
            admin: req.user
        });
      }
    });
  });
});

app.get('/bike/:id',ensureAuthenticated, function(req, res){
  let query = {_id:req.params.id};
  Bikes.find(query,function(err, Bike){
    res.render('bike',{
      id:req.params.id
    });
  });
});

app.post('/bike/:id',ensureAuthenticated, function(req, res){
  let query = {_id:req.params.id};
  Bikes.findById(req.params.id,function(err, bike){
    const username = req.user.username;
    const bikename = bike.bikename;
    const requiredontime = req.body.requiredtime;
    const ongoing = -1;
    const liscenceimg = '/images/liscence/'+req.user.username+'.png';

    let newbooking = new Booking({
      username:username,
      bikename:bikename,
      requiredontime:requiredontime,
      ongoing:ongoing,
      liscenceimg:liscenceimg
    });
    newbooking.save(function(err, booking){
      if(err){
        console.log(err);
        return;
      }
      else{
        req.flash('success', 'booking done Successfully');
        res.redirect('/done');
      }
    });
  });
});

app.get('/addbike/:id',ensureAuthenticated, function(req, res){
  Cities.findById(req.params.id,function(err, cities){
    if(err){
      console.log(err);
    }
    else{
      res.render('addbike',{
        cities: cities
      });
    }
  })
});

app.post('/addbike/:id',ensureAuthenticated, function(req, res){
  Cities.findById(req.params.id,function(err, cities){
      const Bikename = req.body.bikename;
      const cost = req.body.cost;
      const count = req.body.count;
      const citypin = cities.postalcode;

      let newBike = new Bikes({
        bikename:Bikename,
        costperhour:cost,
        count:count,
        citypin:citypin
      });
      newBike.save(function(err){
          if(err){
            console.log(err);
            return;
          }
          else {
            req.flash('success', 'Bike Added Successfully');
            res.redirect('/bikes/'+cities._id);
          }
        });
  });
});

app.get('/bookings', ensureAuthenticated, function(req, res){
  let query = {username:req.user.username};
  Booking.find(query, function(err, booking){
    res.render("bookings",{
      booking:booking,
      username:req.user.username
    });
  });
});

app.get('/bookings/admin/:id', ensureAuthenticated, function(req, res){
  Booking.findById(req.params.id, function(err, booky){
    res.render("bikedeleivered",{
      booking:booky
    });
  });
});

app.get('/bookings/admin/:id/:ongoing', ensureAuthenticated, function(req, res){
  let book = {};
  book.takenontime=moment().format();
  book.ongoing=0;
  let query = {_id:req.params.id};
  Booking.updateOne(query,book, function(err){
    if(err){
      console.log(err);
      return;
      }
    else{
      res.redirect('/bookings/admin/'+req.params.id);
    }
  });
});


//
//
//PLACE IMAGE UPLOAD
//
//
app.get('/cityimgupload/:id',ensureAuthenticated, function(req, res){
  Cities.findById(req.params.id, function(err, city){
    res.render('cityimg',{
    image:city
  });
  });
});

app.post('/cityimgupload/:id',ensureAuthenticated, function(req, res){
  var cityimage;
  Cities.findById(req.params.id, function(err, citi){
    cityimg = citi.cityimg;
  });
  var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
//console.log(oldpath);
var newpath = path.join(__dirname,'./public/') + cityimg;
fs.readFile(oldpath, function (err, data) {
if (err) throw err;
console.log('File read!');

// Write the file
fs.writeFile(newpath, data, function (err) {
if (err) throw err;
res.redirect('/cityimgupload/'+req.params.id);
res.end();
console.log('File written!');
});

// Delete the file
fs.unlink(oldpath, function (err) {
if (err) throw err;
console.log('File deleted!');
});
    });
}); 
});

//
//
//
//


// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

//Route filters
//Route User
let users = require('./routes/users');
app.use('/users', users);

app.listen(3000,()=>{
  console.log('server started on port 3000 .....');
});
