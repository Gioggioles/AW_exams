'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const dao = require('./dao'); // module for accessing the DB
const {check, validationResult, param} = require('express-validator');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');

// init express
const app = new express();
const port = 3001;

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});
// starting from the data in the session, we extract the current (logged-in) user

passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/courses', async (req, res) => {
  try {
      const result = await dao.listCourse(); 
      
      if(result.error){
          res.json(result.error);
          res.status(404).end();
        }
      else
        res.json(result);
        
    } catch(err) {
      res.status(500).json({error: 'Database error'}).end();
    }
});

//GET /exam
app.get('/api/exam', isLoggedIn, async (req, res) => {
  try {
      const result = await dao.listExams(req.user.id); 
      
      if(result.error){
        console.log(result)
          res.json(result.error);
          res.status(404).end();
        }
      else
      
        res.json(result);
        
    } catch(err) {
      res.status(500).json({error: 'Database error'}).end();
    }
});

app.delete('/api/exam', isLoggedIn, async (req, res) => {
  try {
      const result = await dao.deletePiano(req.user.id, -1);       
      res.json(result);
        
    } catch(err) {
      res.status(500).json({error: 'Database error'}).end();
    }
});


app.post('/api/salva',[
 check('lista.*').isLength({min:7, max:7}),
 check('carriera').isInt({min: 0, max: 1}),

],isLoggedIn, async (req, res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  let iniziale = await dao.listExams(req.user.id);
  if(iniziale.error){
    iniziale = [];
  }
   
   let original_tipo = await userDao.getUserById(req.user.id);
   if(original_tipo.error){
    throw original_tipo.error;
  }
  original_tipo = original_tipo.carriera;

  try {
    let tipo=req.body.carriera;
    if(original_tipo!=-1 && original_tipo!=tipo){
      throw("Piano carriera non conforme");
    }
    let lista_corsi = [];
    for (let j of req.body.lista){
       await dao.getCourse(j)
       .then(e => lista_corsi.push(e[0]))
       .catch((err) => {throw err});
    }

    await dao.deletePiano(req.user.id, tipo);

    if(lista_corsi.length!=0){
    
    const cfu = lista_corsi.map(e => e.CFU).reduce((a,b) => a+b);
    if(tipo==1){
      if(cfu< 60 || cfu>80){
        throw("Errore nei CFU");
      }
    }

    else {
      if(cfu< 20 || cfu>40){ 
        throw("Errore nei CFU");
      }
    }
  }
    const prop = lista_corsi.filter(x=> x.propedeuticita!=null).map(e => e.propedeuticita);
    let flag = false;
    prop.forEach(p => {
        if(!lista_corsi.map(e => e.code).includes(p)){
          flag=true;
        }
    });
    if(flag){
      throw("Errore per propedeuticità");
    }
    flag = false;
    const incomp = lista_corsi.filter(x=> x.incompatibilita!=null).map(e => e.incompatibilita);
    incomp.forEach(p => {
      if(lista_corsi.map(e => e.code).includes(p)){
        flag=true;
      }
  });
  if(flag){
    throw("Errore per incompatibilita");
  }

    for (let i of lista_corsi){
      await dao.salvaPiano(i, req.user.id);
       }
      res.status(200).json(true).end();
      
  } catch(err) {
    await dao.deletePiano(req.user.id, original_tipo);
    for (let i of iniziale){
      await dao.salvaPiano(i, req.user.id);
       }

    if(err!="Database error")
      {
        return res.status(400).json({error: err}).end();
      }
    res.status(500).json({error: 'Database error'}).end();
  }


});

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});


app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
  res.status(200).json(req.user);}
else
  res.status(401).json({error: 'Unauthenticated user!'});;
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});




// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
