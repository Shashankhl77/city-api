const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shashank@7275",
  database: "citydb",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
});

const getCities = (callback) => {
  connection.query("SELECT * FROM cities", (err, results) => {
    if (err) throw err;
    callback(results);
  });
};

const addCity = (city, callback) => {
  connection.query("INSERT INTO cities SET ?", city, (err, results) => {
    if (err) throw err;
    callback(results.insertId);
  });
};

const updateCity = (name, updatedCity, callback) => {
  connection.query(
    "UPDATE cities SET ? WHERE name = ?",
    [updatedCity, name],
    (err, results) => {
      if (err) throw err;
      callback(results.affectedRows > 0);
    }
  );
};

const deleteCity = (name, callback) => {
  connection.query(
    "DELETE FROM cities WHERE name = ?",
    [name],
    (err, results) => {
      if (err) throw err;
      callback(results.affectedRows > 0);
    }
  );
};

module.exports = {
  getCities,
  addCity,
  updateCity,
  deleteCity,
};
