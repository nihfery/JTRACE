import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import TraceRecord from "./pages/TraceRecord";
import UploadRecord from "./pages/UploadRecord";
import AccessControl from "./pages/AccessControl"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-[#111] text-gray-100 font-sans">
        <Navbar />

        <main className="flex-1 pt-28">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/UploadRecord" element={<UploadRecord />} />
            <Route path="/AccessControl" element={<AccessControl />} />
            <Route path="/TraceRecord" element={<TraceRecord />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
