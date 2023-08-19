const jwt = require('jsonwebtoken')
const admin = require('../src/models/adminSchema')
const { promisify } = require('util')
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt
    console.log(token)
    const userVerify = await promisify(jwt.verify)(
      token,
      process.env.SECRET_KEY
    )

    const userDetail = await admin.findOne({ _id: userVerify._id })
    console.log(userDetail)

    req.token = token
    req.user = userDetail
    if (userDetail) next()
    else
      res.status(400).json({
        message: 'You are not allowed to access this route',
        status: 'fail',
      })
  } catch (e) {
    res.status(401).send(e)
  }
}

module.exports = auth
