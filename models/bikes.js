const mongoose = require('mongoose');

//Bike Schema
const BikesSchema = mongoose.Schema({
  bikename:{
    type: String,
    required: true
  },
  costperhour:{
    type: String,
    required: true,
  },
  citypin:{
    type:String,
    required:true
  },
  img:{
    type: String,
    Unique: true
  },
  count:{
    type: String,
    required: true
  }
});

const Bikes = module.exports = mongoose.model('Bikes', BikesSchema);
