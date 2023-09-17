const passport = require('passport');
const bcrypt = require('bcrypt');


module.exports = function (app, myUsers ,myDatabase) {

    app.route('/').get((req, res) => {
        res.render('index.ejs');
    });

    app.route('/api/ques').get((req, res) => {
        myDatabase.find().toArray((err, result)=>{
            if(err){
                console.log(err);
            }else{
                res.json(result);
            }
        })
    }
    );
    app.route('/api/ques/:id').get((req, res) => {
        const id = parseInt( req.params.id );
        myDatabase.findOne({number: id}).then(result=>{
            res.json(result);
        }).catch(err=>{
            console.log(err);
            res.json({error: 'Not found'});
        })
    }
    );


    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
            res.redirect('/profile');
        }
    );

    app.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
    }
    );

    app.route('/profile').get((req, res) => {
        res.json({message: 'Profile page'});
    }
    );

    app.route('/register').post((req, res ,next) => {
       const username = req.body.username;
       const hash = bcrypt.hashSync(req.body.password, 12);

       myUsers.findOne({username: username}, (err, user)=>{
           console.log('hi!');
              if(err){
                console.log(err);
              }else if(user){
                  console.log('user already exists');
                res.redirect('/');
              }else{
                myUsers.insertOne({username: username, password: hash}, (err, doc)=>{
                     if(err){
                         console.log(err);
                          res.redirect('/');
                     }else{
                          next(null, doc.ops[0]);
                     }
                })
              }
       }
         )

    }, passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
            res.json({message: 'Registration successful'});
        }
    );

}