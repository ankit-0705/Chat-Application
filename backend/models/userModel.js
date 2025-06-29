const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({
  name:{ type:String, required:true },
  email:{ type:String, required:true, unique:true },
  password:{ type:String, required:true},
  pnum:{ type: Number, required:true, unique:true },
  pic: {
    mimeType: { type: String },
    data: { type: Buffer }
  },
  incomingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  outgoingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  
},{timestamps:true});

module.exports = mongoose.model('User',userSchema);