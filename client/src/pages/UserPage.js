import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { NavLink } from 'react-router-dom';

import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';



import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import SongCard from '../components/SongCard';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#22222e',
    fontFamily: "Poppins Regular",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: 'white',
  }));

  

export default function UserPage() {
  const { user_id } = useParams();

  // check if user_id is all numbers
  const isAllNumbers = /^\d+$/.test(user_id);

  const [userData, setUserData] = useState([{}]); 
  const [overAvg, setOverAvg] = useState([]);
  const [perTagMovies, setPerTag] = useState([{}]); 
  const [posterUrlList, setPosterUrlList] = useState([]);


  useEffect(() => {
    if (isAllNumbers) {
      setUserData([]);
      setOverAvg([]);
      setPerTag([]);
      return;
    }

    fetch(`http://${config.server_host}:${config.server_port}/user/${user_id}`)
      .then(res => res.json())
      .then(resJson => {
        setUserData(resJson.userInfo);
        setOverAvg(resJson.overAvg);
        setPerTag(resJson.perTagMovies);

      // fetch all the poster URLs for the movies in the overAvg array
      const posterUrls = [];
      const api_key = 'afeb2e4f';
      for (const movie of resJson.overAvg) {
        const imdb_id = movie.imdb_id;
        const url = `http://www.omdbapi.com/?apikey=${api_key}&i=${imdb_id}`;
        fetch(url)
          .then(response => response.json())
          .then(data => {
            const posterUrl = data.Poster;
            console.log(posterUrl); // this should output the poster URL
            posterUrls.push(posterUrl);
            if (posterUrls.length === resJson.overAvg.length) {
              // add all the fetched poster URLs to the posterUrlList state variable
              setPosterUrlList(posterUrls);
            }
          })
          .catch(error => console.error(error));
      }
    });
  }, [user_id, isAllNumbers]);
  
  //displays an error page if we are looking up a movielens user
  if (isAllNumbers) {
    return <div>ERROR!! This movie is from Movielens database and does not contain any user info!</div>;
  }
  
  return (

    <div style ={{marginTop: '5%'}}>

    <center>

      <Card sx={{ overflow: 'visible', fontFamily: 'Poppins Regular' , width: '60%', backgroundColor: '#18141c', color: 'white', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)'}}>
        <CardContent>
          
          <Avatar sx={{ width: 120, height: 120, marginTop: '-60px'}}></Avatar>

            <div style = {{fontSize: "40px"}}> {userData[0].username} </div>
            <div style = {{fontSize: "14px"}}>{userData[0].num_reviews} Reviews</div>
            <div style = {{fontSize: "14px"}}> Average Rating Given:   {userData[0].avg_score} </div>
            <br />

          {/* three movie posters from overavg */}
          <ImageList cols={3} gap={8} sx={{ maxWidth: '600px' }}>
            {posterUrlList.map((posterUrl, index) => (
              <NavLink to={`/movie/${overAvg.type}${overAvg.movie_id}`} key={overAvg.movie_id} style={{textDecoration: 'none'}}>
                <ImageListItem key={index}>
                  <img src={posterUrl} alt="" loading="lazy" />
                </ImageListItem>
              </NavLink>
             ))}
          </ImageList>
  

          <Stack spacing={2}>
            {perTagMovies.map(perTagMovies => (
              <Item key={perTagMovies.movie_id}>{perTagMovies.tag}: {perTagMovies.title}</Item>
            ))}
          </Stack>
    
        </CardContent>
      
      </Card>
       
    </center>

 </div>
  )
      
}
