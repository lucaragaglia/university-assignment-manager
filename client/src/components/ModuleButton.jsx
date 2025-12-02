import { Row, Col, Button } from 'react-bootstrap';

function ModuleButton({ onSubmit }) {
    return (
        <Row className="bg-light p-4 rounded-bottom">
            <Col className="d-flex justify-content-center align-items-center">
                <Button type="submit" variant="primary" onClick={onSubmit}  className="w-100">
                    Submit
                </Button>
            </Col>
        </Row>
    );
}

export default ModuleButton;