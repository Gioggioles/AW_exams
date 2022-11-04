'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('db.sqlite', (err) => {
  if(err) throw err;
});

// get all films
exports.listCourse = () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT corsi.codice, nome, CFU, MaxStudenti, Incompatibilita, Propedeuticita, COUNT(pianodidattico.codice) AS StudentiIscritti FROM corsi LEFT JOIN pianodidattico ON corsi.codice = pianodidattico.codice GROUP BY corsi.codice, nome, CFU, MaxStudenti, Incompatibilita, Propedeuticita ORDER BY nome';
      db.all(query, [], (err, rows) => {
        if (err) {
            reject(err);
            return;
        }
        if (rows.length == 0) {
            resolve({error: 'Courses not found.'});
        } else {
          
            const corsi = rows.map(el => ({code: el.codice, name: el.nome, CFU: el.CFU, maxstudenti: el.MaxStudenti, incompatibilita: el.Incompatibilita, propedeuticita: el.Propedeuticita, studentiIscritti: el.StudentiIscritti}));
            resolve(corsi);
        }
      });
    });
  };

  exports.getCourse = (code) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT codice, nome, CFU, Incompatibilita, Propedeuticita FROM corsi  WHERE codice = ?';
      db.all(query, [code], (err, rows) => {
        if (err) {
            reject(err);
            return;
        }
        if (rows.length == 0) {
            reject("Codice dell'esame sbagliato / Codice esame inesistente");
            return;
        } else {
          
            const corsi = rows.map(el => ({code: el.codice, name: el.nome, CFU: el.CFU, incompatibilita: el.Incompatibilita, propedeuticita: el.Propedeuticita}));
            resolve(corsi);
        }
      });
    });
  };

  // get all films
exports.listExams= (user) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT corsi.codice, id, nome, CFU, Propedeuticita  FROM pianodidattico, corsi WHERE pianodidattico.id = ? AND pianodidattico.codice=corsi.codice';
    db.all(query, [user], (err, rows) => {
      if (err) {
          reject(err);
          return;
      }
      if (rows.length == 0) {
          resolve({error: 'Exam not found.'});
      } else {
          const esami = rows.map(el => ({code: el.codice, id: el.id, name: el.nome, CFU: el.CFU, propedeuticita: el.Propedeuticita}));
          resolve(esami);
      }
    });
  });
};

exports.deletePiano = (userId, carriera) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM pianodidattico WHERE id = ? ';
    db.all(query, [userId], (err, rows) => {
      if (err) {
          reject(err);
          return;
      }
    });
    const query_2 = 'UPDATE studenti SET tempo = ?  WHERE id = ? ';
    db.all(query_2, [carriera, userId], (err, rows) => {
      if (err) {
          reject(err);
          return;
      }
       else {
          resolve(true);
      }
    });
  });
};


exports.salvaPiano = (esame, userId) =>{
 return new Promise((resolve, reject) => {
  const query_2 = 'SELECT COUNT(pianodidattico.codice) AS Numero, corsi.MaxStudenti FROM corsi LEFT JOIN pianodidattico ON corsi.codice = pianodidattico.codice WHERE corsi.codice = ? GROUP BY corsi.codice, MaxStudenti';
  db.all(query_2, [esame.code], (err, rows) => {
    if (err) {
        reject(err);
        return;
    }
    if(rows.length==0){
      reject("Codice dell'esame sbagliato / Codice esame inesistente");
      return;
    }

    if((rows[0].Numero>=rows[0].MaxStudenti) && rows[0].MaxStudenti!= null){
      reject(`Corso Pieno ${esame.code}`);
      return;
    }

  });
  const query = 'INSERT INTO pianodidattico(codice, id) VALUES(?, ?)';
  db.all(query, [esame.code, userId], (err, rows) => {
    if (err) {
        reject(err);
        return;
    }
    else{
      resolve(true);

    }

  });

 });

}
