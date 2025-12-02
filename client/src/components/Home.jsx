import { useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import UserContext from '../contexts/UserContext.jsx';

function HomePage() {
    const { user } = useContext(UserContext);

    return (
        <Container fluid>
            <Row>
                <Col className="text-white d-flex justify-content-center align-items-center">
                    <h1>Welcome {user.name}</h1>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;