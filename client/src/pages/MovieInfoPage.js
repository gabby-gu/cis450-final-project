import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

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
            console.log(posterUrl); // this should output the poster URL
            setPosterUrl(posterUrl);
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  }, [movie_id]);

  return (
    <div style={{ marginTop: '5%' }}>

      
      <Card sx={{ paddingBottom: '20px', borderRadius: '10px', overflow: 'visible', margin: '0 auto', width: '60%', backgroundColor: '#18141c', color: 'white', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)', height: '100%' }}>
        <CardContent>
        
          {/* movie info */}
          <div style={{ display: 'flex' }}>
            {posterUrl && <img src={posterUrl} style={{ width: '40%', height: 'auto', objectFit: 'contain', marginRight: '20px' }} />}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 style={{ fontFamily: 'Poppins Regular', fontSize: '35px', margin: 0, fontWeight: 'normal' }}>{movieData.title}</h1>
              <p style={{ fontFamily: 'Poppins Regular', fontSize: '14px', margin: 0 }}>
                {movieData.avg_rating} / 10 ★
                {formatReleaseDate(movieData.release_date)}
              </p>
              <p style={{ fontFamily: 'Poppins Regular', fontSize: '14px', lineHeight: 1.8, margin: 0, marginLeft: 0 }}>{movieData.overview}</p>
              
              <p style={{ fontFamily: 'Poppins Regular', fontSize: '14px', lineHeight: 1.8, margin: 0, marginLeft: 0 }}>
              <br />
              Liked By:
              </p>

              <Stack direction="column" spacing={1} style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  

                {userList.map(user => (
                    <a href={`/user/${user.user_id}`} style = {{textDecoration: 'none'}}>
                        <Chip
                            avatar={<Avatar>{user.user_id.charAt(0)}</Avatar>}
                            style={{ backgroundColor: 'black', color: 'white' }}
                            label={user.user_id}
                        />
                    </a>
            
                ))}
             </div>
        </Stack>
        <br/>



        </div>
      </div>

        
    </CardContent>
  
</Card>

</div>


  );
}
