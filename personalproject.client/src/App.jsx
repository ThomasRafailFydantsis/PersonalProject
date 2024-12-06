import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './pages/UserProfile';
import UserCertificates from './pages/UserCertificates';
//import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" caseSensitive={false} element={<Dashboard />} />
        <Route path="/userProfile" caseSensitive={false} element={<UserProfile />} />
        <Route path="/userCertificates" caseSensitive={false} element={<UserCertificates />} />
      </Routes>
    </Router>
  );
};

export default App;