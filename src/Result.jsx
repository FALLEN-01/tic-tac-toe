import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 

export default function Result() {
  // const navigate = useNavigate();       // Enable if routing from here
  // const { gameId } = useParams();       // Enable if receiving route params

  // const [state, setState] = useState(""); // Add your own state
  // useEffect(() => { }, []);               // Add logic when component mounts

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Result Page</h1>
      {/* Add your JSX content here */}
    </div>
  );
}
