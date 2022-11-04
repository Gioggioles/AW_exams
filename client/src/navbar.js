import "./App.css"
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";




function MyNavbar(props) {

    const navigate = useNavigate();

    return <Navbar bg="primary" variant="dark" fixed="top">
            <Container fluid>
                <Navbar.Brand href="#home">
                    <span className="testoNavbar">
                        <kbd className="bg-primary" >CORSI Politecnico di Torino</kbd>
                    </span>
                </Navbar.Brand>

            {props.loggedIn ? (
                <Button variant = "danger">
                    <i className="bi bi-person" onClick={() => props.doLogOut()}>Logout</i>
                </Button>)
                : (<Button variant = "outline-light">
                    <i className="bi bi-person" onClick={() => navigate('/login')}>Login</i>
                </Button>)}

            </Container>
        </Navbar>;

    
}

export default MyNavbar;