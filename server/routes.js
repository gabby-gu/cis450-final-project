const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));


// GET /home
const home = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
  WITH slay AS (SELECT tagID, T.tag AS tag1, movieID, MT.tag AS tag2, title
    FROM Tags T, Movie_tags MT
    WHERE T.tag = MT.tag
    GROUP BY T.tag, MT.title
    ORDER BY T.tag, MT.title),
    boots AS (SELECT tagId
    FROM slay
    ORDER BY RAND()
    LIMIT 3)
    SELECT *
    FROM slay s, boots b
    WHERE b.tagId = s.tagId;
  `, (err, data) => {
    if (err || data.length === 0) {
      // if there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data)
      // TODO (TASK 3): also return the song title in the response
      res.json(data);
    }
  });
}


//GET movie/movie_id
//MOVIE PAGE : get movie based on ID
const movie = async function(req, res) {
  /*
  Route: GET /movie/:movie_id
  Description: return all relevant movie information and reviews for that movie
  Route Parameter(s): movie_id(string)
  Query Parameter(s): None
  Route Handler: author(req, res)
  Return Type: JSON
  Expected (Output) behavior: Return the JSON formatted movie information of the given movie_id(Query #7) and all the reviews from letterboxd for that movie(Query #9)
  */
  const movie_id = req.params.movie_id;
  connection.query(`
  SELECT *
  FROM Movies
  WHERE movie_id = '${movie_id}'
  LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

module.exports = {
  home,
  movie
}
