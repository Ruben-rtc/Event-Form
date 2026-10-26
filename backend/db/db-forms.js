import mysql from 'mysql2/promise';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile();
}

const poolConn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
})

const db = {
    getAllForms: async() => {
        const [rows] = await poolConn.execute('SELECT * FROM form_data');
        return rows;
    },
    getFormById: async(id) => {
        const [rows] = await poolConn.execute('SELECT * FROM form_data WHERE id=?', [id]);
        return rows[0];
    },

    createForm: async(name, surname, email, message) => {
        const [rows] = await poolConn.execute('INSERT INTO form_data (name, surname, email, message) VALUES (?, ?, ?, ?)', [name, surname, email, message]);
        return { id: rows.insertId, name, surname, email, message }
    },

    updateForm: async(id, name, surname, email, message) => {
        const [rows] = await poolConn.execute('UPDATE form_data SET name=?, surname=?, email=?, message=? WHERE id=?', [name, surname, email, message, id])
        return {id, name, surname, email, message}
    },

    deleteForm: async(id) => {
        const [rows] = await poolConn.execute('DELETE FROM form_data WHERE id=?', [id])
        return {success: rows.affectedRows > 0}
    }

}

export default db;