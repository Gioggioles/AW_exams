const URL = 'http://localhost:3001/api'

async function getAllCourses() {
  const response = await fetch((URL+'/courses'));
  const coursesJson = await response.json();
  if (response.ok) {
    if(coursesJson != "Content Not Found" && coursesJson != "Courses not found."){
      
    return coursesJson.map((course) => ({code: course.code, name: course.name, CFU: course.CFU, maxstudenti: course.maxstudenti, incompatibilita: course.incompatibilita, propedeuticita: course.propedeuticita, studentiIscritti: course.studentiIscritti }) )
    }
    else{
      throw coursesJson;
    }

  } else {
    throw coursesJson;  
  }
}

async function deletePiano(){
  const response = await fetch( URL + '/exam', { method: 'DELETE', credentials: 'include' });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {    
    throw userInfo;  // an object with the error coming from the server
  }
}

async function salvaPiano(carriera, lista){
    const response_2 = await fetch( URL + '/salva', { method: 'POST', credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify({lista: lista, carriera: carriera})});
    const ritornoPut = await response_2.json();
    if(response_2.ok){
      return ritornoPut;
    }
    else{
     throw ritornoPut;
    }
  }

  async function getAllExam() {
    const response = await fetch((URL+'/exam'), {credentials: 'include'});
    const examsJson = await response.json();
    if (response.ok) {
      if(examsJson != "Content Not Found" && examsJson != "Exams not found."){
      return examsJson.map((e) => ({code: e.code, id: e.id, name: e.name, CFU: e.CFU, propedeuticita: e.propedeuticita}) )
      }
      else{
        throw examsJson;
      }
  
    } else {
      throw examsJson;  
    }
  }

  async function logIn(credentials) {
    let response = await fetch(URL + '/sessions', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      const errDetail = await response.json();
      throw errDetail.message;
    }
  }
  
  async function logOut() {
    await fetch( URL + '/sessions/current', { method: 'DELETE', credentials: 'include' });
  }
  
  async function getUserInfo() {
    const response = await fetch(URL + '/sessions/current', {credentials: 'include'});
    const userInfo = await response.json();
    if (response.ok) {
      
      return userInfo;
    } else {
      
      throw userInfo;  // an object with the error coming from the server
    }
  }

const API = {getUserInfo, getAllCourses, logIn, logOut, getAllExam, deletePiano, salvaPiano}
export default API;
