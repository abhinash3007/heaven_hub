import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import About from './pages/About';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listings from './pages/Listings';
import Search from './pages/Search';
import Heaven from './pages/Heaven';
import Footer from './components/Footer';
import Foundation from './pages/Foundation';
import AuthCheck from './components/AuthCheck';
import CrimeNews from './pages/CrimeNews';

const App = () => {
  const location = useLocation();

  return (
    <div>
      <AuthCheck />
      <Header />
      <Routes>
        <Route path='/' element={<Heaven />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path='/crime' element={<CrimeNews />} />
        <Route path='/search' element={<Search />} />
        <Route path='/listing/:listingId' element={<Listings />} />
        <Route path='/foundation' element={<Foundation />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route path='/update-listing/:listingId' element={<UpdateListing />} />
        </Route>
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
      {location.pathname!== '/sign-in' && location.pathname!== '/sign-up' && location.pathname!=="/profile" && location.pathname!== '/search' && (
        <Footer />
      )}
    </div>
  )
}

export default App;
