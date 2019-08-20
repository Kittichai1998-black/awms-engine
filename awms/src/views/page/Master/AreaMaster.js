import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const AreaMaster = props => {
  const AreaMasterTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMasterType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
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

  const iniCols = [
    {
      Header: "",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name" },
    { Header: "Warehouse", accessor: "Warehouse_Code", width: 100 },
    { Header: "AreaMasterType", accessor: "AreaMasterType_Code", width: 250 },
    { Header: "GroupType", accessor: "GroupType", width: 100, type: "number" },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 120,
      type: "datetime",
      dateFormat: "DD/MM/YYYY hh:mm"
    }
  ];
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "Warehouse_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Warehouse",
      dataDropDow: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "AreaMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "AreaMasterType",
      dataDropDow: AreaMasterTypeQuery,
      placeholder: "AreaMasterType",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Base Type Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "Base Type Name",
      placeholder: "Name",
      validate: /^.+$/
    },
    {
      field: "Warehouse_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Warehouse",
      dataDropDow: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "AreaMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "AreaMasterType",
      dataDropDow: AreaMasterTypeQuery,
      placeholder: "AreaMasterType",
      fieldLabel: ["Code", "Name"]
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
      field: "Code",
      type: "input",
      name: "Base Type Code",
      placeholder: "Code"
    },
    {
      field: "Name",
      type: "input",
      name: "Base Type Name",
      placeholder: "Name"
    },
    {
      field: "Warehouse_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "Warehouse",
      dataDropDow: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "AreaMasterType_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "AreaMasterType",
      dataDropDow: AreaMasterTypeQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
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
        tableQuery={"AreaMaster"}
        table={"ams_AreaMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default AreaMaster;
