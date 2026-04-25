import React, { useState } from "react";
import axios from "axios";
import ApiButton from "../components/ApiButton";

export default function HomePage() {
  const [status, setStatus] = useState("Status: Waiting for click...");

  const handleConnect = async () => {
    try {
      setStatus("Status: Connecting...");
      const response = await axios.get("http://localhost:8080/api/hello");
      setStatus(`Status: ${response.data}`);
    } catch (error) {
      setStatus("Status: Error! Is Backend running?");
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-zinc-900 text-center">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        Intellecta is Live!
      </h1>
      <p className="mt-4 text-zinc-400 font-mono">{status}</p>
      <ApiButton onClick={handleConnect} label="Test API Connection" />
    </div>
  );
}