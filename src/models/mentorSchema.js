const mongoose = require('mongoose')
const validator = require('validator')

const mentorSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minLength: 3,
  },
  lastname: {
    type: String,
    required: true,
    minLength: 3,
  },
  description: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 50,
  },
  photodetail: {
    type: String,
  },
  photopath: {
    type: String,
  },
  photourl: {
    type: String,
    unique: true,
  },
})

const mentorDetail = new mongoose.model('mentorDetail', mentorSchema)

module.exports = mentorDetail
