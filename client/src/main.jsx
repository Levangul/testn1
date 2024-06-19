import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './App.jsx'
import './index.css'
import Homepage from './pages/Homepage.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Profile from './pages/Profile.jsx'

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
      path: "Login",
      element: <Login />

    },
    {
      path: "Sign-up",
      element: <Signup />

    },
    {
      path: "Profile",
      element: <Profile />

    },
    ]
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);