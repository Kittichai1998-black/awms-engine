import React from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

//======================================================================
const AreaLocationMaster = props => {
  
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
      Header: "Status",
      accessor: "Status",
      fixed:"left",
      fixWidth: 162,
      sortable: false,
      filterType:"dropdown",
      colStyle:{textAlign:"center"},
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Area Code", accessor: "AreaCode", width: 150 },
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
      type: "dropdown",
      typeDropDown: "search",
      name: "Area Code",
      dataDropDown: AreaMasterQuery,
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
      type: "dropdown",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "ObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "AreaMaster_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Area Code",
      dataDropDown: AreaMasterQuery,
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
      validate: /^.+$/,
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
      type: "dropdown",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "ObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
      placeholder: "Status"
    }
  ];
  const columnsFilterPri = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    {
      field: "AreaCode",
      type: "dropdown",
      typeDropDown: "search",
      name: "Area Code",
      dataDropDown: AreaMasterQuery,
      placeholder: "Area Code",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    { field: "Gate", type: "input", name: "Gate", placeholder: "Gate" },
    { field: "Bank", type: "input", name: "Bank", placeholder: "Bank" },
    { field: "Bay", type: "input", name: "Bay", placeholder: "Bay" },
    { field: "Level", type: "input", name: "Level", placeholder: "Level" },
    {
      field: "UnitType_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "ObjectSize",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "Status",
      type: "status",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
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
      {/* <MasterData
        columnsFilter={columnsFilter}
        columnsFilterPrimary={columnsFilterPri}
        tableQuery={"AreaLocationMaster"}
        table={"ams_AreaLocationMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      <AmMaster
        columnsFilterPrimary={columnsFilterPri}
        columnsFilter={columnsFilter}
        tableQuery={"AreaLocationMaster"}
        table={"ams_AreaLocationMaster"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="view"
        pageSize={25}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </div>
  );
};

export default AreaLocationMaster;
