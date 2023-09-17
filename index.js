'use strict';
require('dotenv').config();
const express = require('express');
// const axios = require('axios');
// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const myDB = require('./connection');
const session = require('express-session');
// const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');
// const ejs = require('ejs');
// const cors = require('cors');


const  app = express();

// const http = require('http').createServer(app);
// const io = require('socket.io')(http);
// const passportSocketIo = require('passport.socketio');
// const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended:true }));
app.use('/public', express.static(__dirname + '/public'));

const port=3000;

const questionSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    options: [
        {
            option: {
                type: String,
            },
            marks: {
                type: Number,
            },
        },
    ],
});

const question = mongoose.model('question', questionSchema);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    key: 'express.sid',
    store: store
}));

const questions = [{
    number: 1,
    title: 'How would you rate your overall physical health?',
    options: [
        { option: 'Excellent', marks: 10 },
        { option: 'Good', marks: 8 },
        { option: 'Fair', marks: 6 },
        { option: 'Poor', marks: 4 }
    ]
},
    {
        number: 2,
        title: 'On average, how many hours of sleep do you get per night?',
        options: [
            { option: 'Less than 6 hours', marks: 5 },
            { option: '6-8 hours', marks: 8 },
            { option: 'More than 8 hours', marks: 7 },
            { option: "I'm not sure", marks: 3 }
        ]
    },
    {
        number: 3,
        title: 'Do you experience any physical health problems regularly?',
        options: [
            { option: 'Yes', marks: 8 },
            { option: 'No', marks: 6 },
            { option: 'Sometimes', marks: 7 }
        ]
    },
    {
        number: 4,
        title: 'How do you usually feel most of the time?',
        options: [
            { option: 'Happy', marks: 8 },
            { option: 'Sad', marks: 4 },
            { option: 'Anxious', marks: 6 },
            { option: 'Angry', marks: 4 },
            { option: 'Other (please specify)', marks: 5 }
        ]
    },
    {
        number: 5,
        title: 'When you feel overwhelmed or stressed, what do you typically do?',
        options: [
            { option: 'Talk to someone about it', marks: 8 },
            { option: 'Keep it to myself', marks: 4 },
            { option: 'Engage in relaxation techniques (e.g., deep breathing)', marks: 7 },
            { option: "I'm not sure", marks: 5 }
        ]
    },
    {
        number: 6,
        title: 'Have you experienced any major life changes recently?',
        options: [
            { option: 'Yes', marks: 8 },
            { option: 'No', marks: 6 },
            { option: "I'm not sure", marks: 5 }
        ]
    },
    ];



myDB(async client=>{
    const myDataBase = await client.db('database').collection('users');
    const myUsers = await client.db('database').collection('userBase');

    // myDataBase.findOne({number: 1}).then(ques=>{
    //     if(!ques){
    //         // myDataBase.insertMany(questions).then(result=>{
    //         //     console.log(result);
    //         // }).catch(err=>{
    //         //     console.log(err);
    //         // })
    //         console.log('No questions found');
    //     }else{
    //         console.log(ques);
    //     }
    // })


    routes(app, myUsers,myDataBase);
    auth(app, myUsers);

}).catch(err=>{
    console.log(err)
    app.route('/').get((req, res) => {
        res.send('Unable to connect to Database.');
    });
})


app.listen(port , ()=>{
    console.log(`Listening on port: ${port}`);
})

