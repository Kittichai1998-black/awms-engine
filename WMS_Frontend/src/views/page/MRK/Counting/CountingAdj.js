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
  // var dataRadio = [
  //   { value: "12", label: "RECEIVED" },
  //   { value: "99", label: "HOLD" }
  // ];
  // var defaultDataRadio = { value: "12" };
  const columns = [
    { field: "packCode", Name: "SKU Code" },
    { field: "batch", Name: "Batch" }
  ];

  return (
    <div>
      <AmCounting
        displayDetail={columns}
        //dataRadio={dataRadio}
        //defaultDataRadio={defaultDataRadio}
        //stateDone={true}
      />
    </div>
  );
};

export default CountingAdj;
