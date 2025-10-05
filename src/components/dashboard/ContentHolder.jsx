import React from "react";
import ImageList from "../utility/ImageList";
import ImageCard from "../utility/ImageCard";
import FileUpload from "../file/FileUpload";
import AccordionHolder from "../dashboard/AccordionHolder";
import { Routes, Route } from "react-router-dom";
import SubjectHolder from "../dashboard/SubjectHolder";
import FileUploadCtrl from "./FileUploadCtrl";
import Home from "./Home";
import Search from "./Search";

function ContentHolder() {
  return (
    <>
      <div
        className="w-full min-h-[calc(100vh-80px)]  border-2 border-[#152a59] flex flex-col p-2 rounded-2xl"
        style={{ minHeight: "calc(100vh - 5rem)" }}
      >
        {/* <FileUpload /> */}

        <Routes>
          {/* <ImageList /> */}
          <Route path="/" element={<Home />} />
          <Route path="/navigator" element={<AccordionHolder />} />
          <Route path="/upload" element={<FileUploadCtrl />} />
          <Route path="/search" element={<Search />} />
          <Route path="/subject" element={<SubjectHolder />} />
          <Route path="/images" element={<ImageCard />} />
          {/* <ImageCard /> */}
        </Routes>
      </div>
    </>
  );
}

export default ContentHolder;