import React from "react";

function SubjectSelector({subject}) {
  return (
    <>
      <div className="w-full border rounded-lg mb-4 px-4 py-2 shadow-sm hover:bg-gray-100 cursor-pointer transition-all duration-200 ease-in-out">
        <h1 className="font-semibold text-xl">{subject}</h1>
      </div>
    </>
  );
}

export default SubjectSelector;
