import { useState } from "react";
import Preloader from "./components/Preloader";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
 
  const handleFinishLoading = () => {
    setLoading(false);
  };
 
  return (
    <>
      {loading ? (
        <Preloader onFinished={handleFinishLoading} />
      ) : (
        // Your main content - now with monochrome theme
        <div className="min-h-screen bg-black text-white p-8">
          <header className="mb-8 border-b border-gray-800 pb-4">
            <h1 className="text-5xl font-mono font-bold tracking-tighter">VIBEZ</h1>
            <p className="text-gray-400 mt-2 font-mono tracking-wide">SHARE YOUR THOUGHTS</p>
          </header>
          
          <main>
            <div className="border border-gray-800 p-6 max-w-2xl">
              <h2 className="text-2xl mb-4 font-mono font-semibold">WELCOME</h2>
              <p className="text-gray-300 font-mono">Your content goes here...</p>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;