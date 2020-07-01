import React, { useState, useEffect, useContext } from "react";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectV2/AmStorageObjectMultiV2";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmRedirectLog from "../../../components/AmRedirectLog";
import { StorageObjectEvenstatus } from "../../../components/Models/StorageObjectEvenstatus";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Tooltip from '@material-ui/core/Tooltip';
import queryString from "query-string";

const Axios = new apicall();

//======================================================================
const StorageObject = props => {

  const iniCols = [

    {
      Header: "Status",
      accessor: "Status",
      width: 35,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: StorageObjectEvenstatus,
        typeDropDown: "normal"
      },
      //Cell: e => getStatus(e.original.Status[0].props.children.props.children)
      Cell: e => getStatus(e.original.Status)
    },
    {
      Header: "IsHold",
      accessor: "IsHold",
      width: 50,
      sortable: false,
      Cell: e => getIsHold(e.original.IsHold)
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
      fixWidth: 200,

    },
    { Header: "Project", accessor: "Project", width: 100 },
    { Header: "Customer", accessor: "For_Customer", width: 100 },
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
    { Header: "Remark", accessor: "Remark", width: 100, Cell: e => getOptions(e.original.Options) },
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

  const getOptions = value => {
    var qryStr = queryString.parse(value);
    return qryStr["remark"]
  }
  const getIsHold = value => {
    return value === false ? <div style={{ textAlign: "center" }}>
      <Tooltip title="NONE" >
        <RemoveCircle
          fontSize="small"
          style={{ color: "#9E9E9E" }}
        />
      </Tooltip>
    </div> : <div style={{ textAlign: "center" }}>
        <Tooltip title="HOLD" >
          <CheckCircle
            fontSize="small"
            style={{ color: "black" }}
          />
        </Tooltip>
      </div>
  }
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



  const getStatus = Status => {
    return Status.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getStatus1(y)}
      </div>
    ));
  };
  const getStatus1 = Status => {
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
