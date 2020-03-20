import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmWorkQueueStatus from "../../../components/AmWorkQueueStatus";
import AmRedirectLogSto from "../../../components/AmRedirectLogSto";
import AmRedirectLogWQ from '../../../components/AmRedirectLogWQ'
const Axios = new apicall();

//======================================================================
const WorkQueue = props => {

  const iniCols = [
    {
      Header: "Status",
      accessor: "EventStatus",
      Cell: (data) => {
        return <div style={{ textAlign: "center" }}><AmWorkQueueStatus statusCode={data.original.EventStatus} /></div>
      },
      width: 70
    },
    { Header: "ID", accessor: "ID", width: 70 },
    { Header: "IOType", accessor: "IOType", width: 70 },
    { Header: "RefID", accessor: "RefID", width: 130 },
    { Header: "Pallet No.", accessor: "StorageObject_Code", width: 100 },
    { Header: "Sou.Warehouse", accessor: "Sou_Warehouse_Name", width: 100 },
    { Header: "Sou.Area", accessor: "Sou_Area", width: 100 },
    { Header: "Des.Warehouse", accessor: "Des_Warehouse_Name", width: 100 },
    { Header: "Des.Area", accessor: "Des_Area", width: 100 },
    { Header: "Cur.Warehouse", accessor: "Warehouse_Name", width: 100 },
    { Header: "Cur.Area", accessor: "Area", width: 100 },

    {
      Header: "Create By",
      accessor: "UserName",
      sortable: false,
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Log",
      width: 60,
      sortable: false,
      Cell: e => getRedirectLog(e.original)
    }
  ];
  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px",
          direction: "rtl"
        }}
      >
        <AmRedirectLogSto
          api={
            "/log/storageobjectlog?id=" +
            data.StorageObject_ID +
            "&ParentStorageObject_ID=" +
            data.StorageObject_ID
          }
        />
        <AmRedirectLogWQ api={"/log/workqueuelog?id=" + data.ID} />
      </div>
    );
  };
  const primarySearch = [
    {
      field: "ID",
      type: "input",
      name: "ID",
      placeholder: "Work Queue ID"
    },
    {
      field: "StorageObject_Code",
      type: "input",
      name: "Pallet",
      placeholder: "Pallet"
    }
  ];
  const columnsFilter = [
    {
      field: "CreateTime",
      type: "dateFrom",
      name: "Create From",
      placeholder: "Create Time From"
    },
    {
      field: "CreateTime",
      type: "dateTo",
      name: "Create To",
      placeholder: "Create Time To"
    }
  ];
 

  return (
    <div>
      <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"WorkQueue"}
        manualConditionViw={"[{ 'f': 'Status', c:'!=', 'v': 2}]"}
        iniCols={iniCols}
        notModifyCol={true}
        history={props.history}
      />
    </div>
  );
};

export default WorkQueue;
