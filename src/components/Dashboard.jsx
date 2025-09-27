import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Dock from "./Dock";
import NavBar from "./NavBar";
import LogoutDialog from "./LogoutDialog";
import FileUpload from "./FileUpload";
import ContentDisplay from "./ContentDisplay";
import ContentHolder from "./contentHolder";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

function Dashboard() {
  const { user, loading } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    console.log("Logged out"); // replace with real logout
    setShowLogoutDialog(false);
  };

  const items = [
    { icon: <VscHome size={18} />, label: "Home", onClick: () => alert("Home!") },
    { icon: <VscArchive size={18} />, label: "Archive", onClick: () => alert("Archive!") },
    { icon: <VscAccount size={18} />, label: "Profile", onClick: () => alert("Profile!") },
    { icon: <VscSettingsGear size={18} />, label: "Settings", onClick: () => alert("Settings!") },
  ];
  return (
    <>
      <NavBar onLogoutClick={() => setShowLogoutDialog(true)} />
      <div className="w-full h-screen flex flex-col px-3 pt-20 pb-4 bg-white text-6xl font-bold text-[#152a59]">
        {/* Welcome, {user.displayName}! */}
        <FileUpload />
        <ContentHolder />
        <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />
        <LogoutDialog isOpen={showLogoutDialog} onAbortLogoutClick={() => setShowLogoutDialog(false)}/>
      </div>
    </>
  );
}

export default Dashboard;
