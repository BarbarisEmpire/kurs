const mysql = require("mysql2");
const express = require("express");

const paramsDB = {
    host: "pgsha.ru",
    port: "35006",
    user: "soft0055",
    password: "TdAfEaYR",
    database: "soft0055_labrab06"
};

const pool = mysql.createPool(paramsDB);

function get_connection() {
    return mysql.createConnection(paramsDB);
}

const app = express();
const urlencodedParser = express.urlencoded({extended: false});
app.use('/css', express.static(__dirname + '/css'));
app.set("view engine", "hbs");


app.get("/", function(req, res) {
    let query = "SELECT * FROM albums";
    pool.query(query, function(err, data) {
        if (err) return console.log(err);
        res.render("index.hbs", {
            albums: data
        });
    });
});

app.get("/create", function(req, res) {
    res.render("create.hbs");
});

app.post("/create", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    const author = req.body.author;
    const name = req.body.name;
    const releaseYear = req.body.releaseYear;
    const songsCount = req.body.songsCount;
    const rating = req.body.rating;
    let query = "INSERT INTO albums (author, name, releaseYear, songsCount, rating) VALUES (?,?,?,?,?)";
    let params = [author, name, releaseYear, songsCount, rating];
    pool.query(query, params, function(err, data) {
        if (err) return console.error(err);
        res.redirect("/");
    });
});

app.get("/edit/:id", function(req, res) {
    const id = req.params.id;
    pool.query("SELECT * FROM albums WHERE id=?", [id], function(err, data) {
        if (err) return console.error(err);
        res.render("edit.hbs", {
            albums: data[0]
        });
    });
});

app.post("/edit", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const author = req.body.author;
    const name = req.body.name;
    const releaseYear = req.body.releaseYear;
    const songsCount = req.body.songsCount;
    const rating = req.body.rating;
    let query = "UPDATE albums SET author=?, name=?, releaseYear=?, songsCount=?, rating=? WHERE id=?";
    let params = [author, name, releaseYear, songsCount, rating, id];
    pool.query(query, params, function(err, data) {
        if (err) return console.error(err);
        res.redirect("/");
    });
});

app.post("/delete/:id", function(req, res) {
    const id = req.params.id;
    pool.query("DELETE FROM albums WHERE id=?", [id], function(err, data) {
        if (err) return console.log(err);
        res.redirect("/");
    });
});

app.get("/sort/:field.:direct", function(req, res) {
    const field = req.params.field;
    const direct = req.params.direct;
    let query = "SELECT * FROM albums ORDER BY " + field + " " + direct;
    pool.query(query, function(err, data) {
        if (err) return console.log(err);
        res.render("index.hbs", {
            albums: data
        });
    });
});

app.get("/restore", function(req, res) {
    let query_truncate = "TRUNCATE `albums`";
    let query_insert = "INSERT INTO `albums` \
    (`id`, `author`, `name`, `releaseYear`, `songsCount`, `rating`) VALUES \
    (NULL,'pyrokinesis','Моя милая пустота',2019,17,9), \
    (NULL,'pyrokinesis','Питер, чай, не Франция',2020,12,8), \
    (NULL,'pyrokinesis','Корми демонов по расписанию',2018,8,8), \
    (NULL,'pyrokinesis','Терновый венец эволюции',2017,10,7), \
    (NULL,'pyrokinesis','Eclipse',2016,9,6), \
    (NULL,'Слава КПСС','Русское поле',2016,7,7), \
    (NULL,'Radiohead','OK Computer',1997,12,7), \
    (NULL,'System Of A Down','Toxicity',2001,15,8), \
    (NULL,'System Of A Down','Mezmerize',2005,11,7), \
    (NULL,'System Of A Down','Hypnotize',2005,13,7), \
    (NULL,'Hawaiian Sadness','Дни дождей',2019,8,7);";
    
    const conn = get_connection();

    conn.promise()
        .query(query_truncate)
        .then(() => {
            conn.promise()
                .query(query_insert)
                .catch((err) => console.error(err));
        })
        .then(() => {
            conn.promise()
                .query('SELECT * FROM albums')
                .then(([data]) => {
                    res.render('index.hbs', {
                        albums: data
                    });
                })
        .then(conn.end())
        .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
})

app.get("/clear", function(req, res) {
    let query_truncate = "TRUNCATE albums";
    
    const conn = get_connection();

    conn.promise()
    .query(query_truncate)
    .then(() => {
        conn.promise()
            .query('SELECT * FROM albums')
            .then(([data]) => {
                res.render('index.hbs', {
                    albums: data
                });
            })
            .then(conn.end())
            .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

app.listen(3000, function() {
    console.log("смотрим работу через браузер - http://localhost:3000/");
    let isWin = process.platform === "win32";
    let hotKeys = isWin? "Ctrl+C": "Ctrl+D";
    console.log(`остановить сервер - ${hotKeys}`);
});

//Выполнил: Орлов Максим, ПИНб-31