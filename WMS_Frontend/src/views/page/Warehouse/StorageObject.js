import React, { useState, useEffect, useContext } from "react";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectV2/AmStorageObjectMultiV2";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmRedirectLog from "../../../components/AmRedirectLog";


const Axios = new apicall();

//======================================================================
const StorageObject = props => {

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 50,
      sortable: false,
      //Cell: e => getStatus(e.original)
    },
    {
      Header: "IsHold",
      accessor: "HoldStatus",
      fixed: "left",
      width: 50,
      sortable: false
    },
    { Header: "Pallet", accessor: "Pallet", width: 150 },
    {
      Header: "SKU Code",
      accessor: "SKU_Code",
      width: 150
    },
    {
      Header: "SKU Name",
      accessor: "SKU_Name",
      width: 150
    },
    { Header: "Warehouse", accessor: "Warehouse", width: 150 },
    { Header: "Area", accessor: "Area", width: 130 },
    { Header: "Location", accessor: "Location", width: 120 },
    { Header: "Lot", accessor: "Lot", width: 120 },
    {
      Header: "Qty",
      accessor: "Qty",
      width: 70,
      type: "number"
      // Cell: e => getNumberQty(e.original)
    },
    { Header: "Base Unit", accessor: "Base_Unit", width: 100 },
    { Header: "Remark", accessor: "Remark", width: 150 },
    {
      Header: "Received Date",
      accessor: "Receive_Time",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    },
    {
      width: 60,
      accessor: "",
      Header: "Log ",
      Cell: e => getRedirectLog(e.original)
    }
  ];
  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px"
        }}
      >
        {data.Code}
        <AmRedirectLog
          api={
            "/log/docitemstolog?id=" +
            data.ID +
            "&ParentStorageObject_ID=" +
            data.ID
          }
          history={props.history}
          docID={""}
          title={"Log DocItemSto"}
        >
          {" "}
        </AmRedirectLog>
      </div>
    );
  };

  const getNumberQty = value => {
    return parseInt(value.Qty);
  };



  return (
    <div>
      <AmStorageObjectMulti
        iniCols={iniCols}
        selection={true}
        modifyRemark={true}
        export={false}
        multi={true}
      />
    </div>
  );
};

export default StorageObject;
