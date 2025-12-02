import { Row, Col, Button } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import API_BASE_URL from '../config/apiConfig';

function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const resp = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await resp.json();
        console.log('Logout response:', data);
        navigate('/');
    };

    return (
        <>
            <Row className='bg-light p-4  '>
                <Col md={2} className=' p-4 d-flex justify-content-center align-items-center'>
                    {/* TODO */}
                </Col>
                <Col md={8} className='p-4 d-flex justify-content-center align-items-center'>
                    {/* TODO */}
                </Col>
                <Col md={2} className='p-4 d-flex justify-content-center align-items-center'>
                    <Button onClick={handleLogout} className="btn-dark text-light d-flex align-items-center justify-content-center">
                        Logout
                        <BoxArrowRight className="ms-2" />
                    </Button>
                </Col>
            </Row>
        </>
    );
}

export default Header;