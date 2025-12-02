import { Row, Col } from 'react-bootstrap';

function ModuleTitle({ text }) {
    return (
        <Row className="bg-light p-4 rounded-bottom">
            <Col className="d-flex justify-content-center align-items-center">
                <p>{text}</p>
            </Col>
        </Row>
    );
}

export default ModuleTitle;