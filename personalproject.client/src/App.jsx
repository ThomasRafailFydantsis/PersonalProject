import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './pages/UserProfile';
import UserCertificates from './pages/UserCertificates';
import NotAuthorized from './pages/NotAuthorized';
import UserTable from './pages/UserTable';
import ExamPage from './pages/ExamPage';
//import Scores from './pages/Scores';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" caseSensitive={false} element={<HomePage />} />
        <Route path="/userTable" caseSensitive={false} element={<UserTable/>} />
        <Route path="/login" caseSensitive={false} element={<Login />} />
        <Route path="/register" caseSensitive={false} element={<Register />} />
        <Route path="/notAuthorized" caseSensitive={false} element={<NotAuthorized />} />
        <Route path="/dashboard" caseSensitive={false} element={<Dashboard />} />
        <Route path="/userProfile" caseSensitive={false} element={<UserProfile />} />
        <Route path="/userCertificates" caseSensitive={false} element={<UserCertificates />} />
        <Route path="/take-exam/:certId" caseSensitive={false} element={<ExamPage />} />
     {/*<Route path="/scores" caseSensitive={false} element={<Scores />} />*/}
      </Routes>
    </Router>
  );
};

export default App;