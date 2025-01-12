import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './context/context';
import AdminLayout from './layout/index.jsx';
import Feed from './components/Feed';
import ProfileScreen from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import CreatePost from './components/NewPost.jsx';

export const AppRoutes = () => {
  const { user, login } = useUser(); // Consume user context

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup onLogin={login} />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          user ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/newpost" element={<CreatePost />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
