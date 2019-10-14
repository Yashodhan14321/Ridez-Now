const mongoose = require('mongoose');

//Bike Schema
const BookingSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  bikename:{
    type: String,
    required: true
  },
  personAt:{
    type: String,
  },
  requiredontime:{
    type:String,
    required:true
  },
  personret:{
    type:String,
    required:true
  },
  takenontime:{
    type: String,
  },
  returnedontime:{
    type: String,
  },
  liscenceimg:{
    type: String
  },
  hours:{
    type: Number
  },
  ongoing:{
    type: Number
  },
  payed:{
    type: Number
  }
});

const Booking = module.exports = mongoose.model('bookings', BookingSchema);
