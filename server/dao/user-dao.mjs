import db from '../database.mjs';
import crypto from 'crypto';

export const getUser = (registrationNumber, password) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * 
            FROM USERS 
            WHERE registrationNumber = ?`;

        db.get(sql, [registrationNumber], (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve(false);

            const salt = row.salt;
            const dbSaltedPassword = row.saltedPassword;

            const user = {
                id: row.id,
                registrationNumber: row.registrationNumber,
                name: row.name,
                surname: row.surname,
                role: row.role
            };

            crypto.scrypt(password, salt, 64, function (err, saltedPassword) {
                if (err) return reject(err);
                if (!crypto.timingSafeEqual(Buffer.from(dbSaltedPassword, 'hex'), saltedPassword)) return resolve(false);
                resolve(user);
            });
        });
    });
};

export const getStudents = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                id AS studentId, 
                registrationNumber, 
                name, surname 
            FROM USERS 
            WHERE role = 'Student' 
            ORDER BY registrationNumber;
        `;

        db.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0)  return resolve(false);
            resolve(rows);
        });
    });
};
