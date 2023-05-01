import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function HomePage() {
  const [movie, setmovie] = useState([]);
  const [sortRelease, setSortRelease] = useState([]);
  const [threeUsersThreeGenres, setThreeUsersThreeGenres] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/home`)
      .then(res => res.json())
      .then(data => {
        console.log(data.default);
        setmovie(data.default);
        setSortRelease(data.sortRelease);
        setThreeUsersThreeGenres(data.threeUsersThreeGenres);
      });
  }, []);

  return (
    <Container maxWidth="lg">
      <h1>Welcome to CineScore</h1>
      <h2> Movies to Try: </h2>
      <ul>
        {movie.map((item) => (
          <li key={item.movie_id}>
            <NavLink to={`/movie/m${item.movie_id}`}>
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>
      <h2>Sorted by Release Date: </h2>
      <ul>
        {sortRelease.map((item) => (
          <li key={item.movie_id}>
            <NavLink to={`/movie/l${item.movie_id}`}>
              {item.title} - {item.release_date} - {item.avg}
            </NavLink>
          </li>
        ))}
      </ul>
      <h2>Three Users Three Genres: </h2>
      <ul>
        {threeUsersThreeGenres.map((item) => (
          <li key={item.user_id}>
            <NavLink to={`/user/${item.user_id}`}>
            {item.user_id} - {item.tag} - {item.avg_rating_of_genre}
            </NavLink>
          </li>
        ))}
      </ul>
    </Container>
  );
}
