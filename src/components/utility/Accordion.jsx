import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Accordion({ dept, deptDirName }) {
  const [isOpen, setIsOpen] = useState(false);

  function setFolderLocation(path) {
    sessionStorage.setItem("folderPath", path);
    console.log("Folder path set to:", path);
  }

  return (
    <div className="w-full border rounded-lg mb-4 shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left">
        <span className="font-semibold text-xl">{dept}</span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`content-${dept}`}
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t"
          >
            <div className="flex flex-col gap-2 p-3 text-sm text-[#152a59] ">
              <div className="w-full py-2 px-4 flex justify-between items-center border-2 border-[#152a59] rounded-lg shadow-sm">
                <h1 className="font-semibold text-lg text-[#152a59]">First Year</h1>
                <div className="flex gap-3 text-base font-medium">
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}/first/odd`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Odd Sem
                  </Link>
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}/first/even`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Even Sem
                  </Link>
                </div>
              </div>

              <div className="w-full py-2 px-4 flex justify-between items-center border-2 border-[#152a59] rounded-lg shadow-sm">
                <h1 className="font-semibold text-lg text-[#152a59]">Second Year</h1>
                <div className="flex gap-3 text-base font-medium">
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Even Sem
                  </Link>
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Odd Sem
                  </Link>
                </div>
              </div>

              <div className="w-full py-2 px-4 flex justify-between items-center border-2 border-[#152a59] rounded-lg shadow-sm">
                <h1 className="font-semibold text-lg text-[#152a59]">Third Year</h1>
                <div className="flex gap-3 text-base font-medium">
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Even Sem
                  </Link>
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Odd Sem
                  </Link>
                </div>
              </div>

              <div className="w-full py-2 px-4 flex justify-between items-center border-2 border-[#152a59] rounded-lg shadow-sm">
                <h1 className="font-semibold text-lg text-[#152a59]">Fourth Year</h1>
                <div className="flex gap-3 text-base font-medium">
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Even Sem
                  </Link>
                  <Link
                    onClick={() => setFolderLocation(`${deptDirName}`)}
                    to="/subject"
                    className="bg-[#152a59] text-white py-1.5 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-[#1d3b8c]"
                  >
                    Odd Sem
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}