import { BrowserRouter as Router } from 'react-router-dom'; // Use BrowserRouter instead of Router
import { UserProvider } from './context/context';
import { AppRoutes } from './AppRouter';
import { Toaster } from 'react-hot-toast';

const App = () => (
  <UserProvider>
    <Router>
      <AppRoutes />
    </Router>
    <Toaster position="top-right" reverseOrder={false} />
  </UserProvider>
);

export default App;
