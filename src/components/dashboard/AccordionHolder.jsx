import React from "react";
import Accordion from "../utility/Accordion";

function AccordionHolder() {
  return (
    <>
      <Accordion dept="Computer Science" deptDirName="cse" />
      <Accordion dept="Mechanical" />
      <Accordion dept="Electrical" />
      <Accordion dept="Civil" />
      <Accordion dept="IT" />
    </>
  );
}

export default AccordionHolder;