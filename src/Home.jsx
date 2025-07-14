// src/Home.jsx
import React from "react";  // optional in React 17+ but safe to include
import { useNavigate } from "react-router-dom"; // only if you need routing

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      {/* Your content goes here */}
    </div>
  );
}
