const mongoose = require('mongoose')

mongoose
  .connect('mongodb://localhost:27017/180admin', {
    // useCreateIndex: true,
    useNewUrlParser: true,
    // useUnifiesTopology: true,
  })
  .then(() => {
    console.log('Connected To DB')
  })
  .catch((err) => {
    console.log(err)
  })
