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

const today = Date.now();
function timeConverter(timestamp) {
  var a = timestamp * 1000; //date: unix timestamp
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var time = year + '-' + month + '-' + date;
  return time;
}


// GET /home
const home = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  const tags = ["Foreign", "Crime", "Action", "Science Fiction", "Thriller", 
  "Animation", "Fantasy", "Adventure", "Horror", "Drama", "Music",
  "Documentary", "Western", "War", "Comedy", "Romance", "TV Movie", "History", 
  "Family", "Mystery"];

  let ind = tags[Math.floor(Math.random() * tags.length)];
  let stdDate = today.setFullYear( today.getFullYear() - 3 );

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
 /* const defaultQuery = ` 
  WITH slay AS (
    SELECT tagID, T.tag AS tag1, movieID, MT.tag AS tag2, title
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
    WHERE b.tagId = s.tagId;`;*/

    const defaultQuery = ` 
    SELECT *
    FROM Movie_tags
    JOIN (SELECT movie_id, avg(rating_val) as rating
        FROM Ratings_movielens
        group by movie_id) rml using (movie_id)
    WHERE tag LIKE '%${ind}%'
    ORDER BY rating
    LIMIT 10`;

    const sortReleasDateQuery = ` 
    SELECT *
    FROM
      (SELECT *
      FROM Movie_movielens
      UNION ALL
      SELECT * 
      FROM Movie_letterboxd) as allmovies
    WHERE release_date < '%${stdDate}%'
    ORDER BY release_date
    LIMIT 10`;


  connection.query(defaultQuery, (err, data) => {
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

//GET home/search
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
  const timestamp_upper = req.query.timestamp_upper ?? today; // add query parameter for this 
  const timestamp_lower = req.query.timestamp_lower ?? 0; // add query parameter for this 
  const tag = req.query.tag ?? ''; // add query parameter for this

  // Unix timestamp to date
  const date_upper = timeConverter(timestamp_upper);
  const date_lower = timeConverter(timestamp_lower);

  // var case1 = `
  //   SELECT *
  //   FROM letterboxd_movie_v2 lm, movies_metadata md
  //   WHERE lm.movie_title LIKE "%keyword%" OR lm.overview LIKE "%keyword%" OR md.original_title LIKE "%keyword%" OR md.overview LIKE "%keyword%";
  //   ` 
  // var case2 = `
  //   SELECT * 
  //   FROM letterboxd_movie_v2 lm, movies_metadata md 
  //   WHERE lm.release_date LIKE 'date' OR md.release_date LIKE 'date'
  //   `
  // var case3 = `
  //   SELECT * 
  //   FROM movies_metadata md JOIN movielens_genres g ON md.id = g.movie_id
  //   WHERE g.tag LIKE 'tag'
  // `

  const inputQuery = `
  WITH combined as (
    SELECT movie_id, title, image_url, release_date, priority, type FROM
        (SELECT *, 2 as priority
        FROM Movies_letterboxd
        WHERE title LIKE '% ${keyword} %'
        UNION
        SELECT *, 1 as priority
        FROM Movies_letterboxd
        WHERE overview LIKE '% ${keyword} %') as mvlb
    JOIN (SELECT movie_id, tag FROM Letterboxd_tags) LBT USING (movie_id)
        WHERE tag LIKE '%${tag}%'
    UNION ALL
    SELECT movie_id, title, image_url, release_date, priority, type from
        (SELECT *
        FROM (SELECT *, 2 as priority
            FROM Movies_movielens
            WHERE title LIKE '% ${keyword} %'
            UNION
            SELECT *, 1 as priority
            FROM Movies_movielens
            WHERE overview LIKE '% ${keyword} %') as mvml
        JOIN (SELECT movie_id, tag FROM Movie_tags) MT USING (movie_id)
        WHERE tag LIKE '%${tag}%') ml
    )
    SELECT movie_id, title, image_url, release_date, type
    FROM combined
    WHERE release_date > '${date_lower}' AND release_date < '${date_upper}'
    order by priority desc
    LIMIT 20
  `;

  connection.query(inputQuery, (err, data) => {
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


// fix: retrieve users that reviewed the movie -> can lead to user pages
// avg rating

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
  // const table_name = req.params.table_name; // letterboxd or movielens
  // Letterboxd movie_id: string
  // MovieLens movid_id: int

  const table = ''
  const avgTable = ''
  if (movie_id[0] == 'm'){
    table = 'Movies_movielens';
    avgTable = 'Ratings_movielens';
  } else if (movie_id[0] == 'l') {
    table = 'Movies_letterboxd';
    avgTable = 'Ratings_letterboxd';
  } else {
    console.log('Movie id in wrong format. Specify which table the movie is from.');
  }

  const movieInfoQuery = ` 
  SELECT *
  FROM (SELECT * FROM '${table}'
  WHERE movie_id = '${movie_id}' LIMIT 1) ml
  JOIN (SELECT movie_id, avg(rating_val) as avg_rating
      FROM '${avgTable}'
      WHERE movie_id = '${movie_id}'
      GROUP BY movie_id) rt using (movie_id)
  `;
  
  connection.query(movieInfoQuery, (err, data) => {
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

  // retrieve username, number of reviews, average score
  const userInfoQuery = ` 
  SELECT U.username, num_reviews, AVG(rating_val) AS avg_score
  FROM Users U JOIN Ratings_letterboxd Rl on U.username = Rl.user_id
  WHERE U.username = '${username}'
  GROUP BY U.username, num_reviews
  `;

  // complex query: randomly retrieve movies greater than avg rating
  const overAvgQuery = ` 
  WITH getAvgRating AS (SELECT U.username, num_reviews, AVG(rating_val) AS avg_score
  FROM Users U JOIN Ratings_letterboxd Rl on U.username = Rl.user_id
  GROUP BY U.username, num_reviews),
  getMovie AS (SELECT l.movie_id, U.username
                  FROM Users U JOIN Ratings_letterboxd l on U.username = l.user_id JOIN
                      getAvgRating g ON l.user_id = g.username
                  WHERE rating_val > avg_score)
  SELECT *
  FROM getMovie g JOIN Movies_letterboxd l ON g.movie_id=l.movie_id
  WHERE g.username = '${username}'
  ORDER BY RAND()
  LIMIT 3
  `;

  const reviewedMoviesQuery = ` 
  SELECT movie_id, title, rating_val
  FROM Users
  JOIN (SELECT * FROM Ratings_letterboxd WHERE user_id = '${username}') Rl on Users.username = Rl.user_id
  JOIN (Movies_letterboxd) using (movie_id)
  ORDER BY rating_val desc
  LIMIT 10
  `;

  // Use promise to return results from multiple queries
  // https://stackoverflow.com/questions/68804781/how-to-create-multiple-queries-in-a-single-get-request
  connection.query(`
  SELECT U.username, num_reviews, AVG(rating_val) AS avg_score
  FROM Users U JOIN Ratings_letterboxd Rl on U.username = Rl.user_id
  WHERE = 'input'
  GROUP BY U.username, num_reviews
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
