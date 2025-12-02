import db from '../database.mjs'

export const createAssignment = (teacherId, question, studentIds) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) return reject(err);

                const sqlAssignment = `INSERT INTO ASSIGNMENTS (teacherId, question, status) VALUES (?, ?, 'Open');`;

                db.run(sqlAssignment, [teacherId, question], function (err) {
                    if (err) return db.run('ROLLBACK', () => reject(err));
                    if (!this.lastID) return db.run('ROLLBACK', () => reject(new Error('Failed to retrieve lastID')));

                    const assignmentId = this.lastID;
                    const sqlGroup = `INSERT INTO GROUPS (assignmentId, studentId) VALUES (?, ?);`;

                    const groupPromises = studentIds.map(studentId => {
                        return new Promise((resolveGroup, rejectGroup) => {
                            db.run(sqlGroup, [assignmentId, studentId], function (err) {
                                if (err) return rejectGroup(err);
                                resolveGroup();
                            });
                        });
                    });

                    Promise.all(groupPromises)
                        .then(() => {
                            db.run('COMMIT', (err) => {
                                if (err) return reject(err);
                                resolve(assignmentId);
                            });
                        })
                        .catch((err) => {
                            db.run('ROLLBACK', () => reject(err));
                        });
                });
            });
        });
    });
};

export const answerAssignment = (assignmentId, studentId, answer) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE ASSIGNMENTS
            SET answer = ?
            WHERE id = ? 
              AND status = 'Open'
              AND EXISTS (
                SELECT 1 
                FROM GROUPS 
                WHERE assignmentId = ? AND studentId = ?
              );
        `;

        db.run(sql, [answer, assignmentId, assignmentId, studentId], function (err) {
            if (err) return reject(err);
            if (!this.changes) return resolve(false);
            resolve(true);
        });
    });
};

export const evaluateAssignment = (assignmentId, teacherId, score) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE ASSIGNMENTS
            SET score = ?, status = 'Closed'
            WHERE id = ? AND teacherId = ? AND status = 'Open' AND answer IS NOT NULL;
        `;

        db.run(sql, [score, assignmentId, teacherId], function (err) {
            if (err) return reject(err);
            if (!this.changes) return resolve(false);
            resolve(true);
        });
    });
};

export const getTeacherOpenAssignments = teacherId => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                id AS assignmentId, 
                question, 
                answer 
            FROM ASSIGNMENTS 
            WHERE teacherId = ? 
                AND status = 'Open' 
                AND answer IS NOT NULL;
        `;

        db.all(sql, [teacherId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(false);
            resolve(rows);
        });
    });
};

export const getStudentOpenAssignments = studentId => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                ASSIGNMENTS.id AS assignmentId,
                USERS.registrationNumber,
                USERS.name,
                USERS.surname,
                ASSIGNMENTS.question,
                ASSIGNMENTS.answer
            FROM ASSIGNMENTS, USERS, GROUPS
            WHERE ASSIGNMENTS.teacherId = USERS.id
                AND GROUPS.assignmentId = ASSIGNMENTS.id
                AND USERS.role = 'Teacher'
                AND GROUPS.studentId = ?
                AND ASSIGNMENTS.status = 'Open';
        `;
        db.all(sql, [studentId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(false);
            resolve(rows);
        });
    });
};

export const getTeacherStats = (teacherId) => {
    return new Promise((resolve, reject) => {
        const sqlStudents = `
            SELECT 
                USERS.id AS studentId,
                USERS.registrationNumber,
                USERS.name,
                USERS.surname,
                COALESCE(SUM(ASSIGNMENTS.status = 'Open'), 0) AS openAssignments,
                COALESCE(SUM(ASSIGNMENTS.status = 'Closed'), 0) AS closedAssignments
            FROM USERS
            LEFT JOIN GROUPS ON USERS.id = GROUPS.studentId
            LEFT JOIN ASSIGNMENTS ON GROUPS.assignmentId = ASSIGNMENTS.id AND ASSIGNMENTS.teacherId = ?
            WHERE USERS.role = 'Student'
            GROUP BY USERS.id
            ORDER BY USERS.surname ASC, USERS.registrationNumber ASC;
        `;

        const sqlScores = `
            SELECT 
                GROUPS.studentId,
                ASSIGNMENTS.score,
                (SELECT COUNT(*) FROM GROUPS WHERE GROUPS.assignmentId = ASSIGNMENTS.id) AS groupSize
            FROM GROUPS
            JOIN ASSIGNMENTS ON GROUPS.assignmentId = ASSIGNMENTS.id
            WHERE ASSIGNMENTS.teacherId = ?
              AND ASSIGNMENTS.status = 'Closed';
        `;

        Promise.all([
            new Promise((resolveQuery, rejectQuery) => {
                db.all(sqlStudents, [teacherId], (err, students) => {
                    if (err) return rejectQuery(err);
                    resolveQuery(students || []);
                });
            }),
            new Promise((resolveQuery, rejectQuery) => {
                db.all(sqlScores, [teacherId], (err, scores) => {
                    if (err) return rejectQuery(err);
                    resolveQuery(scores || []);
                });
            })
        ])
            .then(([students, scores]) => {

                const results = students.map(student => {
                    const studentScores = scores.filter(s => s.studentId === student.studentId);
                    const totalWeightedScore = studentScores.reduce((sum, s) => sum + (s.score / s.groupSize), 0);
                    const totalWeight = studentScores.reduce((sum, s) => sum + (1 / s.groupSize), 0);
                    const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

                    return {
                        studentId: student.studentId,
                        registrationNumber: student.registrationNumber,
                        name: student.name,
                        surname: student.surname,
                        openAssignments: student.openAssignments,
                        closedAssignments: student.closedAssignments,
                        averageScore: averageScore
                    };
                });

                resolve(results);
            })
            .catch(err => reject(err));
    });
};

export const getStudentStats = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                ASSIGNMENTS.id AS assignmentId,
                ASSIGNMENTS.question,
                ASSIGNMENTS.answer,
                ASSIGNMENTS.score,
                (1.0 / (SELECT COUNT(*) FROM GROUPS WHERE GROUPS.assignmentId = ASSIGNMENTS.id)) AS weight,
                USERS.registrationNumber AS teacherRegistrationNumber,
                USERS.name AS teacherName,
                USERS.surname AS teacherSurname
            FROM ASSIGNMENTS
            JOIN GROUPS ON GROUPS.assignmentId = ASSIGNMENTS.id
            JOIN USERS ON USERS.id = ASSIGNMENTS.teacherId
            WHERE GROUPS.studentId = ?
                AND ASSIGNMENTS.status = 'Closed';
        `;

        db.all(sql, [studentId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(false);

            const totalWeightedScore = rows.reduce((sum, row) => sum + (row.score * row.weight), 0);
            const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
            const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

            const assignments = rows.map(row => ({
                assignmentId: row.assignmentId,
                question: row.question,
                answer: row.answer,
                score: row.score,
                teacherRegistrationNumber: row.teacherRegistrationNumber,
                teacherName: row.teacherName,
                teacherSurname: row.teacherSurname
            }));

            resolve({
                assignments,
                averageScore
            });
        });
    });
};
