import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Game from './pages/Game';
import JoinGame from './pages/JoinGame';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Results from './pages/Results';
import GameResults from './pages/GameResults';
import Admin from './pages/Admin';
import CreateGame from './pages/CreateGame';
import EditGame from './pages/EditGame';
import GameWaitingRoom from './pages/GameWaitingRoom';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/games" element={<Games />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/join/:gameId" element={<JoinGame />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/edit" element={<EditProfile />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:gameId" element={<GameResults />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/create" element={<CreateGame />} />
        <Route path="/admin/edit/:gameId" element={<EditGame />} />
        <Route path="/game/:gameId/waiting" element={<GameWaitingRoom />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
