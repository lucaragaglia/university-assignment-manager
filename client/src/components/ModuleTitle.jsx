import { Row, Col } from 'react-bootstrap';

function ModuleTitle({ title }) {
    return (
        <Row className="bg-light p-4 rounded-top">
            <Col className="d-flex justify-content-center align-items-center">
                <h1>{title}</h1>
            </Col>
        </Row>
    );
}

export default ModuleTitle;