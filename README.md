# Exam #1: "Piano di studi"
## Student: s295474 ORIOLES GIORGIO 

## React Client Application Routes

- Route `/`: pagina iniziale con i corsi del Politecnico visibili
- Route `/login`: pagina per il login
- Route `/logged`: pagina con i corsi del Politecnico e il proprio piano di studi

## API Server

- DELETE `/api/exam`
  - request body content: credenziali
  - response body content: true o messaggio d'errore
- GET `/api/courses`
  - request body content: None
  - response body content: Lista dei corsi
- GET `/api/exam`
  - request body content: credenziali
  - response body content: Lista del piano didattico
- POST `/api/salva`
  - request body content: lista degli esami da caricare, credenziali, piano carriera
  - response body content: Informazione di terminazione
- POST `/api/sessions`
  - request body content: credenziali
  - response body content: Info utente
- DELETE `/api/sessions/current`
  - request body content: credenziali
  - response body content: true o messaggio d'errore
- GET `/api/sessions/current`
  - request body content: credenziali
  - response body content: Info utente


## Database Tables

- Table `studenti` - contains: id(primary key), email, password, name, salt, tempo
- Table `pianodidattico` - contains: codice(chiave esterna di corsi.codice), id(chiave esterna di studenti.id)
- Table `corsi` - codice(primary key), nome, CFU, MaxStudenti, Incompatibilita, Propedeuticita

## Main React Components

- `MyTable` (in `App.js`): componente che gestisce la stampa delle tabelle in stato login e non login
- `DisplayTable` (in `Table.js`): componente che stampa la tabella dei corsi del Politecnico
- `MyTableStudent` (in `Table.js`): componente che stampa la tabella dei miei esami del piano didattico
- `MyNavbar` (in `navbar.js`): componente che gestisce la navbar e i pulsanti login e logout
- `LoginForm` (in `LoginComponent.js`): componente per fare il login

(only _main_ components, minor ones may be skipped)

## Screenshot

![HomePage](./HomePage.jpg)
![Login](./Login.jpg)
![Logged](./Loggato.jpg)

## Users Credentials

- alice.biondi@studenti.polito.it, password:"password", carriera: part-time
- rossella.parisi@studenti.polito.it, password:"password", carriera: part-time
- sara.silvestro@studenti.polito.it, password:"password",  carriera: full-time
- carlotta.dangelo@studenti.polito.it, password:"password", carriera: part-time
- giorgio.orioles@studenti.polito.it, password:"password", carriera: full-time
- giulia.russo@studenti.polito.it, password:"password", carriera: part-time
