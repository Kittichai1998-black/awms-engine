import React from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

//======================================================================
const ObjSizeQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "ObjectSize",
  q:
    '[{ "f": "Status", "c":"<", "v": 2}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
};

const CarTypeQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "TransportCarType",
  q: '[{ "f": "Status", "c":"<", "v": 2}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
};

const TransportCar = props => {

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
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
    { Header: "Code", accessor: "Code", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    { Header: "Description", accessor: "Description" },
    { Header: "TransportCarType", accessor: "TransportCarType" },
    { Header: "Brand", accessor: "Brand" },
    { Header: "Model", accessor: "Model" },
    { Header: "Color", accessor: "Color" },
    { Header: "ObjectSize", accessor: "ObjectSize" },
    { Header: "Update By", accessor: "UpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "UpdateTime",
      width: 130,
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
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Object Size",
      dataDropDown: ObjSizeQuery,
      placeholder: "Object Size",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
    },
    {
      field: "TransportCarType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Car Type",
      dataDropDown: CarTypeQuery,
      placeholder: "Car Type",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
    },
    {
      field: "Brand",
      type: "input",
      name: "Brand",
      placeholder: "Brand"
    },
    {
      field: "Model",
      type: "input",
      name: "Model",
      placeholder: "Model"
    },
    {
      field: "Color",
      type: "input",
      name: "Color",
      placeholder: "Color"
    },
  ];

  const columnsEdit = [
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
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Object Size",
      dataDropDown: ObjSizeQuery,
      placeholder: "Object Size",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
    },
    {
      field: "TransportCarType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Car Type",
      dataDropDown: CarTypeQuery,
      placeholder: "Car Type",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
    },
    {
      field: "Brand",
      type: "input",
      name: "Brand",
      placeholder: "Brand"
    },
    {
      field: "Model",
      type: "input",
      name: "Model",
      placeholder: "Model"
    },
    {
      field: "Color",
      type: "input",
      name: "Color",
      placeholder: "Color"
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
        tableType="view"
        tableQuery={"TransportCar"}
        table={"ams_TransportCar"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        height={500}
        pageSize={25}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
  );
};

export default TransportCar;
