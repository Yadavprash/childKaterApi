const passport = require('passport');
const bcrypt = require('bcrypt');


module.exports = function (app, myUsers ,myDatabase) {

    app.route('/').get((req, res) => {
        const errorMessage = req.flash('error')[0];
        console.log(errorMessage);
        res.render('index.ejs',{errorMessage});
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


    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/',failureFlash: true, }),
        (req, res, next) => {
            res.redirect('/profile');
        }
    );

    app.route('/login').get(ensureAuthenticated , (req , res)=>{
        res.redirect('/profile');
    })

    app.route('/logout').get((req, res) => {
        req.logout((err) => {
                if (err) {
                    console.error(err);
                }
        res.redirect('/');
    })
    }
    );

    app.route('/profile').get(ensureAuthenticated, (req,res) => {
        res.json({ username: req.user.username  });
    });

    app.route('/register').post((req, res ,next) => {
       const username = req.body.username;
       const hash = bcrypt.hashSync(req.body.password, 12);

       myUsers.findOne({username: username}, (err, user)=>{
           // console.log('hi!');
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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};