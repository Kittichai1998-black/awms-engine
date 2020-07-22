import React from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

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

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 162,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal",
        width:150
      },
      Cell: e => getStatus(e.original)
    },
    {
      Header: "OuterObjectSize",
      accessor: "OutCode",
      fixed: "left",
      fixWidth: 200
    },
    { Header: "InnerObjectSize", accessor: "InCode", width: 200 },
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
      field: "OuterObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "OuterObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "InnerObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "InnerObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "OuterObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "OuterObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "InnerObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "InnerObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
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
      field: "OutCode",
      type: "dropdown",
      typeDropDown: "search",
      name: "OuterObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "OuterObjectSize",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "InCode",
      type: "dropdown",
      typeDropDown: "search",
      name: "InnerObjectSize",
      dataDropDown: ObjectSizeQuery,
      placeholder: "InnerObjectSize",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    }
  ];
  const columnsFilter = [
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
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"ObjectSizeMap"}
        table={"ams_ObjectSizeMap"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
      <AmMaster
                columnsFilterPrimary={primarySearch}
                columnsFilter={columnsFilter}
                tableQuery={"ObjectSizeMap"}
                table={"ams_ObjectSizeMap"}
                dataAdd={columns}
                history={props.history}
                columns={iniCols}
                dataEdit={columnsEdit}
                tableType="view"
                height={500}
                pageSize={25}
                updateURL={window.apipath + "/v2/InsUpdDataAPI"}
            />
    </div>
  );
};

export default ObjectSizeMap;
