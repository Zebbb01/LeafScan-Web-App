import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Navbar/Hero/Hero';
import Collections from './components/Collections/Collections';
import Title from './components/Title/Title';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import SignUp from './components/SignUp/SignUp';
import Login from './components/Login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateProfile from './components/UpdateProfile/UpdateProfile';
import Scan from './components/Scan/Scan';
import Forecast from './components/Forecast/ForecastLine';
import SatelliteTimeSeries from './components/Forecast/SatelliteTimeSeries/SatelliteTimeSeries';

const App = () => {
  const [user, setUser] = useState(null);
  const [playState, setPlayState] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/')) {
      document.body.classList.add('authBackground');
    } else {
      document.body.classList.remove('authBackground');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <>
      {location.pathname !== '/' && location.pathname !== '/signup' && !location.pathname.startsWith('/update/') && (
        <Navbar user={user} onLogout={handleLogout} />
      )}
      <Routes>
        <Route path='/' element={<Login setUser={setUser} />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/update/:id' element={<UpdateProfile setUser={setUser} />} />
        <Route path='/home' element={
          <div className='App'>
            <Hero />
            <div className="container">
            <Title subTitle='Disease Detection' title='Scan Your Cacao Leaf' />
            <Scan />
            <Title subTitle='Disease Overview' title='Types of Cacao Leaf Diseases' />
              <Collections />
              <Title subTitle='Forecasting' title='Cacao Production Forecast' />
              <Forecast />
              <SatelliteTimeSeries />
              <About setPlayState={setPlayState} />
              <Title subTitle='Reach Out' title='Contact Us' />
              <Contact />
              <Footer />
            </div>
            <VideoPlayer playState={playState} setPlayState={setPlayState} />
          </div>
        } />
      </Routes>
    </>
  );
};

const Root = () => (
  <BrowserRouter>
    <App />
    <ToastContainer position="bottom-right" />
  </BrowserRouter>
);

export default Root;
