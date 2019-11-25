import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
const Axios = new apicall();
//======================================================================
const AreaRoute = props => {
  const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const EntityEventStatus = [
    { label: "INACTIVE", value: 0 },
    { label: "ACTIVE", value: 1 }
  ];
  const IOTypeStatus = [{ label: "IN", value: 0 }, { label: "OUT", value: 1 }];

  const iniCols = [
    {
      Header: "",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    { Header: "IOType", accessor: "IOTypeCode", fixed: "left" },
    { Header: "Sou Area", accessor: "AreaSou", width: 150 },
    { Header: "Des Area", accessor: "AreaDes", width: 150 },
    { Header: "Priority", accessor: "Priority", width: 100, type: "number" },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 120,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    }
  ];
  const columns = [
    {
      field: "IOType",
      type: "iotype",
      typeDropdow: "normal",
      name: "IOType",
      dataDropDow: IOTypeStatus,
      placeholder: "IOType",
      required: true
    },
    {
      field: "Sou_AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Sou Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Des_AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Des Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Des Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority",
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "IOType",
      type: "iotype",
      typeDropdow: "normal",
      name: "IOType",
      dataDropDow: IOTypeStatus,
      placeholder: "IOType"
    },
    {
      field: "Sou_AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Sou Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Des_AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Des Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Des Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority",
      validate: /^.+$/
    },
    {
      field: "Status",
      type: "status",
      typeDropdow: "normal",
      name: "Status",
      dataDropDow: EntityEventStatus,
      placeholder: "Status"
    }
  ];
  const columnsFilter = [
    {
      field: "IOType",
      type: "iotype",
      typeDropdow: "normal",
      name: "IOType",
      dataDropDow: IOTypeStatus,
      placeholder: "IOType"
    },
    {
      field: "AreaSou",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Sou Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "AreaDes",
      type: "dropdow",
      typeDropdow: "normal",
      name: "Des Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Des Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority"
    },
    {
      field: "Status",
      type: "status",
      typeDropdow: "normal",
      name: "Status",
      dataDropDow: EntityEventStatus,
      placeholder: "Status"
    },
    {
      field: "LastUpdateBy",
      type: "input",
      name: "Update By",
      placeholder: "Update By"
    },
    {
      field: "LastUpdateTime",
      type: "dateFrom",
      name: "Update From",
      placeholder: "Update Time From"
    },
    {
      field: "LastUpdateTime",
      type: "dateTo",
      name: "Update To",
      placeholder: "Update Time To"
    }
  ];

  const getStatus = value => {
    if (value.Status === "0" || value.Status === 0) {
      return <AmEntityStatus key={0} statusCode={0} />;
    } else if (value.Status === "1" || value.Status === 1) {
      return <AmEntityStatus key={1} statusCode={1} />;
    } else if (value.Status === "2" || value.Status === 2) {
      return <AmEntityStatus key={2} statusCode={2} />;
    } else {
      return null;
    }
  };

  return (
    <div>
      <MasterData
        columnsFilter={columnsFilter}
        tableQuery={"AreaRoute"}
        table={"ams_AreaRoute"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default AreaRoute;
