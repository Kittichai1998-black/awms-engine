import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";

const Axios = new apicall();

//======================================================================
const PackMaster = props => {
  const UnitTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"<=", "v": 2}]',
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
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const SKUMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const colsSKUMaster = [
    // {
    //   Header: "ID",
    //   accessor: "ID",
    //   fixed: "left",
    //   width: 100,
    //   sortable: true
    // },
    {
      Header: "Code",
      accessor: "Code",
      sortable: true
    },
    {
      Header: "Name",
      accessor: "Name",
      sortable: true
    }
  ];

  const EntityEventStatus = [
    { label: "INACTIVE", value: 0 },
    { label: "ACTIVE", value: 1 }
  ];

  const columns = [
    {
      field: "SKUMaster_ID",
      type: "findPopup",
      colsFindPopup: colsSKUMaster,
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      dataDropDow: SKUMasterQuery,
      placeholder: window.project === "TAP" ? "Part NO." : "SKU Code",
      labelTitle:
        "Search of " + window.project === "TAP" ? "Part NO." : "SKU Code",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "inputPackCode",
      name: "Pack Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "inputPackName",
      name: "Pack Name",
      placeholder: "Name"
    },
    {
      field: "WeightKG",
      type: "input",
      inputType: "number",
      name: "Gross Weight",
      placeholder: "Gross Weight",
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
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "SKUMaster_ID",
      type: "findPopup",
      colsFindPopup: colsSKUMaster,
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      dataDropDow: SKUMasterQuery,
      placeholder: window.project === "TAP" ? "Part NO." : "SKU Code",
      labelTitle:
        "Search of " + window.project === "TAP" ? "Part NO." : "SKU Code",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "inputPackCode",
      name: "Pack Code",
      placeholder: "Code",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "inputPackName",
      name: "Pack Name",
      placeholder: "Name"
    },
    {
      field: "WeightKG",
      type: "input",
      inputType: "number",
      name: "Gross Weight",
      placeholder: "Gross Weight",
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
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"],
      required: true
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
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    {
      field: "SKUMaster",
      type: "findPopup",
      colsFindPopup: colsSKUMaster,
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      dataDropDow: SKUMasterQuery,
      placeholder: window.project === "TAP" ? "Part NO." : "SKU Code",
      labelTitle:
        "Search of " + window.project === "TAP" ? "Part NO." : "SKU Code",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },

    {
      field: "WeightKG",
      type: "input",
      inputType: "number",
      name: "Gross Weight",
      placeholder: "Gross Weight"
    },
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
      field: "ObjectSizeCode",
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
  const iniCols = [
    {
      Header: "",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    {
      Header: window.project === "TAP" ? "Part NO." : "SKU Code",
      accessor: "SKUMaster",
      fixed: "left",
      width: 120
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    {
      Header: "Gross Weight",
      accessor: "WeightKG",
      width: 120,
      type: "number"
    },
    { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },

    { Header: "% Weight Verify", accessor: "ObjectSizeCode", width: 150 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 200,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
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
        tableQuery={"PackMaster"}
        table={"ams_PackMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      />
    </div>
  );
};

export default PackMaster;
