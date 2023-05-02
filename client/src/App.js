import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";
import "./fonts/Poppins-Regular.ttf";
import "./fonts/Poppins-Light.ttf";
import './App.css';

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import AlbumsPage from './pages/AlbumsPage';
import SearchPage from './pages/SearchPage';
import MovieInfoPage from './pages/MovieInfoPage';
import UserPage from './pages/UserPage';


import "./fonts/Poppins-Regular.ttf";
import "./fonts/Poppins-Light.ttf";
import './App.css';

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: indigo,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div style = {{backgroundColor: "#22222e", fontFamily: "helvetica", color: "white"}}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Update this line */}
          <Route path="/movie/:movie_id" element={<MovieInfoPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/user/:user_id" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
