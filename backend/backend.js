const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
var cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;
app.use(cors());
app.use(bodyParser.json());
const SECRET_KEY = 'your_secret_key';
var connection;
function kapcsolat() {
  connection = mysql.createConnection({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "szakdolgozat_vol2",
  });
  connection.connect();
}
//-------------- WEB Bejelentkezés végpont
app.post('/web/login', (req, res) => {
  const { email, password } = req.body;
  kapcsolat()
  const query = 'SELECT felhasznalo_email, felhasznalo_jelszo FROM felhasznaloi_adatok WHERE felhasznalo_email = ? && felhasznalo_tipus = 3';
  connection.query(query, [email], (err, rows) => {
    if (err) {
      console.error('Adatbázis hiba:', err);
      res.status(500).json({ message: 'Szerverhiba' });
    } else if (rows.length === 0) {
      res.status(404).json({ message: 'Felhasználó nem található' });
    } else {
      const hashedPassword = rows[0].felhasznalo_jelszo;

      // Jelszó ellenőrzése bcrypt-tel
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err) {
          console.error('Hiba a jelszó ellenőrzésekor:', err);
          res.status(500).json({ message: 'Szerverhiba' });
        } else if (isMatch) {
          const token = jwt.sign({ email: rows[0].felhasznalo_email }, SECRET_KEY, {
            expiresIn: '1h',
          });
          res.json({ token });
        } else {
          res.status(401).json({ message: 'Hibás jelszó' });
        }
      });
    }
  });
  connection.end();
});
app.get("/oktatok", (req, res) => {
  kapcsolat();
  connection.query(
    `select * from oktato_adatok`,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
        res.status(500).send("Hiba");
      } else {
        console.log(rows);
        res.status(200).send(rows);
      }
    }
  );
  connection.end();
});
app.get("/tanulok", (req, res) => {
  kapcsolat();
  connection.query(
    `select * from tanulo_adatok`,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
        res.status(500).send("Hiba");
      } else {
        console.log(rows);
        res.status(200).send(rows);
      }
    }
  );
  connection.end();
});
app.get("/felhasznalok", (req, res) => {
  kapcsolat();
  connection.query(
    `select * from felhasznaloi_adatok`,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
        res.status(500).send("Hiba");
      } else {
        console.log(rows);
        res.status(200).send(rows);
      }
    }
  );
  connection.end();
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});