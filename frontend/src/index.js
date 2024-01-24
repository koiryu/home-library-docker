import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import { ToastContainer, toast } from 'react-toastify'; // 'toast' を追加
import 'react-toastify/dist/ReactToastify.css';
import ISBNRegistration from './ISBNRegistration';
import ManualRegistration from './ManualRegistration';

toast.configure();

ReactDOM.render(
  <Router>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/isbn-registration" element={<ISBNRegistration />} />
      <Route path="/manual-registration" element={<ManualRegistration />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
