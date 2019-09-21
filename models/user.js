const mongoose = require('mongoose');

//user Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    Unique: true
  },
  username:{
    type: String,
    required: true,
    Unique: true
  },
  phone:{
    type: String,
    required: true,
    Unique: true
  },
  password:{
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
