import React from "react";
import InputFileUpload from "./InputFileUpload";

function FileUpload() {
  return (
    <>
        <div className="w-full border-2 border-[#152a59] rounded-2xl flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-bold text-blue ">Upload your files here</h1>
            <InputFileUpload />
        </div>
    </>
  );
}

export default FileUpload;
