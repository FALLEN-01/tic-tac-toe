import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Game from "./Game";
import Result from "./Result";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/result/:gameId" element={<Result />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
