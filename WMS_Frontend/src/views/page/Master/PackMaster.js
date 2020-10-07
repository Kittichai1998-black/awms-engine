import React from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

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

  const columns = [
    {
      field: "SKUMaster_ID",
      type: "findPopup",
      name: "SKU Code",
      findPopopQuery: SKUMasterQuery,
      fieldValue:"ID",
      placeholder: "SKU Code",
      findPopupTitle:"SKU",
      findPopupColumns:colsSKUMaster,
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "input",
      name: "Pack Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Pack Name",
      placeholder: "Name"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      inputType: "number",
      name: "% WeightAccept",
      placeholder: "WeightPercent"
    },
    {
      field: "Volume",
      type: "input",
      inputType: "number",
      name: "Volume",
      placeholder: "Volume"
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
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "SKUMaster_ID",
      type: "findPopup",
      name: "SKU Code",
      findPopopQuery: SKUMasterQuery,
      fieldValue:"ID",
      placeholder: "SKU Code",
      findPopupTitle:"SKU",
      findPopupColumns:colsSKUMaster,
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Code",
      type: "input",
      name: "Pack Code",
      placeholder: "Code",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Pack Name",
      placeholder: "Name"
    },
    {
      field: "WeightPercent",
      type: "input",
      inputType: "number",
      name: "Weight Percent",
      placeholder: "WeightPercent"
    },
    {
      field: "Volume",
      type: "input",
      inputType: "number",
      name: "Volume",
      placeholder: "Volume"
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
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
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
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    {
      field: "SKUMaster",
      type: "findPopup",
      colsFindPopup: colsSKUMaster,
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      dataDropDown: SKUMasterQuery,
      placeholder: window.project === "TAP" ? "Part NO." : "SKU Code",
      labelTitle:
        "Search of " + window.project === "TAP" ? "Part NO." : "SKU Code",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "WeightPercent",
      type: "input",
      inputType: "number",
      name: "Weight Percent",
      placeholder: "WeightPercent"
    },
    {
      field: "Volume",
      type: "input",
      inputType: "number",
      name: "Volume",
      placeholder: "Volume"
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
      type: "dropdown",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSizeCode",
      type: "dropdown",
      typeDropDown: "search",
      name: "% Weight Verify",
      dataDropDown: ObjectSizeQuery,
      placeholder: "% Weight Verify",
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
  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 162,
      sortable: false,
      colStyle:{textAlign:"center"},
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    {
      Header: "SKU Code",
      accessor: "SKUMaster",
      width: 120
    },
    { Header: "Code", accessor: "Code", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    {
      Header: "% Weight Accept",
      accessor: "PercentWeightAccept",
      width: 150
    },
    {
      Header: "Volume",
      accessor: "Volume",
      width: 100
    },
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
      {/* <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"PackMaster"}
        table={"ams_PackMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"PackMaster"}
        table={"ams_PackMaster"}
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

export default PackMaster;
