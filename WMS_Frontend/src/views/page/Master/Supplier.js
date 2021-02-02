import React from "react";

//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import { EntityEventStatus } from "../../../components/Models/EntityStatus";
//======================================================================
const Supplier = props => {
  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 162,
      sortable: false,
      filterType: "dropdown",
      colStyle: { textAlign: "center" },
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: EntityEventStatus,
        typeDropDown: "normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    { Header: "Remark", accessor: "Description" },
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
      name: "Remark",
      placeholder: "Remark"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^.+$/,
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
      field: "Description",
      type: "input",
      name: "Remark",
      placeholder: "Remark"
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
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
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
  const dataExample = [,
    { Code: "XXXXX1", Name: "บริษัท automotion works จำกัด", Description: "บริษัท automotion works จำกัด" },
    { Code: "XXXXX2", Name: "บริษัท XXXXX จำกัด", Description: "บริษัท XXXXX จำกัด" }
  ];
  const columnsTemplate = [
    { Header: "Code", accessor: "Code" },
    { Header: "Name", accessor: "Name" },
    { Header: "Description", accessor: "Description" },
  ];
  return (
    <>
      {/* <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"Supplier"}
        table={"ams_Supplier"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      {/* <AmImportMaster
        table={"ams_Supplier"}
      ></AmImportMaster> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"Supplier"}
        table={"ams_Supplier"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="view"
        height={500}
        pageSize={25}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
        linkLog={"/masterlog/supplierlog?id="}
        tableImport={true}
        dataExample={dataExample}
        columnsTemplate={columnsTemplate}
      />
    </>
  );
};

export default Supplier;
