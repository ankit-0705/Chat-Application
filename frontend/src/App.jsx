import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";


import Login from './routes/loginPage';
import Sign from './routes/signPage';
import Dashboard from './routes/dashboardPage';
import Profile from "./routes/profilePage";
import PrivateRoute from "./components/PrivateRoute";
import ChatState from './context/ChatState.jsx'

function App() {

  return (
    <>
    <ChatState>
      <Router>
          <Routes>
            <Route path="/" element={<Sign/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path='/dashboard' element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
            <Route path="/profile" element={<Profile/>}/>
          </Routes>
      </Router>
    </ChatState>
    </>
  )
}

export default App
