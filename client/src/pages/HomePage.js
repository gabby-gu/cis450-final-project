import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [songOfTheDay, setSongOfTheDay] = useState({});
  // TODO (TASK 13): add a state variable to store the app author (default to '')
  const [author, setAuthor] = useState('');

  const [selectedSongId, setSelectedSongId] = useState(null);



  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {

    // TODO (TASK 14): add a fetch call to get the app author (name not pennkey) and store it in the state variable
    fetch(`http://${config.server_host}:${config.server_port}/home`)
    .then(res => res.text())
    .then(resText => setAuthor(resText));
  }, []);

  // Here, we define the columns of the "Top Songs" table. The songColumns variable is an array (in order)
  // of objects with each object representing a column. Each object has a "field" property representing
  // what data field to display from the raw data, "headerName" property representing the column label,
  // and an optional renderCell property which given a row returns a custom JSX element to display in the cell.
  const songColumns = [
    {
      field: 'title',
      headerName: 'Movie Title',
      renderCell: (row) => <Link onClick={() => setSelectedSongId(row.song_id)}>{row.title}</Link> // A Link component is used just for formatting purposes
    },
    // {
    //   field: 'album',
    //   headerName: 'Album',
    //   renderCell: (row) => <NavLink to={`/albums/${row.album_id}`}>{row.album}</NavLink> // A NavLink component is used to create a link to the album page
    // },
    // {
    //   field: 'plays',
    //   headerName: 'Plays',
    //   renderCell: (row) => <p>{row.plays}</p>
    // },
  ];

  // TODO (TASK 15): define the columns for the top albums (schema is Album Title, Plays), where Album Title is a link to the album page
  // Hint: this should be very similar to songColumns defined above, but has 2 columns instead of 3
  const albumColumns = [
    {
      field: 'title',
      headerName: 'Album Title',
      renderCell: (row) => <NavLink to={`/albums/${row.album_id}`}>{row.title}</NavLink> // A NavLink component is used to create a link to the album page
    },
    {
      field: 'plays',
      headerName: 'Plays'
    },

  ]

  return (
 

    <Container maxWidth={false} style={{ width: '100%', backgroundImage: `url('https://www.domusweb.it/content/dam/domusweb/it/art/2019/11/17/parasite-il-film-dellanno-usa-larchitettura-per-parlare-a-tutti/parasite-2-movie-domus_risultato.jpg.foto.rbig.jpg')` }}>
  {/* your other code */}
</Container>


  );
};