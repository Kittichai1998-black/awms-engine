import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const ObjectSizeMap = props => {
  const ObjectSizeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "ObjectSize",
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
    {
      Header: "OuterObjectSize",
      accessor: "OutCode",
      fixed: "left",
      width: 200
    },
    { Header: "InnerObjectSize", accessor: "InCode", width: 200 },
    {
      Header: "MinQuantity",
      accessor: "MinQuantity",
      width: 100,
      type: "number"
    },
    {
      Header: "MaxQuantity",
      accessor: "MaxQuantity",
      width: 100,
      type: "number"
    },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 130,
      type: "datetime",
      dateFormat: "DD/MM/YYYY hh:mm"
    }
  ];
  const columns = [
    {
      field: "OuterObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "OuterObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "InnerObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "InnerObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "MinQuantity",
      type: "input",
      name: "MinQuantity",
      placeholder: "MinQuantity",
      validate: /^[0-9\.]+$/
    },
    {
      field: "MaxQuantity",
      type: "input",
      name: "MaxQuantity",
      placeholder: "MaxQuantity",
      validate: /^[0-9\.]+$/
    }
  ];

  const columnsEdit = [
    {
      field: "OuterObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "OuterObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "InnerObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "InnerObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "MinQuantity",
      type: "input",
      name: "MinQuantity",
      placeholder: "MinQuantity",
      validate: /^[0-9\.]+$/
    },
    {
      field: "MaxQuantity",
      type: "input",
      name: "MaxQuantity",
      placeholder: "MaxQuantity",
      validate: /^[0-9\.]+$/
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
      field: "OutCode",
      type: "dropdow",
      typeDropdow: "search",
      name: "OuterObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "InCode",
      type: "dropdow",
      typeDropdow: "search",
      name: "InnerObjectSize",
      dataDropDow: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    }
  ];
  const columnsFilter = [
    {
      field: "MinQuantity",
      type: "input",
      name: "MinQuantity",
      placeholder: "MinQuantity"
    },
    {
      field: "MaxQuantity",
      type: "input",
      name: "MaxQuantity",
      placeholder: "MaxQuantity"
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
        tableQuery={"ObjectSizeMap"}
        table={"ams_ObjectSizeMap"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default ObjectSizeMap;
