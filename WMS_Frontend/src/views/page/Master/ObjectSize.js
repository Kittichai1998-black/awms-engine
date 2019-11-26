import React, { useState, useEffect, useContext } from "react";
import AmSetOjectSize from "../../pageComponent/AmSetOjectSize";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const ObjectSize = props => {
  const EntityEventStatus = [
    { label: "INACTIVE", value: 0 },
    { label: "ACTIVE", value: 1 }
  ];
  const EntityObjectType = [
    { label: "Location", value: 0 },
    { label: "Base", value: 1 },
    { label: "Pack", value: 2 }
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
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    //{ Header: 'ObjectType',accessor: 'ObjectType', width:100,type:'number'},
    {
      Header: "ObjectType Name",
      accessor: "ObjectName",
      width: 120,
      type: "number"
    },
    {
      Header: "MinWeigthKG",
      accessor: "MinWeigthKG",
      width: 150,
      type: "number"
    },
    {
      Header: "MaxWeigthKG",
      accessor: "MaxWeigthKG",
      width: 150,
      type: "number"
    },
    {
      Header: "WeightAccept",
      accessor: "PercentWeightAccept",
      width: 120,
      type: "number"
    },
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
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "iotype",
      typeDropdow: "search",
      name: "ObjectType",
      dataDropDow: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "MinWeigthKG",
      type: "input",
      name: "Min WeigthKG",
      placeholder: "MinWeigthKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "MaxWeigthKG",
      type: "input",
      name: "Max WeigthKG",
      placeholder: "MaxWeigthKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      validate: /^.+$/
    },
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "iotype",
      typeDropdow: "search",
      name: "ObjectType",
      dataDropDow: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "MinWeigthKG",
      type: "input",
      name: "Min WeigthKG",
      placeholder: "MinWeigthKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "MaxWeigthKG",
      type: "input",
      name: "Max WeigthKG",
      placeholder: "MaxWeigthKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    }
  ];
  const primarySearch = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType"},
    {
      field: "ObjectType",
      type: "iotype",
      typeDropdow: "search",
      name: "ObjectType",
      dataDropDow: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "MinWeigthKG",
      type: "input",
      name: "Min WeigthKG",
      placeholder: "MinWeigthKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "MaxWeigthKG",
      type: "input",
      name: "Max WeigthKG",
      placeholder: "MaxWeigthKG"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
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
      <AmSetOjectSize
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"ObjectSize"}
        table={"ams_ObjectSize"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        // customUser={true}
        customPer={true}
        //dataObjectSize={ObjectSize}
        //dataObjectSizeNone={ObjectSize2}
        //columnsEditAPIKey={columnsEditObjectSize}
      />
    </div>
  );
};

export default ObjectSize;
