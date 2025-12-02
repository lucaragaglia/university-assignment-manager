import { Nav, Alert } from 'react-bootstrap';
import { House, FileEarmarkPlus, Check2Circle, ClipboardData } from 'react-bootstrap-icons';
import { NavLink } from 'react-router';
import { useContext } from 'react';
import AlertContext from '../contexts/AlertContext';
import UserContext from '../contexts/UserContext';

function Sidebar() {
    const { alert } = useContext(AlertContext);
    const { user } = useContext(UserContext);

    return (
        <>
            <Nav className="flex-column">
                <NavLink
                    to="/home"
                    className={({ isActive }) =>`
                        nav-link d-flex align-items-center p-3 rounded-top ${
                            isActive ? 'bg-dark text-light' : 'bg-light text-dark'
                        }`
                    }
                >
                    <House className="me-2" /> Home
                </NavLink>

                {user?.role === 'Teacher' && (
                    <>
                        <NavLink
                            to="/teacher/assignments/create"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center p-3 ${
                                    isActive ? 'bg-dark text-light' : 'bg-light text-dark'
                                }`
                            }
                        >
                            <FileEarmarkPlus className="me-2" /> Create
                        </NavLink>
                        <NavLink
                            to="/teacher/assignments/evaluate"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center p-3 ${
                                    isActive ? 'bg-dark text-light' : 'bg-light text-dark'
                                }`
                            }
                        >
                            <Check2Circle className="me-2" /> Evaluate
                        </NavLink>
                        <NavLink
                            to="/teacher/assignments/stats"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center p-3 rounded-bottom ${
                                    isActive ? 'bg-dark text-light' : 'bg-light text-dark'
                                }`
                            }
                        >
                            <ClipboardData className="me-2" /> Stats
                        </NavLink>
                    </>
                )}

                {user?.role === 'Student' && (
                    <>
                        <NavLink
                            to="/student/assignments/answer"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center p-3 ${
                                    isActive ? 'bg-dark text-white' : 'bg-light text-dark'
                                }`
                            }
                        >
                            <Check2Circle className="me-2" /> Answer
                        </NavLink>
                        <NavLink
                            to="/student/assignments/stats"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center p-3 rounded-bottom ${
                                    isActive ? 'bg-dark text-white' : 'bg-light text-dark'
                                }`
                            }
                        >
                            <ClipboardData className="me-2" /> Stats
                        </NavLink>
                    </>
                )}
            </Nav>

            {alert && (
                <Alert variant={alert.type}>
                    {alert.message}
                </Alert>
            )}
        </>
    );
}

export default Sidebar;