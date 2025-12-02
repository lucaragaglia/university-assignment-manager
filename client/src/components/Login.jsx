import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useState, useContext } from 'react';
import UserContext from '../contexts/UserContext.jsx';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleNothing from './ModuleNothing.jsx';

function LoginPage() {

    const { user, setUser } = useContext(UserContext);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ registrationNumber, password })
            });
            if (response.ok) {
                const res = await fetch(`${API_BASE_URL}/session`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const sessionData = await res.json();
                const userData = sessionData.user;
                setUser(userData);
                navigate('/home');
            } else {
                const err = await response.json();
                setError(err.error);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred while logging in. Please try again.');
        }
    };

    return (
        <Container fluid className='d-flex flex-column vh-100' >
            <Row className='bg-dark flex-grow-1 d-flex' >
                <Col className='p-4 d-flex justify-content-center align-items-center'>
                    <Form onSubmit={handleSubmit}>

                        <ModuleTitle title="Login" />

                        <Row className="bg-light p-4">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Registration number</Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={registrationNumber}
                                        onChange={e => setRegistrationNumber(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="bg-light p-4">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type='password'
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="bg-light p-4">
                            <Col className="d-flex justify-content-center align-items-center">
                                <Button type="submit" variant="primary" onClick={handleSubmit} className="w-100">
                                    Submit
                                </Button>
                            </Col>
                        </Row>

                        {error ? (
                            <ModuleNothing text={error} />
                        ) : (
                            <ModuleNothing text="" />
                        )}

                    </Form>
                </Col>
            </Row>
        </Container >

    );
}

export default LoginPage;