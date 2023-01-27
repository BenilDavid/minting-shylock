import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import "core-js/stable";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WalletChecker from './component/WalletChecker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThirdwebProvider desiredChainId={ChainId.Goerli}>
      {/* <App /> */}
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<App />} />
          <Route exact path="/wallet-checker" element={<WalletChecker />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ThirdwebProvider>
);
