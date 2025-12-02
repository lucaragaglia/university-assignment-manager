import db from '../database.mjs';

export const validateGroup = (studentIds, teacherId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) AS conflictCount
            FROM (
                SELECT G1.studentId AS student1, G2.studentId AS student2
                FROM GROUPS G1, GROUPS G2, ASSIGNMENTS A
                WHERE G1.assignmentId = G2.assignmentId
                  AND G1.assignmentId = A.id
                  AND G1.studentId < G2.studentId
                  AND G1.studentId IN (${studentIds.map(() => '?').join(',')})
                  AND G2.studentId IN (${studentIds.map(() => '?').join(',')})
                  AND A.teacherId = ?
                GROUP BY G1.studentId, G2.studentId
                HAVING COUNT(DISTINCT G1.assignmentId) >= 2
            ) AS conflictPairs;
        `;

        const params = [...studentIds, ...studentIds, teacherId];

        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('No result returned from the database'));
            resolve(row.conflictCount);
        });
    });
};
