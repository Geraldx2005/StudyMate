import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Dock from "../navigation/Dock";
import NavBar from "../navigation/NavBar";
import LogoutDialog from "../auth/LogoutDialog";
import FileUpload from "../file/FileUpload";
import ContentHolder from "./ContentHolder";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    console.log("Logged out"); // replace with real logout
    setShowLogoutDialog(false);
  };

  const items = [
    { icon: <VscHome size={18} />, label: "Home", onClick: () => navigate("/") },
    { icon: <VscArchive size={18} />, label: "Archive", onClick: () => navigate("/images") },
    { icon: <VscAccount size={18} />, label: "Profile", onClick: () => navigate("/deptlist") },
    { icon: <VscSettingsGear size={18} />, label: "Settings", onClick: () => navigate("/subject") },
  ];
  return (
    <>
      <NavBar onLogoutClick={() => setShowLogoutDialog(true)} />
      <div className="w-full h-full flex flex-col px-2 pt-18 pb-1 bg-white text-6xl font-bold text-[#152a59]">
        {/* Welcome, {user.displayName}! */}
        {/* <FileUpload /> */}
        <ContentHolder />
        <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />
        <LogoutDialog isOpen={showLogoutDialog} onAbortLogoutClick={() => setShowLogoutDialog(false)} />
      </div>
    </>
  );
}

export default Dashboard;
