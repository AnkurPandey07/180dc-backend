const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  pass: {
    type: String,
    // unique: true,
    required: true,
    minlength: [3, 'Must be at least 3 letters, got {value}'],
    maxlength: 15,
  },
  cpass: {
    type: String,
    // unique: true,
    // required: true,
    minlength: [3, 'Must be at least 3 letters, got {value}'],
    maxlength: 15,
  },
  // newpassword: {
  //   type: String,
  //   default: '',
  // },
  // confirmpassword: {
  //   type: String,
  //   default: '',
  // },
  passCreatedAt: {
    type: Date,
    default: Date.now(),
  },
  tokenCreatedAt: {
    type: Date,
    default: Date.now(),
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'Eamil is already present'],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid Email')
      }
    },
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
})

adminSchema.pre('save', async function (next) {
  if (this.isModified('pass')) {
    this.pass = await bcrypt.hash(this.pass, 10)
    this.cpass = undefined
  }
  next()
})

adminSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
    this.tokens = this.tokens.concat({ token: token })
    await this.save()
    // console.log(token)
    return token
  } catch (e) {
    console.log(e)
  }
}

const adminInfo = new mongoose.model('adminInfo', adminSchema)

module.exports = adminInfo
