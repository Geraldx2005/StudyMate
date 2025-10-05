"use client";
import React, { useEffect, useState } from "react";
import SubjectSelector from "../utility/SubjectSelector";
import { ref, listAll } from "firebase/storage";
import { storage } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function SubjectHolder() {
  const { folderPath, setFolderPath, setFnlPath } = useAuth();
  console.log("Current folder path from context:", folderPath);
  const [subjects, setSubjects] = useState([]);

  function setFnlLocation(path) {
    // Use the useAuth hook to get setFolderPath from context
    setFnlPath(path);
    console.log("Final path set to:", path);
  }  

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        const parentRef = ref(storage, `${folderPath}/`); // parent folder
        const res = await listAll(parentRef);
        const dirNames = res.prefixes.map((folderRef) => folderRef.name);
        setSubjects(dirNames);
      } catch (error) {
        console.error("Error fetching dirs:", error);
      }
    };

    fetchDirs();
  }, []); // empty dependency → only runs once

  return (
    <>
      {subjects.map((subj) => (
        <Link key={subj} to="/images" onClick={() => setFnlLocation(`${folderPath}/${subj}`)}>
          <SubjectSelector subject={subj} />
        </Link>
      ))}
    </>
  );
}
