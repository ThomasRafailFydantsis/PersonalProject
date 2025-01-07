import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './pages/UserProfile';
import UserCertificates from './pages/UserCertificates';
import NotAuthorized from './pages/NotAuthorized';
import ExamPage from './pages/ExamPage';
import CertForm from './components/CertForm';
import CreateCert from './components/CreateCert';
import Contact from './pages/Contact';
import AssignMarkerPage from './pages/AssignMarkerPage';
import MarkerAssignmentsPage from './pages/MarkerAssignmentPage';
import GradeExamPage from './pages/GradeExamPage';
import MyCertificate from './pages/MyCertificate';
import UserTable from './pages/UserTable';
import UserProfileAdmin from './pages/UserProfileAdmin';
import AuthPage from './pages/AuthPage';
import ProductPage from './pages/ProductPage';
import AfterLogin from './pages/AfterLogin';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" caseSensitive={false} element={<HomePage />} />
        <Route path="/userTable" caseSensitive={false} element={<UserTable />} />
        <Route path="/login" caseSensitive={false} element={<Login />} />
        <Route path="/register" caseSensitive={false} element={<Register />} />
        <Route path="/notAuthorized" caseSensitive={false} element={<NotAuthorized />} />
        <Route path="/dashboard" caseSensitive={false} element={<Dashboard />} />
        <Route path="/userProfile" caseSensitive={false} element={<UserProfile />} />
        <Route path="/userCertificates" caseSensitive={false} element={<UserCertificates />} />
        <Route path="/take-exam/:certId" caseSensitive={false} element={<ExamPage />} />
        <Route path="/certForm/:certId" caseSensitive={false} element={<CertForm />} />
        <Route path="/CreateCert" caseSensitive={false} element={<CreateCert />} />
        <Route path="/assignMarker" caseSensitive={false} element={<AssignMarkerPage />} />
        <Route path="/marker/assignments" caseSensitive={false} element={<MarkerAssignmentsPage />} />
        <Route path="/exam/submission/:examSubmissionId" caseSensitive={false} element={<GradeExamPage />} />
        <Route path="/MyCertificate" caseSensitive={false} element={<MyCertificate />} />
        <Route path="/profile/:userId" caseSensitive={false} element={<UserProfileAdmin />} />
        <Route path='/AuthPage' caseSensitive={false} element={<AuthPage />} />
        <Route path="/certs/:id" caseSensitive={false} element={<ProductPage />} />
        <Route path="/afterLogin" caseSensitive={false} element={<AfterLogin />} />
        <Route path='/Contactus' caseSensitive={false} element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;