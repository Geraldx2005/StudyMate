import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function LogoutDialog({ isOpen, onAbortLogoutClick }) {
  function handleLogout() {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        // optional: redirect to login page or clear local state
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "ease" }}
          onClick={onAbortLogoutClick} // backdrop click
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "ease" }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            className="w-100 h-40 bg-[#152a59] p-6 rounded-2xl shadow-lg space-y-4 flex items-center flex-col justify-around"
          >
            <h1 className="text-[18px] mb-0 font-semibold text-white">
              Are you certain you want to sign out?
            </h1>
            <div className="w-full flex justify-end gap-6 px-4">
              <button
                onClick={onAbortLogoutClick}
                className="w-full border-2 border-white text-white text-[16px] font-medium px-4 py-2 rounded-xl transition-all duration-300 ease hover:bg-green-100 hover:text-black hover:border-green-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="w-full border-2 border-white text-white text-[16px] font-medium px-4 py-2 rounded-xl transition-all duration-300 ease hover:bg-red-100 hover:text-black hover:border-red-100"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LogoutDialog;
