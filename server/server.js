const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/home', routes.home);
app.get('/search', routes.search);
app.get('/search/result', routes.returnSearch);
app.get('/movie/:movie_id', routes.movie);
//app.get('/movie/:username', routes.movieByUser);
app.get('/user/:username', routes.user);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}`)
});

module.exports = app;
