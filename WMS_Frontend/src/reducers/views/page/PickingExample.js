import React, { useState, useEffect, useContext } from "react";
import { Button } from "@material-ui/core";
import AmPIckingHH from "../../views/pageComponent/AmPIckingHH";
import DocView from "../../../src/views/pageComponent/DocumentView";
import {
  apicall,
  createQueryString
} from "../../../src/components/function/CoreFunction";
const Axios = new apicall();

//======================================================================
const PickingExample = props => {
  const columns = [
    { field: "docCode", Name: "Document" },
    { field: "destination", Name: "Destination" }
  ];
  const columnsDataPick = [
    { field: "packCode", Name: "packCode" },
    { field: "batch", Name: "batch" }
  ];
  return (
    <div>
      <AmPIckingHH
        displayDetail={columns}
        displayDetailDataPick={columnsDataPick}
      />
    </div>
  );
};

export default PickingExample;
