import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Dock from "../navigation/Dock";
import NavBar from "../navigation/NavBar";
import LogoutDialog from "../auth/LogoutDialog";
import FileUpload from "../file/FileUpload";
import ContentHolder from "./ContentHolder";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, } from "react-icons/vsc";
import { MdCloudUpload } from "react-icons/md";
import { LuCloudUpload, LuSearch, LuFolderSearch, LuHouse } from "react-icons/lu";
// import { IoCloudUploadOutline } from "react-icons/io5";
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
    { icon: <LuHouse size={22} />, label: "Home", onClick: () => navigate("/") },
    { icon: <LuFolderSearch  size={22} />, label: "Navigator", onClick: () => navigate("/navigator") },
    { icon: <LuCloudUpload size={22} />, label: "File Upload", onClick: () => navigate("/upload") },
    { icon: <LuSearch  size={22} />, label: "Search", onClick: () => navigate("/search") },
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
