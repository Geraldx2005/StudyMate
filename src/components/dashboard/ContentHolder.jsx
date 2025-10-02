import React from "react";
import ImageList from "../utility/ImageList";
import ImageCard from "../utility/ImageCard";

function ContentHolder() {
  return (
    <>
      <div className="w-full flex flex-col border-2 border-[#152a59] my-2 rounded-2xl bg-white">
        {/* <ImageList /> */}
        <ImageCard />
      </div>
    </>
  );
}

export default ContentHolder;
