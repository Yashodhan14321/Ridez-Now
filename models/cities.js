const mongoose = require('mongoose');

//user Schema
const CitySchema = mongoose.Schema({
  cityname:{
    type: String,
    required: true,
    Unique:true
  },
  postalcode:{
    type:String,
    required: true,
    Unique:true
  }

const City = module.exports = mongoose.model('City', UserSchema);
