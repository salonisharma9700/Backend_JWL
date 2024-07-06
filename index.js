const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config(); 

const uploadRoutes = require('./routes/api'); 

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// app.use(cors({
//     // origin: ['http://localhost:3000', 'http://localhost:3001',
//     //     'https://joy-with-learning-v2.vercel.app'],
//     origin: 'https://joy-with-learning-v2.vercel.app',
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));



app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const mongoURI = process.env.MONGO_URI;
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log(err));

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', uploadRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
