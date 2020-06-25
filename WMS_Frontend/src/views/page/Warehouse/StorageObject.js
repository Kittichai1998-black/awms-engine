import React, { useState, useEffect, useContext } from "react";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectV2/AmStorageObjectMultiV2";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmRedirectLog from "../../../components/AmRedirectLog";
import { StorageObjectEvenstatus } from "../../../components/Models/StorageObjectEvenstatus";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";

const Axios = new apicall();

//======================================================================
const StorageObject = props => {

  const iniCols = [

    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: StorageObjectEvenstatus,
        typeDropDown: "normal"
      },
      Cell: e => getStatus(e.original.Status[0].props.children.props.children)
    },
    {
      Header: "IsHold",
      accessor: "HoldStatus",
      fixed: "left",
      width: 50,
      sortable: false
    },
    { Header: "Pallet", accessor: "Pallet", width: 100 },
    {
      Header: "SKU Code",
      accessor: "SKU_Code",
      width: 100
    },
    {
      Header: "SKU Name",
      accessor: "SKU_Name",
      width: 100
    },
    { Header: "Warehouse", accessor: "Warehouse", width: 80 },
    { Header: "Area", accessor: "Area", width: 100 },
    { Header: "Location", accessor: "Location", width: 100 },
    { Header: "Lot", accessor: "Lot", width: 80 },
    {
      Header: "Qty",
      accessor: "Qty",
      width: 70,
      type: "number"
      // Cell: e => getNumberQty(e.original)
    },
    { Header: "Base Unit", accessor: "Base_Unit", width: 100 },
    { Header: "Remark", accessor: "Remark", width: 100 },
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

  const columns = [
    {
      field: "Option",
      type: "input",
      name: "Remark",
      placeholder: "Remark",
      required: true
    }
  ];

  const getNumberQty = value => {
    return parseInt(value.Qty);
  };

  const getStatus = Status => {
    //console.log(Status)
    if (Status === "RECEIVING") {
      return <AmStorageObjectStatus key={Status} statusCode={101} />;
    } else if (Status === "RECEIVED") {
      return <AmStorageObjectStatus key={Status} statusCode={102} />;
    } else if (Status === "AUDITING") {
      return <AmStorageObjectStatus key={Status} statusCode={103} />;
    } else if (Status === "AUDITED") {
      return <AmStorageObjectStatus key={Status} statusCode={104} />;
    } else if (Status === "PICKING") {
      return <AmStorageObjectStatus key={Status} statusCode={153} />;
    } else if (Status === "PICKED") {
      return <AmStorageObjectStatus key={Status} statusCode={154} />;
    } else {
      return null;
    }

  };

  return (
    <div>
      <AmStorageObjectMulti
        iniCols={iniCols}
        selection={true}
        dataRemark={columns}
        export={false}
        multi={true}
      />
    </div>
  );
};

export default StorageObject;
