const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: "authapidb01.mysql.database.azure.com",
    user: "adminsistemas",
    password: "TestApiAuth123",
    database: "auth_db",
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL');
});

module.exports = connection;
