import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const AreaLocationMaster = props => {
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
  const UnitTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const ObjectSizeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "ObjectSize",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 0}]',
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
    { Header: "Area Code", accessor: "AreaCode", fixed: "left", width: 150 },
    { Header: "Code", accessor: "Code", width: 150 },
    { Header: "Name", accessor: "Name", width: 200 },
    { Header: "Gate", accessor: "Gate", width: 100 },
    { Header: "Bank", accessor: "Bank", width: 70, type: "number" },
    { Header: "Bay", accessor: "Bay", width: 70, type: "number" },
    { Header: "Level", accessor: "Level", width: 70, type: "number" },
    { Header: "GroupType", accessor: "GroupType", width: 100, type: "number" },
    { Header: "Unit Type", accessor: "UnitType_Code", width: 200 },
    { Header: "ObjectSize", accessor: "ObjectSize_Code", width: 200 },
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
      field: "AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Area Code",
      dataDropDow: AreaMasterQuery,
      placeholder: "Area Code",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^[0-9\.]+$/,
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
      field: "Gate",
      type: "input",
      name: "Gate",
      placeholder: "Gate",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Bank",
      type: "input",
      name: "Bank",
      placeholder: "Bank",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Bay",
      type: "input",
      name: "Bay",
      placeholder: "Bay",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Level",
      type: "input",
      name: "Level",
      placeholder: "Level",
      validate: /^[0-9\.]+$/
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "ObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "ObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "AreaMaster_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Area Code",
      dataDropDow: AreaMasterQuery,
      placeholder: "Area Code",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      validate: /^.+$/
    },
    {
      field: "Gate",
      type: "input",
      name: "Gate",
      placeholder: "Gate",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Bank",
      type: "input",
      name: "Bank",
      placeholder: "Bank",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Bay",
      type: "input",
      name: "Bay",
      placeholder: "Bay",
      validate: /^[0-9\.]+$/
    },
    {
      field: "Level",
      type: "input",
      name: "Level",
      placeholder: "Level",
      validate: /^[0-9\.]+$/
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "ObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "ObjectSize",
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
      field: "AreaCode",
      type: "dropdow",
      typeDropdow: "search",
      name: "Area Code",
      dataDropDow: AreaMasterQuery,
      placeholder: "Area Code",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" },
    { field: "Gate", type: "input", name: "Gate", placeholder: "Gate" },
    { field: "Bank", type: "input", name: "Bank", placeholder: "Bank" },
    { field: "Bay", type: "input", name: "Bay", placeholder: "Bay" },
    { field: "Level", type: "input", name: "Level", placeholder: "Level" },
    {
      field: "UnitType_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "ObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "ObjectSize",
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
    const primarySearch = [
        {
            field: "Code",
            type: "input",
            name:  "Code",
            placeholder: "Code",
            validate: /^.+$/
        },
        {
            field: "Name",
            type: "input",
            name: "Name",
            placeholder: "Name",
            validate: /^.+$/
        }
    ];

  return (
    <div>
          <MasterData
              columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"AreaLocationMaster"}
        table={"ams_AreaLocationMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default AreaLocationMaster;
