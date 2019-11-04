import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const SKUMasterType = props => {
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

  const SKUGroupType = [
    { label: "FG", value: 1 },
    { label: "WIP", value: 2 },
    { label: "EMP", value: 3 },
    { label: "RAW", value: 4 },
    { label: "STO", value: 5 },
    { label: "DOC", value: 6 }
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
    { Header: "SKU Type Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "SKU Type Name", accessor: "Name", width: 150 },
    { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },
    { Header: "% Weight Verify", accessor: "ObjectSize_Code", width: 120 },
    {
      Header: "Group Type",
      accessor: "GroupType",
      width: 100,
      Cell: e => getNameGroupType(e.original)
    },
    {
      Header: "Update By",
      accessor: "LastUpdateBy",
      width: 100
    },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 130,
      type: "datetime",
      dateFormat: "DD/MM/YYYY hh:mm"
    }
  ];

  const getNameGroupType = value => {
    if (value.GroupType === "1" || value.GroupType === 1) {
      return "FG";
    } else if (value.GroupType === "2" || value.GroupType === 2) {
      return "WIP";
    } else if (value.GroupType === "3" || value.GroupType === 3) {
      return "EMP";
    } else if (value.GroupType === "4" || value.GroupType === 4) {
      return "RAW";
    } else if (value.GroupType === "5" || value.GroupType === 5) {
      return "STO";
    } else if (value.GroupType === "6" || value.GroupType === 6) {
      return "DOC";
    } else {
      return null;
    }
  };
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "SKU Type Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "SKU Type Name",
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
      fieldLabel: ["Code"]
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
      field: "GroupType",
      type: "status",
      typeDropdow: "normal",
      name: "Group Type",
      dataDropDow: SKUGroupType,
      placeholder: "Group Type"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "SKU Type Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "SKU Type Name",
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
      fieldLabel: ["Code"]
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
      field: "GroupType",
      type: "status",
      typeDropdow: "normal",
      name: "Group Type",
      dataDropDow: SKUGroupType,
      placeholder: "Group Type"
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
      name: "SKU Type Code",
      placeholder: "Code"
    },
    {
      field: "Name",
      type: "input",
      name: "SKU Type Name",
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
      fieldLabel: ["Code"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code"],
      fieldDataKey: "Code"
    },
    {
      field: "GroupType",
      type: "status",
      typeDropdow: "normal",
      name: "Group Type",
      dataDropDow: SKUGroupType,
      placeholder: "Group Type"
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
        tableQuery={"SKUMasterType"}
        table={"ams_SKUMasterType"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default SKUMasterType;