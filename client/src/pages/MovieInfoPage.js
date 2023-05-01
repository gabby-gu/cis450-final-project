import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';

import { formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

export default function MovieInfoPage() {
  const { movie_id } = useParams();

  const [movieData, setmovieData] = useState({});
  const [posterUrl, setPosterUrl] = useState('');
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/movie/${movie_id}`)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson);
        setmovieData(resJson.movieInfoResults[0]);
        setUserList(resJson.userList);
        const imdb_id = resJson.movieInfoResults[0].imdb_id;
        const api_key = 'afeb2e4f';
        const url = `http://www.omdbapi.com/?apikey=${api_key}&i=${imdb_id}`;
        fetch(url)
          .then(response => response.json())
          .then(data => {
            const posterUrl = data.Poster;
            console.log(posterUrl);
            setPosterUrl(posterUrl);
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  }, [movie_id]);

  return (
    <Container style={{ marginTop: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex' }}>
        {posterUrl && <img src={posterUrl} style={{ width: '40%', marginRight: '20px' }} />}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'Arial', fontSize: '40px', margin: 0, fontWeight: 'bold' }}>{movieData.title}</h1>
          <p style={{ fontFamily: 'Arial', fontSize: '22px', margin: 0 }}>
            <span style={{ fontWeight: 'bold', color: 'blue' }}>Release Year: </span>
            {formatReleaseDate(movieData.release_date)}
          </p>
          <p style={{ fontFamily: 'Arial', fontSize: '22px', margin: 0 }}>
            <span style={{ fontWeight: 'bold', color: 'blue' }}>Average Rating: </span>
            {movieData.avg_rating}
          </p>
          <p style={{ fontFamily: 'Arial', fontSize: '22px', margin: 0 }}>
            <span style={{ fontWeight: 'bold', color: 'blue' }}>Synopsis: </span>
            {movieData.overview}
          </p>
        </div>
      </div>
      {userList.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '50px' }}>
          <h2 style={{ fontFamily: 'Arial', fontSize: '28px', margin: 20, color: 'blue'}}>Users:</h2>
          <ul style={{ fontFamily: 'Arial', fontSize: '22px', margin: '10px 0 0 0', padding: 0 }}>
            {userList.map(user => (
              <li key={user.user_id}>
                <a href={`/user/${user.user_id}`}>{user.user_id}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}
