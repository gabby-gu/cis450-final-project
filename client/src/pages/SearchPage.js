import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function MoviesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null); // track selected movie ID
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search/result`)
      .then(res => res.json())
      .then(resJson => {
        const moviesWithId = resJson.map((movie) => ({ id: movie.movie_id, ...movie }));
        setData(moviesWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search/result?keyword=${title}`)
      .then(res => res.json())
      .then(resJson => {
        const moviesWithId = resJson.map((movie) => ({ id: movie.movie_id, ...movie }));
        setData(moviesWithId);
      });
  }

  const columns = [
  { 
    field: 'title', 
    headerName: 'Title', 
    width: 300, 
    renderCell: (params) => {
      console.log(params.row);
      return (
        <NavLink to={`/movie/${params.row.type}${params.row.movie_id}`}>
          {params.value}
        </NavLink>
      )
    } 
  }
];




  return (
    <Container style={{ minHeight: '100vh' }}>
      <h2>Search Movies</h2>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField label="Movie Title" variant="outlined" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={search}>Search</Button>
        </Grid>
      </Grid>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={data} columns={columns} pageSize={pageSize} onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} />
      </div>
    </Container>
  );
}
