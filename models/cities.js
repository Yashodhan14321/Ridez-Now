const mongoose = require('mongoose');

//user Schema
const CitySchema = mongoose.Schema({
  cityname:{
    type: String,
    required: true,
    Unique:true
  },
  cityimg:{
    type: String
  },
  postalcode:{
    type:String,
    required: true,
    Unique:true
  }
});
const City = module.exports = mongoose.model('cities', CitySchema);
