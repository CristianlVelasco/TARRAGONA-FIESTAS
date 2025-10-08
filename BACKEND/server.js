require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const partiesRouter = require('./routes/parties');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/parties', partiesRouter);

// connect to Mongo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tarragona';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    const port = process.env.PORT || 4000;
    app.listen(port, ()=> console.log(`Backend escuchando en http://localhost:${port}`));
  })
  .catch(err => console.error('Mongo connect error:', err));
