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
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  

export default function UserPage() {
  const { user_id } = useParams();

  // check if user_id is all numbers
  const isAllNumbers = /^\d+$/.test(user_id);

  const [userData, setUserData] = useState([{}]); 
  const [overAvg, setOverAvg] = useState([{}]); 
  const [perTagMovies, setPerTag] = useState([{}]); 

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
      });
  }, [user_id, isAllNumbers]);
  
  if (isAllNumbers) {
    return <div>ERROR!! This movie is from Movielens database and does not contain any user info!</div>;
  }
  
  return (

    <div style ={{height: '100vh', marginTop: '5%'}}>

    <center>
      <Card sx={{ overflow: 'visible', fontFamily: 'Poppins Regular' , width: '60%', backgroundColor: '#18141c', color: 'white', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)'}}>
        <CardContent>
          
           <Avatar sx={{ width: 120, height: 120, marginTop: '-60px'}}></Avatar>

             <p style = {{fontSize: "40px"}}> {userData[0].username} </p>

            <p style = {{fontSize: "14px"}}>{userData[0].num_reviews} Reviews</p>
            <p style = {{fontSize: "14px"}}>Average Rating Given:   {userData[0].avg_score}<br/> </p>
            
          <Stack spacing={2}>
            {overAvg.map(overAvg => (
              <NavLink to={`/movie/${overAvg.type}${overAvg.movie_id}`} key={overAvg.movie_id} style={{textDecoration: 'none'}}>
                <Item>{overAvg.title}</Item>
              </NavLink>
            ))}
          </Stack>
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

const itemData = [
    {
      img: 'https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGdeQXVyMTAzMDg4NzU0._V1_FMjpg_UX1000_.jpg',
      title: 'Everything Everywhere'
    },
    {
      img: 'https://m.media-amazon.com/images/I/61OUGpUfAyL._AC_UF894,1000_QL80_.jpg',
      title: 'Avatar: Way of the Water'
    },
    {
      img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
      title: 'Camera',
      author: '@helloimnik',
    },
    {
      img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
      title: 'Coffee',
      author: '@nolanissac',
    },
    {
      img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
      title: 'Hats',
      author: '@hjrc33',
    },
    {
      img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
      title: 'Honey',
      author: '@arwinneil',
    },
    {
      img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
      title: 'Basketball',
      author: '@tjdragotta',
    },
    {
      img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
      title: 'Fern',
      author: '@katie_wasserman',
    }
   
  ];
