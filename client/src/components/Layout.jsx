import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import AlertContext from '../contexts/AlertContext';
import { useState, useRef } from 'react';

function Layout() {
    const [alert, setAlert] = useState(null);
    const timeoutRef = useRef(null);

    function showAlert(type, message) {
        setAlert({ type, message });
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setAlert(null);
            timeoutRef.current = null;
        }, 4000);
    }

    return (
        <>
            <AlertContext.Provider value={{ alert, showAlert }}>
                <Container fluid className='d-flex flex-column vh-100' >
                    <Header />
                    <Row className='bg-dark flex-grow-1 d-flex' >
                        <Col md={2} className='bg-light p-4  d-flex flex-column justify-content-between'>
                            <Sidebar />
                        </Col>
                        <Col md={10}  className='p-4 d-flex justify-content-center align-items-center'>
                            <Outlet/>
                        </Col>
                    </Row>
                </Container>
            </AlertContext.Provider>
        </>
    );
}

export default Layout;