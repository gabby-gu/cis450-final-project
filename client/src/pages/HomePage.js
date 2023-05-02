import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function HomePage() {
  const [movie, setmovie] = useState([]);
  const [sortRelease, setSortRelease] = useState([]);
  const [threeUsersThreeGenres, setThreeUsersThreeGenres] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/home`)
      .then(res => res.json())
      .then(data => {
        console.log(data.default);
        setmovie(data.default);
        setSortRelease(data.sortRelease);
        setThreeUsersThreeGenres(data.threeUsersThreeGenres);
      });
    setBackgroundImage(getRandomBackground());
  }, []);

  const getRandomBackground = () => {
    const backgrounds = [
      'https://pyxis.nymag.com/v1/imgs/281/e7f/50ef04a1a554762316ebb8ddac3ddeefb2-EEAAO-15475-R.jpg',
      'https://media.npr.org/assets/img/2022/10/19/the-banshees-of-inisherin-012b_banshees_05-10-21_1120-copy_rgb_custom-9b7e2299d55b3d2d66c0dc45fe2a78b7fdbf491c.jpg',
      'https://ourculturemag.com/wp-content/uploads/2020/07/Call-Me-By-Your-Name-bike.jpg',
      'https://pbs.twimg.com/media/FJ-yVxQX0AI3dxe?format=jpg&name=large',
      'https://images.squarespace-cdn.com/content/v1/570a86d07c65e49ce613b080/1482855334342-C7GQ8TWTR7PQ1KM4C552/image-asset.png'

    ];
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        padding: "0",
        margin: "0",
        marginTop: "0"
        
      }}
    >    
      <Container maxWidth="lg">
  <h1 style={{ align: "right", paddingTop: "30%", paddingBottom: "20px", fontFamily: "Poppins Light", fontSize: "80px" }}>CINESCORE</h1>
  <p style={{ fontFamily: "Poppins Regular", marginTop: "-20px" }}> <i>Honest Reviews From Real Users </i></p>

  <Divider style={{ marginBottom: "20px" }} />

  <div style={{ paddingTop: "150px" }}>
    <h2 style={{ color: 'black', fontFamily: "Poppins Light", fontSize: "40px" }}>Movies to Try:</h2>
    <ul>
      {movie.map((item) => (
        <li key={item.movie_id}>
          <NavLink to={`/movie/m${item.movie_id}`}>
            {item.title}
          </NavLink>
        </li>
      ))}
    </ul>
  </div>

  <Divider style={{ marginTop: "50px", marginBottom: "20px" }} />

  <div>
    <h2 style={{ color: 'black', fontFamily: "Poppins Light", fontSize: "40px" }}>Latest Released: </h2>
    <ul>
      {sortRelease.map((item) => (
        <li key={item.movie_id}>
          <NavLink to={`/movie/l${item.movie_id}`}>
            {item.title} - {item.release_date} - {item.avg}
          </NavLink>
        </li>
      ))}
    </ul>
  </div>

  <Divider style={{ marginTop: "50px", marginBottom: "20px" }} />

  <div>
    <h2 style={{ color: 'black', fontFamily: "Poppins Light", fontSize: "40px" }}>Genre Choices by Top Reviewers: </h2>
    <ul>
      {threeUsersThreeGenres.map((item) => (
        <li key={item.user_id}>
          <NavLink to={`/user/${item.user_id}`}>
            {item.user_id} - {item.tag} - {item.avg_rating_of_genre}
          </NavLink>
        </li>
      ))}
    </ul>
  </div>

</Container>

    </div>
  );
}
