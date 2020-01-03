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
    { value: "98", label: "QC", disabled: true }
  ];
  var dataRadioCheck = [
    // { value: "12", label: "RECEIVED" },
    { value: "98", label: "QC", disabled: false }
  ];
  var defaultDataRadio = { value: "99" };
  const columns = [
    { field: "code", Name: "Reorder" },
    { field: "orderNo", Name: "SI" }
  ];

  return (
    <div>
      <AmCounting
        displayDetail={columns}
        dataRadio={dataRadio}
        dataRadioCheck={dataRadioCheck}
        defaultDataRadio={defaultDataRadio}
        stateDone={true}
      />
    </div>
  );
};

export default CountingAdj;
