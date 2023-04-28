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

//GET home/:type
//Home: return movies matching the search parameter
const search = async function(req, res) {
  /*
  Description: look up movie title and summary based on the inputted keyword and return movie information
  Route Parameter(s): type(string)
  Query Parameter(s): type(string)
  Route Handler: author(req, res)
  Return Type: JSON
  Expected (Output) behavior:
  ● Case 1: If the route parameter (type)=’keyword’’
  ○ Return the JSON formatted movie information that has a matching title or summary with inputted keyword
  ● Case 2: If the route parameter(type)= ‘date’
  ○ Return the JSON formatted movie information that has a matching release date 
  ● Case 3: If the route parameter(type)= ‘tag’
  ○ Return Return the JSON formatted movie information that has a matching tag using Query #3
  ● Case 4: If the route parameter is defined but does not match cases 1 or 2 or 3:
  ○ Return “‘[type]’ is not a valid author type.
  */
  const keyword = req.query.keyword ?? '';

  // TODO: have to think about how to incorporate this parameters to query
  const date = req.query.date ?? 0; // add query parameter for this 
  const tag = req.query.tag ?? ''; // add query parameter for this

  var keywordLower = keyword.toLowerCase();
  var keywordCaptalized = keywordLower.charAt(0).toUpperCase() + keywordLower.slice(1);

  connection.query(`
  SELECT *
  FROM Movies
  JOIN Movie_tags ON (movieId)
  WHERE title LIKE '%${keywordLower}%' OR  title LIKE '%${keywordCaptalized}%'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else if ((keyword == '' & date == '0' & tag == '')) {
      console.log("invalid search parameter")
      res.json({}); //will have to fix this later
    } 
    else {
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
  Expected (Output) behavior: Return the JSON formatted movie information of the given movie_id(Query #7)
   and all the reviews from letterboxd for that movie(Query #9)
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
      res.json(data);
    }
  });
}

//GET movie/username
//MOVIE PAGE : get movie based on the username
const movieByUser = async function(req, res) {
  /*
Route: GET /movie/:reviewer_id
Description: return selected reviewer’s reviewed movies and average rating
Route Parameter(s): reviewer_id(string)
Query Parameter(s): reviewer_id(string)
Route Handler: author(req, res)
Return Type: JSON
Expected (Output) behavior: Return the JSON formatted movie information 
of the reviewed movie lists and the average rating(Query #4)
  */
  const username = req.params.username;
  connection.query(`
  SELECT *
  FROM Ratings 
  JOIN Movies using (movie_id)
  WHERE user_id = '${username}'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// GET /user/:user_id
//user PAGE : get movie based on user_id
const user = async function(req, res) {
  /*
Route: GET /user/:user_id
Description: show the user information with given user_id
Route Parameter(s): user_id(String)
Query Parameter(s): user_id(String)
Route Handler: author(req, res)
Return Type: JSON
Expected (Output) behavior: Return all the user information(Query #1) , 
reviews that the user wrote, and the avg score of all the reviews 
that the user gave(Query #2) 
  */
  const username = req.params.username;
  connection.query(`
  SELECT U.num_reviews, U.username, avg(rating_val)
  FROM Users U
  JOIN Ratings R on R.user_id = U.username
  WHERE username = '${username}'
  GROUP BY U.username
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  home,
  search,
  movie,
  movieByUser,
  user
}
