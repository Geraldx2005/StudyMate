import React from "react";
import ContentDisplay from "./ContentDisplay";

function ContentHolder() {
  return (
    <>
      <div className="w-full flex flex-col border-2 border-[#152a59] my-2 rounded-2xl bg-white">
        <ContentDisplay />
      </div>
    </>
  );
}

export default ContentHolder;
