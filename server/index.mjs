import express from 'express'

import morgan from 'morgan'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import LocalStrategy from 'passport-local'

import {
  createAssignment,
  answerAssignment,
  evaluateAssignment,
  getTeacherOpenAssignments,
  getStudentOpenAssignments,
  getTeacherStats, 
  getStudentStats
} from './dao/assignment-dao.mjs'

import {
  validateGroup
} from './dao/group-dao.mjs'

import { getUser, getStudents } from './dao/user-dao.mjs'

const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.authenticate('session'));

passport.use(new LocalStrategy(
  { usernameField: 'registrationNumber' },
  async function verify(username, password, cb) {
    const user = await getUser(username, password);
    if (user === false) return cb(null, false, { message: 'Incorrect username or password' });
    return cb(null, user);
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
};

const isTeacher = (req, res, next) => {
  if (req.user.role === 'Teacher') return next();
  return res.status(403).json({ error: 'Forbidden: Only teachers can access this resource' });
};

const isStudent = (req, res, next) => {
  if (req.user.role === 'Student') return next();
  return res.status(403).json({ error: 'Forbidden: Only students can access this resource' });
};

app.post('/api/v1/login', (req, res, next) => {
  const { registrationNumber, password } = req.body;

  if (!registrationNumber || !password) {
    return res.status(400).json({ error: 'Missing registration number or password' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

app.post('/api/v1/logout', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

  req.logout(() => {
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.get('/api/v1/session', isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get('/api/v1/students', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const students = await getStudents();
    if (students === false) return res.status(204).json({ error: 'No students found' });
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/assignments', isLoggedIn, isTeacher, async (req, res) => {
  const { question, studentIds } = req.body;

  if (!question) return res.status(400).json({ error: 'Invalid input: question is required' });
  if (!Array.isArray(studentIds)) return res.status(400).json({ error: 'Invalid input: type error' });
  if (studentIds.length < 2) return res.status(400).json({ error: 'Invalid group: a group must have at least 2 students' });
  if (studentIds.length > 6) return res.status(400).json({ error: 'Invalid group: a group cannot have more than 6 students' });

  try {
    const conflictCount = await validateGroup(studentIds, req.user.id);
    if (conflictCount > 0) return res.status(400).json({error: `Error: ${conflictCount} pairs of students have already worked together in at least 2 previous assignments.`});
    await createAssignment(req.user.id, question, studentIds);
    res.status(201).json({ message: 'Assignment created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/v1/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  const assignmentId = parseInt(req.params.id, 10);
  const { answer } = req.body;

  if (!Number.isInteger(assignmentId) || assignmentId <= 0) return res.status(400).json({ error: 'Invalid assignment ID' });
  if (!answer || typeof answer !== 'string' || answer.trim() === '') return res.status(400).json({ error: 'Answer is required and must be a non-empty string' });

  try {
    const result = await answerAssignment(assignmentId, req.user.id, answer);
    if (result === false) return res.status(400).json({ error: 'Assignment not found, closed, or you are not part of the group' });
    res.status(200).json({ message: 'Answer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/v1/assignments/:id/score', isLoggedIn, isTeacher, async (req, res) => {
  const assignmentId = parseInt(req.params.id, 10);
  const { score } = req.body;

  if (!Number.isInteger(assignmentId) || assignmentId <= 0) return res.status(400).json({ error: 'Invalid assignment ID' });
  if (!Number.isInteger(score) || score < 0 || score > 30) return res.status(400).json({ error: 'Invalid score: must be an integer between 0 and 30' });

  try {
    const result = await evaluateAssignment(assignmentId, req.user.id, score);
    if (result === false) return res.status(400).json({ error: 'Assignment not found, already closed, or not assigned to you' });
    res.status(200).json({ message: 'Assignment evaluated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/assignments/open/teacher', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const assignments = await getTeacherOpenAssignments(req.user.id);
    if (assignments === false) return res.status(200).json({ error: 'No open-answered assignments found' });
    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/assignments/open/student', isLoggedIn, isStudent, async (req, res) => {
  try {
    const assignments = await getStudentOpenAssignments(req.user.id);
    if (assignments === false) return res.status(200).json({ error: 'No open assignments found' });
    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/v1/stats/teacher', isLoggedIn, isTeacher, async (req, res) => {
    try {
        const stats = await getTeacherStats(req.user.id);
        if (stats === false) return res.status(200).json({ error: 'No stats found' });
        res.status(200).json({ stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/v1/stats/student', isLoggedIn, isStudent, async (req, res) => {
    try {
        const stats = await getStudentStats(req.user.id);
        if (stats === false) return res.status(200).json({ error: 'No stats found' });
        res.status(200).json({ stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});