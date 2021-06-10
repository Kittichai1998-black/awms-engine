import React from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

//======================================================================
const BranchMaster = props => {
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
    { Header: "Name", accessor: "Name" },
    { Header: "Description", accessor: "Description" },
    { Header: "Start Plan", accessor: "StartPlanDate" },
    { Header: "Every Day", accessor: "NextPlanDay"},
    { Header: "Every Month", accessor: "NextPlanMonth"}
  ];
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "Plan Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Plan Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description",
      required: true
    },
    {
      field: "StartPlanDate",
      type: "date",
      name: "Start Plan",
      placeholder: "Start Plan",
      required: true
    },
    {
      field: "NextPlanDay",
      type: "input",
      name: "Every Day",
      placeholder: "Day",
      validate: /^[0-9]+$/,
      required: true
    },
    {
      field: "NextPlanMonth",
      type: "input",
      name: "Every Month",
      placeholder: "Month",
      validate: /^[0-9]+$/,
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

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Plan Code",
      placeholder: "Code",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Plan Name",
      placeholder: "Plan Name",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description",
      required: false
    },
    {
      field: "StartPlanDate",
      type: "date",
      name: "Start Plan",
      placeholder: "Start Plan",
      required: true
    },
    {
      field: "NextPlanDay",
      type: "number",
      name: "Every Day",
      placeholder: "Day",
      validate: /^[0-9]+$/,
      required: true
    },
    {
      field: "NextPlanMonth",
      type: "number",
      name: "Every Month",
      placeholder: "Month",
      validate: /^[0-9]+$/,
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
    { field: "Name", type: "input", name: "Name", placeholder: "Name" },
    { field: "Description", type: "input", name: "Description", placeholder: "Description" }
  ];
  const columnsFilter = [
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
    <>
      {/* <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"Branch"}
        table={"ams_Branch"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"MaintenancePlan"}
        table={"ams_MaintenancePlan"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="master"
        height={500}
        pageSize={25}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </>
  );
};

export default BranchMaster;
