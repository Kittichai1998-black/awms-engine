import React, { useState, useEffect, useContext } from "react";
import AmMaster from "../pageComponent/AmMasterData/AmMaster";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
import AmEntityStatus from "../../components/AmEntityStatus";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
const Axios = new apicall();

//======================================================================
const testMasterV2 = props => {
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
      fixWidth:30,
      sortable: false,
      filterable: false,
      colStyle:{textAlign:"center"},
      Cell: e => getStatus(e.original)
    },
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
    },
    { Header: "SKU Type Name", accessor: "Name", width: 150 },
    { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },
    { Header: "% Weight Verify", accessor: "ObjectSize_Code", width: 150 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 130,
      type: "datetime",
      filterType:"datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    }
  ];
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "SKU Type Code",
      placeholder: "Code",
      required: true,
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "SKU Type Name",
      placeholder: "Name",
      required: true,
      validate: /^.+$/
    },
    {
      field: "BaseMasterType_Code",
      type: "dropdow",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code"]
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropDown: "search",
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"]
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
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code"]
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropDown: "search",
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Status",
      type: "status",
      typeDropDown: "normal",
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
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdow",
      typeDropDown: "search",
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code"],
      fieldDataKey: "Code"
    },
    {
      field: "Status",
      type: "status",
      typeDropDown: "normal",
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
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"BaseMaster"}
        table={"ams_BaseMaster"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="view"
        pageSize={20}
        height={500}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </div>
  );
};

export default testMasterV2;
