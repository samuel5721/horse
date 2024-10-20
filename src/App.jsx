import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import MyPage from './MyPage';
import Admin from './Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/MyPage" element={<MyPage />} />
        <Route path="/dkdrlahWlWldjxor" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
