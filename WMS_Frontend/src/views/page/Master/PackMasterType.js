import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const PackMasterType = props => {
  const ObjectSizeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "ObjectSize",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
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
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
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
    { Header: "Pack Type Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Pack Type Name", accessor: "Name", width: 150 },
    { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },
    { Header: "% Weight Verify", accessor: "ObjectSize_Code" },
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
      field: "Code",
      type: "input",
      name: "Pack Type Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Pack Type Name",
      placeholder: "Name",
      required: true
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
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"]
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Pack Type Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "Pack Type Name",
      placeholder: "Name",
      validate: /^.+$/
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
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
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
  const primarySearch = [
    {
      field: "Code",
      type: "input",
      name: "Pack Type Code",
      placeholder: "Code"
    },
    {
      field: "Name",
      type: "input",
      name: "Pack Type Name",
      placeholder: "Name"
    }
  ];
  const columnsFilter = [
    {
      field: "UnitTypeCode",
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
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
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
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"PackMasterType"}
        table={"ams_PackMasterType"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default PackMasterType;
