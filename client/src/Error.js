"use strict";
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Error()  {

    const navigate = useNavigate();

    return <>
        <div className="row justify-content-center">
            <div className="col-md-12 col-sm-12">
                <div className="card shadow-lg border-0 rounded-lg mt-5 mx-auto">
                    <h3 className="card-header display-1 text-muted text-center">
                        404
                    </h3>

                    <span className="card-subtitle mb-2 text-muted text-center">
                        Form Could Not Be Found
                    </span>

                    <div className="card-body mx-auto">
                        <Button className="btn btn-sm btn-info text-white button-error" onClick={() => navigate('/')} >Return Home</Button>

                    </div>
                </div>
            </div>
        </div>
    </>
}

export default Error;