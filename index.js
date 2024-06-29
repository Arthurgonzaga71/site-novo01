const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // Altere para a senha do seu banco de dados MySQL
    database: 'aniversario'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Rotas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                bcrypt.compare(password, results[0].password, (err, result) => {
                    if (result) {
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.redirect('/dashboard');
                    } else {
                        res.send('Usuário ou senha incorretos!');
                    }
                });
            } else {
                res.send('Usuário ou senha incorretos!');
            }
        });
    } else {
        res.send('Por favor, preencha todos os campos!');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        db.query('SELECT * FROM confirmations', (err, results) => {
            if (err) throw err;
            res.render('dashboard', { confirmations: results });
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/confirm', (req, res) => {
    const { firstname, lastname, phone, email, guests } = req.body;

    const sql = 'INSERT INTO confirmations (firstname, lastname, phone, email, guests) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [firstname, lastname, phone, email, guests], (err, result) => {
        if (err) throw err;
        res.send('Confirmação recebida!');
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
