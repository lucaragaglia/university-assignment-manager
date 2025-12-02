import { useEffect, useState, useContext } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import AlertContext from '../contexts/AlertContext';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleButton from './ModuleButton.jsx';
import ModuleNothing from './ModuleNothing.jsx';

function AssignmentEvaluate() {
    const { showAlert } = useContext(AlertContext);

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [answers, setAnswers] = useState({});

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/assignments/open/student`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) return showAlert('danger', data.error);

            setAssignments(data.assignments || []);
            const initial = {};
            assignments.forEach((a) => { initial[a.assignmentId] = a.answer || ''; });
            setAnswers(initial);
        } catch (err) {
            showAlert('danger', err.message);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleChange = (value) => {
        if (selectedAssignment)
            setAnswers((prev) => ({ ...prev, [selectedAssignment]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedAssignment) return showAlert('danger', 'You must select an assignment');

        if (answers[selectedAssignment]?.length < 1 || answers[selectedAssignment]?.length > 100)
            return showAlert('danger', 'The answer must be between 1 and 100 characters');

        if (!answers[selectedAssignment]?.trim())
            return showAlert('danger', 'The answer cannot be empty');

        try {
            const resp = await fetch(`${API_BASE_URL}/assignments/${selectedAssignment}/answer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ answer: answers[selectedAssignment] }),
            });

            const data = await resp.json();
            if (!resp.ok) return showAlert('danger', data.error);
            showAlert('success', 'Assignment replied!');
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (err) {
            showAlert('danger', err.message);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <ModuleTitle title="Answer Assignments" />

            {assignments.length === 0 ? (
                <ModuleNothing text="You have already answered to all assignments" />
            ) : (
                <>
                    <Row className="p-4 bg-light">
                        <Col className="d-flex justify-content-center align-items-center">
                            <table>
                                <thead className="fw-bold border-bottom">
                                    <tr>
                                        <th className="px-3"></th>
                                        <th className="px-3">ID</th>
                                        <th className="px-3">Teacher</th>
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
                                            <td className="px-3">
                                                {a.registrationNumber + ' - ' + a.name + ' ' + a.surname}
                                            </td>
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
                                    as="textarea"
                                    rows={3}
                                    value={answers[selectedAssignment] || ''}
                                    onChange={(e) => handleChange(e.target.value)}
                                    placeholder="Enter the answer"
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

export default AssignmentEvaluate;