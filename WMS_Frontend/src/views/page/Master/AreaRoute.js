import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
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
      Header: "Status",
      accessor: "Status",
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
    {
      Header: "IOType", 
      accessor: "IOTypeCode", 
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:IOTypeStatus,
        typeDropDown:"normal"
      },
      customFilter:{field:"IOType"},
      fixWidth: 100 
    },
    { Header: "Sou Area", accessor: "AreaSou", width: 170 },
    { Header: "Des Area", accessor: "AreaDes" },
    { Header: "Priority", accessor: "Priority", width: 100, type: "number" },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 130,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    }
  ];
  const columns = [
    {
      field: "IOType",
      type: "dropdown",
      typeDropDown: "normal",
      name: "IOType",
      dataDropDown: IOTypeStatus,
      placeholder: "IOType",
      required: true
    },
    {
      field: "Sou_AreaMaster_ID",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Sou Area",
      dataDropDown: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Des_AreaMaster_ID",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Des Area",
      dataDropDown: AreaMasterQuery,
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
      type: "dropdown",
      typeDropDown: "normal",
      name: "IOType",
      dataDropDown: IOTypeStatus,
      placeholder: "IOType",
      required: true
    },
    {
      field: "Sou_AreaMaster_ID",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Sou Area",
      dataDropDown: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Des_AreaMaster_ID",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Des Area",
      dataDropDown: AreaMasterQuery,
      placeholder: "Des Area",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority",
      validate: /^.+$/,
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
      field: "AreaSou",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Sou Area",
      dataDropDown: AreaMasterQuery,
      placeholder: "Sou Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "AreaDes",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Des Area",
      dataDropDown: AreaMasterQuery,
      placeholder: "Des Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    }
  ];
  const columnsFilter = [
    {
      field: "IOType",
      type: "dropdown",
      typeDropDown: "normal",
      name: "IOType",
      dataDropDown: IOTypeStatus,
      placeholder: "IOType"
    },

    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority"
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
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"AreaRoute"}
        table={"ams_AreaRoute"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="view"
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
  );
};

export default AreaRoute;
