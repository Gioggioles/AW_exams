'use strict'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Col, Container, Row, Alert } from 'react-bootstrap';
import MyTable from './Table.js';
import Error from './Error'
import { LoginForm } from './LoginComponents';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import API from './API';

function App() {  
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {

  const [courses, setCourse] = useState([]);
  const [exam, setExam] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [messageTrue, setMessageTrue] = useState('');
  const [CFU, setCFU] = useState(0);
  const [incomp, setIncomp] = useState([]);
  const [proped, setProped] = useState([]);
  const [carriera, setCarriera] = useState(-1);
  const [dirty, setDirty] = useState(false);

  const navigate = useNavigate();

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        // TODO: store them somewhere and use them, if needed
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        console.log(err)
      }
    };
    checkAuth();
  }, []);


  useEffect(()=> {
   API.getAllCourses()
   .then( (courses) =>{
     setCourse(courses);
     setInitialLoading(false);
   })
   .catch( err => {
     setCourse([]);
   })
  }, [loggedIn, dirty]);


  useEffect(()=> {
    API.getAllExam()
    .then( (exam) =>{
      setExam(exam);
         let esami_somma = exam.map(e => e.CFU).reduce((a,b) => a+b, 0);
      if(esami_somma==0){
          esami_somma = null;
      }
      setCFU(esami_somma);
      setInitialLoading(false);
    })
    .catch( err => {
      setCFU(null);
      setExam([]);
    })
   }, [loggedIn]);


   useEffect(() =>{
    setIncomp(checkIncompatibilita());
    setProped(checkPropedeuticita());
   },[exam.length, loggedIn, proped.length, incomp.length]);


  const cancellaModifiche =async () => {  
 await API.getAllExam()
    .then( (exam) =>{
      setExam(exam);
         let esami_somma = exam.map(e => e.CFU).reduce((a,b) => a+b, 0);
      if(esami_somma==0){
          esami_somma = null;
      }
      setCFU(esami_somma);
    })
    .catch( err => {
      setCFU(null);
      setExam([]);
    });

    API.getUserInfo()
      .then( user => {
        setUser(user);
        setCarriera(user.carriera);
      })
      .catch(err => {      
        setMessage(err);
      }
        );
        setIncomp([]);
        setProped([]);
      
  }


  const eliminaPiano = async() => { 
    await API.deletePiano();
    await API.getUserInfo()
    .then( user => {
      setUser(user);
      setCarriera(user.carriera);
    })
    .catch(err => {      
      setMessage(err);
    }
      );
    setDirty(old => !old);
    setCarriera(-1);
    setCFU(null);
    setIncomp([]);
    setProped([]);
    setExam([]); 

    }

const salvaPiano = async () => {
  if(user.carriera==1){
    if(CFU>=60 && CFU<=80){
     await API.salvaPiano(user.carriera, exam.map(e => e.code))
      .then(() =>  {setDirty(old => !old);
        setMessageTrue("PIANO SALVATO");})
      .catch(err => {setMessage(err.error);});
    }
    else{
      setMessage("Inserire numero di CFU tra 60 e 80");
    }
  }
  else if(user.carriera==0){
    if(CFU>=20 && CFU<=40){
      await API.salvaPiano(carriera, exam.map(e => e.code))
      .then(() =>  {setDirty(old => !old);
        setMessageTrue("PIANO SALVATO");})
      .catch(err =>{setMessage(err.error);});
        }
    else{
      setMessage("Inserire numero di CFU tra 20 e 40");
    }
  }
  else{
    setMessage("Inserire tipologia piano carriera prima di salvare il piano didattico");
  }
  
 }


  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setLoggedIn(true);
        setUser(user);
        setCarriera(user.carriera);
        setMessage('');
        setMessageTrue('');
        navigate('/logged');
      })
      .catch(err => {
      
        setMessage(err);
      }
        )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setIncomp([]);
    setProped([]);
    setExam([]);
    setCarriera(-1);
    navigate('/');

  }

  const addExam = (corso) => {
     if(!exam.find(e => e.code==corso.code)){
    const newCorso = {code: corso.code, name: corso.name, id: user.id, CFU: corso.CFU, propedeuticita: corso.propedeuticita};
    setCFU(() => CFU + corso.CFU);
    setExam(oldExam => [...oldExam, newCorso]);
    }
  }

  const deleteExam = (corso) => {
    let flag = false;
    exam.forEach(e => {
      if(e.propedeuticita==corso.code)
        flag = true;
    });

    if(flag)
     setMessage("Impossibile togliere tale esame a causa della propeduticità")
     else{
    setExam( exam => exam.filter( e => (e.code !== corso.code)));
    setCFU(() => CFU - corso.CFU);
     }
  }

  const checkIncompatibilita = () =>{
    const incompatibili = [];
    const exam_code = exam.map(e => e.code);
    exam_code.forEach(e => {
       courses.forEach(c => { 
        if(c.code == e){
          if(c.incompatibilita!=null){
          const aggiungi = c.incompatibilita.split("-");
          for (const a of aggiungi){
          incompatibili.push(a);
          }
          }
        }
       });
    });
    return incompatibili;
  }

  const checkPropedeuticita = () =>{
    const propedeutici = [];
    const exam_codice = exam.map(e => e.code);
     courses.forEach(c => {
      if(!exam_codice.find(e => e==c.propedeuticita)  && loggedIn && c.propedeuticita!=null ){
          propedeutici.push(c.code);        
      }
    });
    return propedeutici;
  }

  return (
    <>
   <Container fluid className="App">
        <Container>
         <Row><Col>
               {message ? <Alert className = "below-nav" variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
                {messageTrue ? <Alert className = "below-nav" variant='success' onClose={() => setMessageTrue('')} dismissible>{messageTrue}</Alert> : false}
          </Col></Row>
        </Container>
              <Routes>
                <Route path='/' element={
                    initialLoading ? <Loading />:
                    <MyTable carriera={carriera} addExam={addExam} proped={proped} incomp={incomp} CFU={CFU} setCFU={setCFU} deleteExam={deleteExam} course={courses} loggedIn={loggedIn} doLogIn={doLogIn} doLogOut={doLogOut} user={user} exams={exam}/>} />
                <Route path='/logged' element={loggedIn ? <MyTable salvaPiano={salvaPiano} eliminaPiano={eliminaPiano} cancellaModifiche={cancellaModifiche} setUser={setUser} carriera={carriera} setCarriera={setCarriera} proped={proped} CFU={CFU} incomp={incomp} setCFU={setCFU} deleteExam={deleteExam} addExam={addExam} exams={exam} course={courses} loggedIn={loggedIn} doLogIn={doLogIn} doLogOut={doLogOut} user={user}/> : <Navigate to='/login' />} />  
                <Route path='/login' element={loggedIn ? <Navigate to='/logged' /> : <LoginForm login={doLogIn} />} />
                <Route path='/*' element={<Error />}/> 
              </Routes>
    </Container>
    </>
  ) 

} 

function Loading(props) {
  return (
    <h2>Loading data ...</h2>
  )
}

export default App;
