import React from "react";

function NavBar({ onLogoutClick }) {

  return (
    <>
      <nav className="w-[calc(100%-1rem)] h-12 z-50 fixed top-2 left-0 mx-2 rounded-2xl bg-[#152a59] backdrop-blur-lg text-white flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">StudyMate</h1>
        <button
          onClick={onLogoutClick}
          className="text-md font-medium py-1 px-4 rounded-xl transition-colors duration-200 ease-in-out hover:bg-[#3a58997c]"
        >
          Logout
        </button>
      </nav>
    </>
  );
}

export default NavBar;
