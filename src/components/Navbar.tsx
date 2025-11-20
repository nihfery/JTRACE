import { Link, useNavigate } from "react-router-dom";
import { ConnectKitButton, useModal } from "connectkit";
import { useAccount } from "wagmi";
import LogoJKN from "../assets/LogoJKN.svg";
import { useEffect } from "react";

export default function Navbar() {
  const { isConnected, address } = useAccount();
  const { setOpen } = useModal();
  const navigate = useNavigate();

  // ✅ Auto-create user ketika wallet connect
  useEffect(() => {
    const saveUser = async () => {
      if (!address) return;
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: address.toLowerCase() }),
        });
        const data = await res.json();
        if (data?.user?.id) {
          console.log("✅ User synced, ID:", data.user.id);
        } else {
          console.error("❌ Invalid response:", data);
        }
      } catch (err) {
        console.error("❌ Could not save user:", err);
      }
    };
    if (isConnected) saveUser();
  }, [isConnected, address]);

  const handleProtectedNav = (path: string) => {
    if (isConnected) {
      navigate(path);
    } else {
      setOpen(true);
    }
  };

  return (
    <header
      className="fixed top-4 left-1/2 transform -translate-x-1/2 
                 w-[90%] max-w-6xl bg-black/40 backdrop-blur-xl 
                 border border-white/10 shadow-lg rounded-2xl z-50
                 h-16"
    >
      <div className="px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={LogoJKN}
            alt="JournalX Logo"
            className="h-12 w-15"
          />
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-8 text-gray-200 text-sm font-medium">
          <Link to="/" className="hover:text-red-400 transition">
            Home
          </Link>
          <button
            onClick={() => handleProtectedNav("/UploadRecord")}
            className="hover:text-red-400 transition"
          >
            Upload Record
          </button>
          <button
            onClick={() => handleProtectedNav("/AccessControl")}
            className="hover:text-red-400 transition"
          >
            AccessControl
          </button>
           <button
            onClick={() => handleProtectedNav("/TraceRecord")}
            className="hover:text-red-400 transition"
          >
            TraceRecord
          </button>
        </nav>

        {/* Connect Wallet */}
        <div>
          <ConnectKitButton />
        </div>
      </div>
    </header>
  );
}
