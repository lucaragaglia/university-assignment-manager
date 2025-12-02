import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router';

import { useState } from 'react';
import UserContext from './contexts/UserContext.jsx';

import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';

import AssignmentsCreate from './components/AssignmentsCreate.jsx';
import AssignmentsEvaluate from './components/AssignmentsEvaluate.jsx';
import TeacherStats from './components/TeacherStats.jsx';

import AssignmentsAnswer from './components/AssignmentsAnswer.jsx';
import StudentStats from './components/StudentStats.jsx';

function App() {
    const [user, setUser] = useState(null);

    return (
        <>
            <UserContext.Provider value={{ user, setUser }}>
                <Routes>
                    <Route path="/" element={<Login />} />

                    <Route element={<Layout />}>
                        <Route path="/home" element={<Home />} />

                        <Route path="/teacher/assignments/create" element={<AssignmentsCreate />} />
                        <Route path="/teacher/assignments/evaluate" element={<AssignmentsEvaluate />} />
                        <Route path="/teacher/assignments/stats" element={<TeacherStats />} />

                        <Route path="/student/assignments/answer" element={<AssignmentsAnswer />} />
                        <Route path="/student/assignments/stats" element={<StudentStats />} />
                    </Route>
                </Routes>
            </UserContext.Provider>
        </>
    );
}

export default App;