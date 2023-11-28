import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './pages/home';
import Assistant from './pages/assistant';
import App from '@/App';
import { initDB } from './dbs/db';

const router = createBrowserRouter([
  { path: '/', element: <Home />, errorElement: <Home /> },
  { path: '/assistant', element: <Assistant /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
initDB().then(() =>
  root.render(
    // <React.StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
    // </React.StrictMode>
  )
);
