"use client";
import React, { useEffect, useState } from "react";
import SubjectSelector from "../utility/SubjectSelector";
import { ref, listAll } from "firebase/storage";
import { storage } from "../../firebase";
import { Link } from "react-router-dom";

export default function SubjectHolder() {
  const [subjects, setSubjects] = useState([]);
  const [folderPath, setFolderPath] = useState("");
  const [fnlPath, setFnlPath] = useState("");
  const [loading, setLoading] = useState(true);

  // Get folderPath from sessionStorage on component mount
  useEffect(() => {
    const savedFolderPath = sessionStorage.getItem("folderPath");
    if (savedFolderPath) {
      setFolderPath(savedFolderPath);
    }
  }, []);

  function setFnlLocation(path) {
    setFnlPath(path);
    sessionStorage.setItem("fnlPath", path);
    console.log("Final path set to:", path);
  }  

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        setLoading(true);
        const parentRef = ref(storage, `${folderPath}/`); // parent folder
        const res = await listAll(parentRef);
        const dirNames = res.prefixes.map((folderRef) => folderRef.name);
        setSubjects(dirNames);
      } catch (error) {
        console.error("Error fetching dirs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (folderPath) {
      fetchDirs();
    } else {
      setLoading(false);
    }
  }, [folderPath]); // dependency on folderPath

  // Spinner component - centered in full height container
  if (loading) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-112px)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#152a59]"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {subjects.map((subj) => (
        <Link key={subj} to="/images" onClick={() => setFnlLocation(`${folderPath}/${subj}`)}>
          <SubjectSelector subject={subj} />
        </Link>
      ))}
    </div>
  );
}