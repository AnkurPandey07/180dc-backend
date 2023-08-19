require('dotenv').config()
const express = require('express')
require('../src/dp/conn')
// require('../middleware/cloudinary')
const admin = require('../src/models/adminSchema')
const mentor = require('../src/models/mentorSchema')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const auth = require('../middleware/authController')
const type = require('../middleware/multermiddle')
const addMentorData = require('./controllers/mentor')
const app = express()
const port = process.env.PORT || 8000

const bcrypt = require('bcryptjs')

// const mentorRoutes = require('../src/routes/mentor')

app.use(express.json())
app.use(cookieParser())

// Configuration
cloudinary.config({
  cloud_name: 'ddx00tzel',
  api_key: '347769777911721',
  api_secret: 'WOTXBpNt2O2HRzHG74anjWulv8E',
})

app.get('/mentor/:id', async (req, res) => {
  const _id = req.params.id
  const mentorDeatils = await mentor.findById(_id)
  res.send(mentorDeatils)
})

app.post('/mentor', auth, type, async (req, res) => {
  try {
    const user = req.user
    // console.log(user)
    const role = user.role
    // console.log(role)
    if (role == 'admin') {
      const mentorRecords = new mentor(req.body)
      const file = req.file
      mentorRecords.photodetail = file.filename
      mentorRecords.photopath = file.path
      // console.log(file)
      cloudinary.uploader.upload(file.path, (err, result) => {
        mentorRecords.photourl = result.url
        mentorRecords.save()
        res.status(200).json({
          message: 'Mentor Data Uploaded',
          status: 'success',
          mentorRecords,
        })
      })
    } else {
      res.status(401).json({
        message: 'You are not allowed to access this route',
        status: 'fail',
      })
    }
  } catch (e) {
    res.send(e)
  }
})

app.patch('/mentor/:id', auth, async (req, res) => {
  try {
    const user = req.user
    const role = user.role
    const userId = user._id
    const _id = req.params.id
    if (role == 'admin') {
      const updateMentor = await mentor.findByIdAndUpdate(_id, req.body)
      res.status(200).json({
        message: `Mentor has been updated`,
        status: 'success',
      })
    } else {
      res.status(401).json({
        message: 'You are not allowed to access this route',
        status: 'fail',
      })
    }
  } catch (error) {
    res.status(401).send(error)
  }
})

app.delete('/mentor/:id', auth, async (req, res) => {
  try {
    const user = req.user
    const role = user.role
    const _id = req.params.id
    if (role == 'admin') {
      const result = await mentor.findByIdAndDelete(_id)
      res.status(200).json({
        message: `Mentor has been deleted`,
        status: 'success',
      })
    } else {
      res.status(401).json({
        message: 'You are not allowed to access this route',
        status: 'fail',
      })
    }
  } catch (error) {
    res.status(401).send(error)
  }
})

// app.use('/mentor', mentorRoutes)

// app.get('/', auth, async (req, res) => {
//   // const user = await admin.auth()
//   // console.log(user)
//   res.send(`'Hello user`)
// })

app.post('/register', async (req, res) => {
  try {
    const password = req.body.pass
    const confirmpassword = req.body.cpass

    if (password == confirmpassword) {
      const registeruser = new admin({
        username: req.body.username,
        pass: req.body.pass,
        tokenCreatedAt: req.body.tokenCreatedAt,
        email: req.body.email,
        role: req.body.role,
      })

      const token = await registeruser.generateAuthToken()

      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 3000000),
        httpOnly: true,
      })

      const registered = await registeruser.save()

      // console.log(registered)
      res.status(201).json({
        message: 'Registered Successfully',
        status: 'success',
      })
    } else {
      res.status(401).json({
        message: 'Password are not same',
        status: 'fail',
      })
    }
  } catch (e) {
    console.log(e)
    res.send(e)
  }
})

// app.post('/forgotpassword', async (req, res) => {
//   // $2a$10$UawbQ / V9ysa5ozLmXCvw7OXsDANTXOyDo8dZOKdh697LW / ds5AIxO
//   try {
//     const username = req.body.username
//     const userDetail = await admin.findOne({ username: username })
//     // console.log(userDetail)
//     if (userDetail != null) {
//       const newpass = req.body.newpassword
//       // console.log(newpass)
//       const confirmpass = req.body.confirmpassword
//       // console.log(confirmpass)
//       if (newpass == confirmpass) {
//         const passwordHash = await bcrypt.hash(newpass, 10)
//         userDetail.pass = passwordHash
//         // userDetail.newpassword = undefined
//         // userDetail.confirmpassword = undefined
//         await userDetail.save()
//         // console.log(userDetail)
//         res.status(201).json({
//           message: 'Password Changed Successfully',
//           status: 'success',
//         })
//       } else {
//         res.status(401).json({
//           message: 'Passwords are not same',
//           status: 'fail',
//         })
//       }
//     } else {
//       res.status(401).json({
//         message: 'User is not registered yet.',
//         status: 'fail',
//       })
//     }
//   } catch (error) {
//     console.log(error)
//     res.send(error)
//   }
// })

// {
//     "username": "anku123",
//     "pass": "190@1990",
//     "cpass":"190@1990",
//     "email": "ankur902@gmail.com",
//     "role": "admin"
// }

// {
//     "username": "ankur123",
//     "pass": "190@19902"
// }

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.pass
    // console.log(password)
    // const passwordHash = await bcrypt.hash(password, 10)
    // console.log(passwordHash)

    const user = await admin.findOne({ username: username })
    // console.log(user)

    if (user != null) {
      const isEqual = await bcrypt.compare(password, user.pass)
      if (isEqual) {
        const token = await user.generateAuthToken()

        res.cookie('jwt', token, {
          expires: new Date(Date.now() + 5000000),
          httpOnly: true,
        })

        res.status(200).json({
          message: 'Login successfull',
          status: 'success',
          token,
        })
      } else {
        res.status(401).json({
          message: 'Wrong Password',
          status: 'Fail',
        })
      }
    } else {
      res.status(401).json({
        message: 'User Not Found',
        status: 'Fail',
      })
    }
  } catch (e) {
    console.log(e)
    res.status(400).send(e)
  }
})

app.get('/logout', auth, async (req, res) => {
  try {
    // console.log(req.user)

    req.user.tokens = req.user.tokens.filter((currElement) => {
      return currElement.token != req.token
    })

    res.clearCookie('jwt')
    // console.log('Loggout Successfully')
    res.status(200).json({
      message: 'Logout successfully',
      status: 'success',
    })
    await req.user.save()
  } catch (error) {
    res.status(500).json({
      message: error,
    })
    console.log(error)
  }
})

app.listen(port, () => {
  console.log('Connected To Express Server')
})
