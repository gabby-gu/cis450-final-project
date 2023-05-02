import { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function MoviesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);

  const loadData = (url) => {
    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        const moviesWithId = resJson.map((movie) => ({ id: movie.movie_id, ...movie }));
        setData(moviesWithId);
      });
  }

  useEffect(() => {
    loadData(`http://${config.server_host}:${config.server_port}/search`);
    fetch(`http://${config.server_host}:${config.server_port}/tag`)
      .then(res => res.json())
      .then(resJson => {
        setTags(resJson.map(tag => tag.tag));
      });
  }, []);

  const search = () => {
    loadData(`http://${config.server_host}:${config.server_port}/search/result?keyword=${title}`);
  }

  const handleTagClick = (tag) => {
    loadData(`http://${config.server_host}:${config.server_port}/search/result?keyword=${tag}`);
  }

  const columns = [
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 300,
      headerClassName: 'title-header',
      renderCell: (params) => {
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
      <h2 style={{ color: 'white' }}>Search Movies</h2>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField label="Movie Title" variant="outlined" style={{ backgroundColor: 'transparent', borderColor: 'white'  }} value={title} onChange={(event) => setTitle(event.target.value)} InputLabelProps={{ style: { color: 'white' } }} />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={search}>Search</Button>
        </Grid>
      </Grid>
      <div style={{ marginTop: 20 }}>
        {tags.map(tag => (
          <Button key={tag} style={{ margin: 5 }} variant="outlined" onClick={() => handleTagClick(tag)}>
            {tag}
          </Button>
        ))}
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={data} columns={columns} pageSize={pageSize} onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} style={{ backgroundColor: 'transparent' }} />
      </div>
    </Container>
  );
}
