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
conn = require('bluebird').promisifyAll(connection)
const organize = (rows) => Object.values(JSON.parse(JSON.stringify(rows)));

function timeConverter(timestamp) {
  var a = new Date(timestamp); //date: unix timestamp
  // console.log("a: ", a);
  var year = a.getFullYear();
  var month = a.getMonth();
  if (month < 10) {
    month = "0"+month;
  }
  var date = a.getDate();
  if (date < 10) {
    date = "0"+date;
  }
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

  const today = new Date();
  let ind = tags[Math.floor(Math.random() * tags.length)];
  var stdDate = timeConverter(today.setFullYear( today.getFullYear() - 2 ));
  var stdDateYearBefore = timeConverter(today.setFullYear( today.getFullYear() - 1 ));

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.

  const defaultQuery = ` 
  SELECT *
  FROM Tags_Movielens
  JOIN (SELECT movie_id, avg(rating_val) as rating
      FROM Ratings_movielens
      group by movie_id) rml using (movie_id)
  WHERE tag LIKE '%${ind}%'
  ORDER BY rating
  LIMIT 5`;

  const sortReleaseDateQuery = ` 
  with movies as
  (SELECT *, avg(rating_val) as avg
  FROM (SELECT * FROM Movies_letterboxd 
        WHERE release_date LIKE '%${stdDate}%') mv
  JOIN Ratings_letterboxd using (movie_id)
  GROUP BY movie_id)
  SELECT movie_id, title, image_url, avg, release_date
  FROM movies
  ORDER BY release_date, avg
  LIMIT 3`;

  /*const mostReviewsQuery = ` 
  SELECT *
  FROM
    (SELECT *
    FROM Movie_movielens
    UNION ALL
    SELECT * 
    FROM Movie_letterboxd) as allmovies
  WHERE release_date < '%${stdDate}%'
  ORDER BY release_date
  LIMIT 5`;*/

  const threeUsersThreeGenresQuery = `
  WITH randReviewers AS (
    SELECT *
    FROM (SELECT username FROM Users
    ORDER BY num_reviews DESC LIMIT 50) top
     ORDER BY RAND()
     LIMIT 3
  ),
  MovieAndTags AS (
      SELECT tag, rating_val, user_id
      FROM Tags_Letterboxd TL
      JOIN Ratings_letterboxd RL ON TL.movie_id = RL.movie_id
      JOIN randReviewers RV on RV.username = RL.user_id
  ),
  combined AS (
  SELECT user_id, tag, AVG(rating_val) AS avg_rating_of_genre
  FROM MovieAndTags M
  GROUP BY user_id, tag)
  SELECT *
  FROM combined c
  WHERE (SELECT count(*)
          FROM combined
          WHERE avg_rating_of_genre > c.avg_rating_of_genre
            AND c.user_id = user_id) < 3`;

  
  // Multiple queries for Homepage
  // TODO: Change
  Promise.all([
    conn.queryAsync(defaultQuery),
    conn.queryAsync(sortReleaseDateQuery),
    //conn.queryAsync(mostReviewsQuery),
    conn.queryAsync(threeUsersThreeGenresQuery),
  ]).then(function([defaultResults, sortReleaseResults, 
    //mostReviewsResults, 
    threeUsersThreeGenresResults]
  ) {
    const results = {
      default: organize(defaultResults),
      sortRelease: organize(sortReleaseResults),
      //mostReviews: organize(mostReviewsResults),
      threeUsersThreeGenres: organize(threeUsersThreeGenresResults)
    };
    console.log("--------------------");
    console.log(results);
    console.log(stdDate);
    res.json(results);
    console.log(sortReleaseDateQuery);
  }, function(err) {
    console.log(err);
    res.json({});
  });

  // connection.query(defaultQuery, (err, data) => {
  //   if (err || data.length === 0) {
  //     // if there is an error for some reason, or if the query is empty (this should not be possible)
  //     // print the error message and return an empty object instead
  //     console.log(err);
  //     res.json({});
  //   } else {
  //     // Here, we return results of the query as an object, keeping only relevant data
  //     // being song_id and title which you will add. In this case, there is only one song
  //     // so we just directly access the first element of the query results array (data)
  //     // TODO (TASK 3): also return the song title in the response
  //     res.json(data);
  //   }
  // });
}

//GET home/search
//Home: return tags that user can input for search
const search = async function(req, res) {
  /*
  Description: look up movie title and summary based on the inputted keyword and return movie information
  Route Parameter(s): 
  Query Parameter(s): 
  Route Handler: author(req, res)
  Return Type: JSON
  Expected (Output) behavior: Return all the tags in a descending order
  of number of reviews each tag have
  */

  const inputQuery = `
  with allmovies as (
    SELECT tag, COUNT(Ml.movie_id) as num_movies
    FROM Tags_Letterboxd, Movies_letterboxd Ml
    WHERE Tags_Letterboxd.movie_id = Ml.movie_id
    GROUP BY (tag)
    UNION ALL
    SELECT tag, COUNT(Mm.movie_id) as num_movies
    FROM Tags_Movielens, Movies_movielens Mm
    WHERE Mm.movie_id = Tags_Movielens.movie_id
    GROUP BY (tag))
    select tag
    from allmovies
    group by tag
    `;

  connection.query(inputQuery, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } 
    else {
      res.json(data);
    }
  });
}


//GET home/search/result
//Home: return movies matching the search parameter
const returnSearch = async function(req, res) {
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
  const today = new Date();
  var stdDate = timeConverter(today.setFullYear( today.getFullYear() - 2 ));
  var stdDateYearBefore = timeConverter(today.setFullYear( today.getFullYear() - 1 ));

  const keyword = req.query.keyword ?? '';


  // TODO: have to think about how to incorporate this parameters to query
  const timestamp_upper = req.query.timestamp_upper ?? today; // add query parameter for this 
  const timestamp_lower = req.query.timestamp_lower ?? 0; // add query parameter for this 
  const tag = req.query.tag ?? ''; // add query parameter for this

  // Unix timestamp to date
  const date_upper = timeConverter(timestamp_upper);
  const date_lower = timeConverter(timestamp_lower);

  const inputQuery = `
  WITH combined as (
    SELECT movie_id, title, image_url, release_date, priority, type FROM
        (SELECT *, 2 as priority
        FROM Movies_letterboxd
        WHERE title LIKE '%${keyword}%' OR movie_id LIKE '%${keyword}%'
        UNION
        SELECT *, 1 as priority
        FROM Movies_letterboxd
        WHERE overview LIKE '%${keyword}%') as mvlb
    JOIN (SELECT movie_id, tag FROM Tags_Letterboxd) LBT USING (movie_id)
        WHERE tag LIKE '%${tag}%'
    UNION ALL
    SELECT movie_id, title, image_url, release_date, priority, type from
        (SELECT *
        FROM (SELECT *, 2 as priority
            FROM Movies_movielens
            WHERE title LIKE '%${keyword}%'
            UNION
            SELECT *, 1 as priority
            FROM Movies_movielens
            WHERE overview LIKE '%${keyword}%') as mvml
      JOIN (SELECT movie_id, tag FROM Tags_Movielens) MT USING (movie_id)
        WHERE tag LIKE '%${tag}%') ml
    )
    SELECT DISTINCT movie_id, title, image_url, release_date, type
    FROM combined
    WHERE release_date > '${date_lower}' AND release_date < '${date_upper}'
    order by priority desc;
  `;

  connection.query(inputQuery, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else if ((keyword == '' & date_lower > date_upper & tag == '')) {
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

  var table = ''
  var ratingTable = ''
  var avgTable = ''
  var id = movie_id.slice(1);
  var movieinfoQuery = '';
  var userListQuery = '';

  if (movie_id[0] == 'm'){
    table = 'Movies_movielens';
    ratingTable = 'Ratings_movielens'
    avgTable = 'Ratings_movielens';
    id = parseInt(id);
  } else if (movie_id[0] == 'l') {
    table = 'Movies_letterboxd';
    ratingTable = 'Ratings_letterboxd';
    avgTable = 'Ratings_letterboxd';
  } else {
    console.log('Movie id in wrong format. Specify which table the movie is from.');
  }

  const mlQuery = ` 
  SELECT *
  FROM (SELECT * FROM ${table}
  WHERE movie_id = ${id} LIMIT 1) ml
  JOIN
      (SELECT ${id} as movie_id, COALESCE(
      (SELECT avg(rating_val) as avg_rating
      FROM ${avgTable}
      WHERE movie_id = ${id}
      GROUP BY movie_id),-1) as avg_rating) rt using (movie_id)
  `;

  const lbQuery = ` 
  SELECT *
  FROM (SELECT * FROM ${table}
  WHERE movie_id = '${id}' LIMIT 1) ml
  JOIN
  (SELECT '${id}' as movie_id, COALESCE(
  (SELECT avg(rating_val) as avg_rating
  FROM ${avgTable}
  WHERE movie_id = '${id}'
  GROUP BY movie_id),-1) as avg_rating) rt using (movie_id)
  `;

  const mlUsers = `
  SELECT user_id, rating_val
  FROM ${ratingTable}
  WHERE movie_id = ${id}
  ORDER BY rating_val DESC
  LIMIT 20`;

  const lbUsers = `
  SELECT user_id, rating_val
  FROM ${ratingTable}
  WHERE movie_id = '${id}'
  ORDER BY rating_val DESC
  LIMIT 20`;


  if (movie_id[0] == 'm'){
    movieinfoQuery = mlQuery;
    userListQuery = mlUsers;
  } else if (movie_id[0] == 'l') {
    movieinfoQuery = lbQuery;
    userListQuery = lbUsers;
  } else {
    console.log('Movie id in wrong format. Specify which table the movie is from.');
  }
  
  // Multiple queries for Movie page
  // TODO: Change
  Promise.all([
    conn.queryAsync(movieinfoQuery),
    conn.queryAsync(userListQuery)
  ]).then(function([movieInfoResults, userListResults]
  ) {
    const results = {
      movieInfoResults: organize(movieInfoResults),
      userList: organize(userListResults)
    };
    console.log("--------------------");
    console.log(results);
    res.json(results);
  }, function(err) {
    console.log(err);
    res.json({});
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

  // complex query: randomly retrieve movies greater than user's avg rating
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

  // return avg rating for each tag from letterbox data + return one top rated movie for each tag
  const perTagQuery = ` 
  WITH info AS (SELECT tag, avg(rating_val) as avgpertag, max(rating_val) as maxpertag, Rl.movie_id
  FROM Users
  JOIN (SELECT *
        FROM Ratings_letterboxd
        WHERE user_id = '${username}') Rl on Users.username = Rl.user_id
  JOIN Tags_Letterboxd TL on Rl.movie_id = TL.movie_id
  GROUP BY tag)
  SELECT tag, avgpertag, maxpertag, info.movie_id, title
  FROM info
  JOIN Movies_letterboxd USING (movie_id)
  `;

  // Use promise to return results from multiple queries
  // https://stackoverflow.com/questions/68804781/how-to-create-multiple-queries-in-a-single-get-request

  // Multiple queries for User Page
  Promise.all([
    conn.queryAsync(userInfoQuery),
    conn.queryAsync(overAvgQuery),
    conn.queryAsync(perTagQuery)
  ]).then(function([userInfoResults, overAvgResults, perTagResults]
  ) {
    const results = {
      userInfo: organize(userInfoResults),
      overAvg: organize(overAvgResults),
      perTagMovies: organize(perTagResults)
    };
    console.log("--------------------");
    console.log(results);
    res.json(results);
  }, function(err) {
    console.log(err);
    res.json({});
  });
    
}

module.exports = {
  home,
  search,
  returnSearch,
  movie,
  user
}