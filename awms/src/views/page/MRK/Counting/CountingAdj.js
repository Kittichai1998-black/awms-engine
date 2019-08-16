import React, { useState, useEffect, useContext } from "react";
import { Button } from "@material-ui/core";
import AmCounting from "../../../pageComponent/AmCounting";
import DocView from "../../../../views/pageComponent/DocumentView";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
const Axios = new apicall();

//======================================================================
const CountingAdj = props => {
  const columns = [
    { field: "packCode", Name: "SKU Code" },
    { field: "batch", Name: "batch" }
  ];

  return (
    <div>
      <AmCounting displayDetail={columns} />
    </div>
  );
};

export default CountingAdj;
