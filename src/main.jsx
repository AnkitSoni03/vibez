import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import store from './store/store.js';


// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./components/Login'));
const Signup = React.lazy(() => import('./components/Signup'));
const AllPosts = React.lazy(() => import('./pages/AllPosts'));
const AddPost = React.lazy(() => import('./pages/AddPost'));
const EditPost = React.lazy(() => import('./pages/EditPost'));
const Post = React.lazy(() => import('./pages/Post'));
const AuthLayout = React.lazy(() => import('./components/AuthLayout'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />, // Add this
    children: [
        {
        path: "/",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Home />
          </React.Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthLayout authentication={false}>
              <Login />
            </AuthLayout>
          </React.Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthLayout authentication={false}>
              <Signup />
            </AuthLayout>
          </React.Suspense>
        ),
      },
      {
        path: "/all-posts",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthLayout authentication>
              <AllPosts />
            </AuthLayout>
          </React.Suspense>
        ),
      },
      {
        path: "/add-post",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthLayout authentication>
              <AddPost />
            </AuthLayout>
          </React.Suspense>
        ),
      },
      {
        path: "/edit-post/:id",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthLayout authentication>
              <EditPost />
            </AuthLayout>
          </React.Suspense>
        ),
      },
      
      {
        path: "/post/:slug",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Post />
          </React.Suspense>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);