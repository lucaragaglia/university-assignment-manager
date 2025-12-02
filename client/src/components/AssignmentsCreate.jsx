import { useContext, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import AlertContext from '../contexts/AlertContext.jsx';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleButton from './ModuleButton.jsx';

function AssignmentsCreate() {

    const { showAlert } = useContext(AlertContext);

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [question, setQuestion] = useState('');

    useEffect(() => {
        const getStudents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/students`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) return showAlert('danger', data.error);
                setStudents(data.students || []);
            } catch (err) {
                showAlert('danger', err.message);
            }
        };
        getStudents();
    }, []);

    const handleStudentChange = id => {
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (selectedStudents.length < 2 || selectedStudents.length > 6)
            return showAlert('danger', 'The groups must contain between 2 and 6 students');

        if (question.length < 1 || question.length > 100)
            return showAlert('danger', 'The question must be between 1 and 100 characters');

        if (!question.trim())
            return showAlert('danger', 'The question cannot be empty');

        try {
            const res = await fetch(`${API_BASE_URL}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    question,
                    studentIds: selectedStudents
                })
            });
            const data = await res.json();
            if (!res.ok) return showAlert('danger', data.error);
            setQuestion('');
            setSelectedStudents([]);
            showAlert('success', data.message);
        } catch (err) {
            showAlert('danger', err.message);
        }
    };

    return (
        <Form onSubmit={handleSubmit} >
            <ModuleTitle title="Create Assignments" />

            <Row className="bg-light p-4">
                <Col className="d-flex justify-content-center align-items-center">
                    <table>
                        <thead className="fw-bold border-bottom">
                            <tr >
                                <th className="px-3"></th>
                                <th className="px-3">Student</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.studentId} className="border-bottom bg-light">
                                    <td className="px-3">
                                        <Form.Check type="checkbox" checked={selectedStudents.includes(s.studentId)} onChange={() => handleStudentChange(s.studentId)}/>
                                    </td>
                                    <td className="px-3">{s.registrationNumber + ' - ' + s.surname + ' ' + s.name}</td>
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
                            placeholder="Enter your question"
                            value={question}
                            rows={3}
                            onChange={e => setQuestion(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            
            <ModuleButton onSubmit={handleSubmit} />
        </Form>
    );
}

export default AssignmentsCreate;