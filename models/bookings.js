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
    type:Date,
    required:true
  },
  takenontime:{
    type: Date,
  },
  returnedontime:{
    type: Date,
  },
  liscenceimg:{
    type: String
  },
  hours:{
    type: Number
  },
  ongoing:{
    type: Number
  }
});

const Booking = module.exports = mongoose.model('bookings', BookingSchema);
