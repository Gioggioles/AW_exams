"use strict";
import './App.css';
import { Table, Button, Container, Row, Alert} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from './navbar'; 

import { useEffect} from 'react';



function MyTable(props){  

    return <>
     <MyNavbar loggedIn={props.loggedIn} doLogIn = {props.doLogIn} doLogOut = {props.doLogOut}/>
        <Row className = "pt-5 h-100 below-nav">
             <Container className="col-md-9 fluid">
             <DisplayTable incomp={props.incomp} proped={props.proped} addExam={props.addExam} corsi={props.course} loggedIn={props.loggedIn} carriera={props.carriera}/>
             {props.loggedIn ? (
             <><h3>Welcome {props.user.name} </h3>
            {props.carriera==-1 ?<Alert variant='warning'>Seleziona un piano di studi prima di riempirlo</Alert> : null}
             <MyTableStudent setUser={props.setUser} carriera={props.carriera} setCarriera={props.setCarriera} incomp={props.incomp} exams={props.exams} user={props.user} deleteExam={props.deleteExam} CFU={props.CFU} setCFU={props.setCFU} proped={props.proped}/>
              {props.carriera!=-1 ? (<>
             <Button type="submit" className = "btn btn-success" onClick={() => {props.salvaPiano() }}>Salva</Button>
             <Button className = "btn btn-danger" onClick={() => {props.eliminaPiano()}}>Cancella</Button>
             </>) : null}
             <span style={{"paddingLeft": "79%"}}><Button type="reset" className = "btn btn-secondary" onClick={() => {props.cancellaModifiche()}}>Annulla</Button></span>
             </>
        ): null }
            </Container>
        </Row>
    </>
}

function MyTableStudent(props){

    const handleSubmit_pt = (event) => {
        event.preventDefault();
        props.setCarriera(0);
        props.setCFU(0);  
        props.setUser((u) =>{return {id: u.id, username: u.username, name: u.name, carriera: 0};});  
    }


    const handleSubmit_ft = (event) => {
        event.preventDefault();
        props.setCarriera(1);
        props.setCFU(0);
        props.setUser((u) =>{return {id: u.id, username: u.username, name: u.name, carriera: 1};});  
    }
    
    return <>
            <Table hover striped>
            <thead>
                    <tr>
                        <th>Id: {props.user.id}</th>
                        {(props.CFU!=null) ?
                        <>
                        <th>CFU Totali: {props.CFU}</th> 
                        </> 
                         :<th>CFU Totali :0</th>
                        }
                         {(props.carriera!=-1) ? (
                            props.carriera ? 
                          <th>Carriera full-time (60 to 80)</th>
                            :
                          <th>Carriera part-time(20 to 40)</th>
                        )
                        : <>
            <Button  className="btn btn-warning" onClick={handleSubmit_pt} >Part-Time</Button> 
            <Button  className="btn btn-warning" onClick={handleSubmit_ft} >Full-Time</Button>                     
            </>}               
                    </tr>
                    <tr>
                        <th>Codice</th>
                        <th>Nome</th>
                    </tr>
                </thead>
                <tbody>
                <PianoDidattico proped={props.proped} incomp={props.incomp} exams={props.exams} deleteExam={props.deleteExam}/>
                </tbody>
            </Table>
    </>
}

function DisplayTable(props) {

    return <>
            <Table hover striped>
            <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Nome</th>
                            <th>CFU</th>
                            <th>MaxStudenti</th>
                            <th>StudentiIscritti</th>
                        </tr>
                    </thead>
                <tbody>
                <Tabella carriera={props.carriera} incomp={props.incomp} proped={props.proped} addExam={props.addExam} corsi={props.corsi} loggedIn={props.loggedIn}/>                    
                </tbody>
            </Table>
    </>
}

function PianoDidattico(props){
    return <>{props.exams.map((e) => <tr><TabellaEsami key={e.code} exams={e} deleteExam={props.deleteExam} incomp={props.incomp} proped={props.proped}/></tr>)}</>

}
function TabellaEsami(props){

    return (
        <>        
            <td>{props.exams.code}</td>
            <td>{props.exams.name}</td>
            <td><Button variant='outline-danger' onClick={() => { props.deleteExam(props.exams); }}><i className='bi bi-trash3'></i></Button></td>
        </>
    );

}

function Tabella(props){
    return <>{props.corsi.map((f) => <TabellaCorsi carriera={props.carriera} proped={props.proped} incomp={props.incomp} key={f.code} corsi={f} addExam={props.addExam} loggedIn={props.loggedIn}/>)}</>
}

function TabellaCorsi(props){
    const [flag, setFlag] = useState(false);
    const [flag_incomp, setFlag_incomp] = useState(true);
    const [flag_prop, setFlag_prop] = useState(true);


    useEffect(() => {
        if(props.incomp.find(e => e==props.corsi.code)){
            setFlag_incomp(false);}
            else{
                setFlag_incomp(true);
            }
            if(props.proped.find( p => p==props.corsi.code)){
                setFlag_prop(false);
            }
            else{
                setFlag_prop(true);
            }
    }, [flag_incomp, props.loggedIn, props.incomp.length, props.proped.length, flag_prop]);
    

    return ( <>
        { flag_incomp && flag_prop ?  <> 
             <tr>
                <td>{props.corsi.code}</td>
                <td>{props.corsi.name}</td>
                <td>{props.corsi.CFU}</td>
                <td>{props.corsi.maxstudenti}</td>   
                <td>{props.corsi.studentiIscritti}</td>
                <td><Button onClick={() => {setFlag((old) =>!old )}}>Info</Button></td>
                {props.loggedIn && props.carriera!=-1? 
                <td><Button className='mx-3 btn btn-success' onClick={() => {props.addExam(props.corsi)}}><i className='bi bi-plus-circle'></i></Button></td>
                : null }
                </tr>
               {flag ? (<tr className='table-info'><td>Incompatibilita: {props.corsi.incompatibilita}</td><td>Propedeuticita: {props.corsi.propedeuticita}</td></tr>)
               : null}
            </>
             : <> 
             <tr className={`${flag_prop ? "colore_2": "colore"}`}>
                <td>{props.corsi.code}</td>
                <td>{props.corsi.name}</td>
                <td>{props.corsi.CFU}</td>
                <td>{props.corsi.maxstudenti}</td>
                <td>{props.corsi.studentiIscritti}</td>
                <td><Button onClick={() => {setFlag((old) =>!old )}}>Info</Button></td>
                {props.loggedIn && props.carriera!=-1 ? <> 
                <td><Button className='mx-3 btn btn-success' onClick={() => {props.addExam(props.corsi)}} disabled><i className='bi bi-plus-circle'></i></Button></td>
                <td className='text-warning'>{flag_prop ? "Problema di Incompatibilità" : "Problema di Propedeuticità"}</td>
                </> : null }
                </tr>
               {flag ? (<tr className='table-info'><td>Incompatibilita: {props.corsi.incompatibilita}</td><td>Propedeuticita: {props.corsi.propedeuticita}</td></tr>)
               : null}
            </>}</>
    );

}

export default MyTable;
