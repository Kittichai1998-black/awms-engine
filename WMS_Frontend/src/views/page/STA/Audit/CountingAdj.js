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
  var dataRadio = [
    // { value: "12", label: "RECEIVED" },
    { value: "98", label: "QC" }
  ];
  var defaultDataRadio = { value: "99" };
  const columns = [
    { field: "packCode", Name: "SKU Code" },
    { field: "orderNo", Name: "Order No" }
  ];

  return (
    <div>
      <AmCounting
        displayDetail={columns}
        dataRadio={dataRadio}
        defaultDataRadio={defaultDataRadio}
        stateDone={true}
      />
    </div>
  );
};

export default CountingAdj;
