import { useContext, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import AlertContext from '../contexts/AlertContext.jsx';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleButton from './ModuleButton.jsx';
import ModuleNothing from './ModuleNothing.jsx';

function AssignmentsEvaluate() {

    const { showAlert } = useContext(AlertContext);

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [score, setScore] = useState('');

    useEffect(() => {
        const loadOpenAssignments = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/assignments/open/teacher`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) return showAlert('danger', data.error);
                setAssignments(data.assignments || []);
            } catch (err) {
                showAlert('danger', err.message);
            }
        };
        loadOpenAssignments();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedAssignment)
            return showAlert('danger', 'An assignment must be selected');

        if (!score || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 30)
            return showAlert('danger', 'The score must be an integer between 0 and 30');

        try {
            const res = await fetch(`${API_BASE_URL}/assignments/${selectedAssignment}/score`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    score: Number(score)
                })
            });
            const data = await res.json();
            if (!res.ok) return showAlert('danger', data.error);
            setAssignments(prev => prev.filter(a => a.assignmentId !== selectedAssignment));
            setSelectedAssignment(null);
            setScore('');
            showAlert('success', 'Assignment evaluated!');
        } catch (err) {
            showAlert('danger', err.message);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <ModuleTitle title="Evaluate Assignments" />

            {assignments.length === 0 ? (
                <ModuleNothing text="You have already evaluated all assignments" />
            ) : (
                <>
                    <Row className="bg-light p-4">
                        <Col className="d-flex justify-content-center align-items-center">
                            <table>
                                <thead className="fw-bold border-bottom">
                                    <tr>
                                        <th className="px-3"></th>
                                        <th className="px-3">ID</th>
                                        <th className="px-3">Question</th>
                                        <th className="px-3">Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((a) => (
                                        <tr key={a.assignmentId} className="border-bottom">
                                            <td className="px-3">
                                                <Form.Check
                                                    type="radio"
                                                    name="selectedAssignment"
                                                    checked={selectedAssignment === a.assignmentId}
                                                    onChange={() => setSelectedAssignment(a.assignmentId)}
                                                />
                                            </td>
                                            <td className="px-3">{a.assignmentId}</td>
                                            <td className="px-3">{a.question}</td>
                                            <td className="px-3">{a.answer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Col>
                    </Row>

                    <Row className="p-4 bg-light">
                        <Col>
                            <Form.Group>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    max={30}
                                    placeholder="Enter your score"
                                    value={score}
                                    onChange={e => setScore(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <ModuleButton onSubmit={handleSubmit} />
                </>
            )}
        </Form>
    );
}

export default AssignmentsEvaluate;