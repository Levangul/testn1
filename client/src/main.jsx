import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './App.jsx';
import './index.css';
import Homepage from './pages/Homepage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import Inbox from './components/Inbox.jsx';
import Friends from './components/Friends.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "sign-up",
        element: <Signup />,
      },
      {
        path: "Friends",
        element: <Friends />,
      },
      {
        path: "inbox", 
        element: <Inbox />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "user/:name/:lastname",
        element: <Profile />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);


