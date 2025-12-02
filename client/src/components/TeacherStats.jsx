import { useContext, useState, useEffect } from 'react';
import { Form, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import AlertContext from '../contexts/AlertContext.jsx';
import API_BASE_URL from '../config/apiConfig.js';

import ModuleTitle from './ModuleTitle.jsx';
import ModuleNothing from './ModuleNothing.jsx';

function TeacherStats() {
    const { showAlert } = useContext(AlertContext);
    const [stats, setStats] = useState([]);
    const [sortBy, setSortBy] = useState('alphabetical');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stats/teacher`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) return showAlert('danger', data.error);
                setStats(data.stats || []);
            } catch (err) {
                showAlert('danger', err.message);
            }
        };
        loadStats();
    }, []);

    const handleSortChange = (criteria) => {
        setSortBy(criteria);
        const sortedStats = [...stats];
        if (criteria === 'alphabetical') {
            sortedStats.sort((a, b) => {
                const nameComparison = a.surname.localeCompare(b.surname);
                return nameComparison !== 0 ? nameComparison : a.registrationNumber - b.registrationNumber;
            });
        } else if (criteria === 'assignments') {
            sortedStats.sort((a, b) => {
                const assignmentsComparison = (b.openAssignments + b.closedAssignments) - (a.openAssignments + a.closedAssignments);
                return assignmentsComparison !== 0 ? assignmentsComparison : a.registrationNumber - b.registrationNumber;
            });
        } else if (criteria === 'averageScore') {
            sortedStats.sort((a, b) => {
                const scoreComparison = b.averageScore - a.averageScore;
                return scoreComparison !== 0 ? scoreComparison : a.registrationNumber - b.registrationNumber;
            });
        }
        setStats(sortedStats);
    };

    const SortButton = ({ criteria, text }) => (
        <Button
            className={`${sortBy === criteria ? 'bg-dark text-white' : 'bg-light text-dark'} border-0`}
            onClick={() => handleSortChange(criteria)}
        >
            {text}
        </Button>
    );

    return (
        <div>
            <ModuleTitle title="Stats" />


            <Row className="bg-light p-4">
                <Col className="d-flex justify-content-center">
                    <Form.Group>
                        <ButtonGroup>
                            <SortButton criteria="alphabetical" text="Alphabetical" />
                            <SortButton criteria="assignments" text="Total Assignments" />
                            <SortButton criteria="averageScore" text="Average Score" />
                        </ButtonGroup>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="bg-light p-4">
                <Col className="d-flex justify-content-center align-items-center">
                    <table>
                        <thead className="fw-bold border-bottom">
                            <tr>
                                <th className="px-3">Student</th>
                                <th className="px-3">Open</th>
                                <th className="px-3">Closed</th>
                                <th className="px-3">Total</th>
                                <th className="px-3">Average Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((s) => (
                                <tr key={s.studentId} className="border-bottom">
                                    <td className="px-3">{`${s.registrationNumber} - ${s.surname} ${s.name}`}</td>
                                    <td className="px-3">{s.openAssignments}</td>
                                    <td className="px-3">{s.closedAssignments}</td>
                                    <td className="px-3">{s.openAssignments + s.closedAssignments}</td>
                                    <td className="px-3">{s.averageScore.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Col>
            </Row>
            <ModuleNothing />

        </div>
    );
}

export default TeacherStats;