import { useContext, useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import AlertContext from '../contexts/AlertContext.jsx';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleNothing from './ModuleNothing.jsx';

function StudentStats() {
    const { showAlert } = useContext(AlertContext);
    const [stats, setStats] = useState({ assignments: [], averageScore: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stats/student`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) return showAlert('danger', data.error);
                setStats(data.stats || { assignments: [], averageScore: 0 });
            } catch (err) {
                showAlert('danger', err.message);
            }
        };
        loadStats();
    }, []);

    return (
        <div>
            <ModuleTitle title="Stats" />

            {stats.assignments.length === 0 ? (
                <ModuleNothing text="Complete an assignment to see stats" />
            ) : (
                <>
                    <Row className="bg-light p-4">
                        <Col className="d-flex justify-content-center align-items-center">
                            <p>Overall Average Score: {stats.averageScore.toFixed(2)}</p>
                        </Col>
                    </Row>

            <Row className="bg-light p-4">
                <Col className='d-flex justify-content-center align-items-center'>
                    <table>
                        <thead className="fw-bold border-bottom">
                            <tr>
                                <th className="px-3">ID</th>
                                <th className="px-3">Teacher</th>
                                <th className="px-3">Question</th>
                                <th className="px-3">Answer</th>
                                <th className="px-3">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.assignments.map((a) => (
                                <tr key={a.assignmentId} className="border-bottom bg-light">
                                    <td className="px-3">{a.assignmentId}</td>
                                    <td className="px-3">{`${a.teacherRegistrationNumber} - ${a.teacherSurname} ${a.teacherName}`}</td>
                                    <td className="px-3">{a.question}</td>
                                    <td className="px-3">{a.answer}</td>
                                    <td className="px-3">{a.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Col>
            </Row>

            <ModuleNothing />
            </>
            )}  
        </div>
    );
}

export default StudentStats;