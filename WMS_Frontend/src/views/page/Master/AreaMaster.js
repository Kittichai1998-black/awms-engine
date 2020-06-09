import React from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

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
  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 100 },
    { Header: "Name", accessor: "Name", width: 130 },
    { Header: "Warehouse", accessor: "Warehouse_Code", width: 220 },
    { Header: "AreaMasterType", accessor: "AreaMasterType_Code", width: 250 },
    { Header: "GroupType", accessor: "GroupType", width: 100, type: "number" },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
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
      type: "dropdown",
      typeDropDown: "search",
      name: "Warehouse",
      dataDropDown: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "AreaMasterType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "AreaMasterType",
      dataDropDown: AreaMasterTypeQuery,
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
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Base Type Name",
      placeholder: "Name",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Warehouse_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Warehouse",
      dataDropDown: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "AreaMasterType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "AreaMasterType",
      dataDropDown: AreaMasterTypeQuery,
      placeholder: "AreaMasterType",
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
  const primarySearch = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code"
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name"
    }
  ];
  const columnsFilter = [
    {
      field: "Warehouse_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "Warehouse",
      dataDropDown: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "AreaMasterType_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "AreaMasterType",
      dataDropDown: AreaMasterTypeQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "Status",
      type: "dropdown",
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
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"AreaMaster"}
        table={"ams_AreaMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"AreaMaster"}
        table={"ams_AreaMaster"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        pageSize={25}
        tableType="view"
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </div>
  );
};

export default AreaMaster;
