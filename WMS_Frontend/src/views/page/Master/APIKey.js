import React, { useState, useEffect, useContext } from "react";

// import AmIconStatus from "../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
import AmSetAPIKey from "../../pageComponent/AmSetAPIKey";
// import styled from "styled-components";
// import AmInput from "../../../components/AmInput";
// import Clone from "../../../components/function/Clone";
// import AmButton from "../../../components/AmButton";
// import Grid from "@material-ui/core/Grid";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

//======================================================================
const APIKey = props => {
  const UserQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "User",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const [dataUser, setDataUser] = useState([]);
  useEffect(() => {
    Axios.get(createQueryString(UserQuery)).then(res => {
      setDataUser(res.data.datas);
    });
  }, []);

  const EntityEventStatus = [
    { label: "INACTIVE", value: 0 },
    { label: "ACTIVE", value: 1 }
  ];
  const iniCols = [
    {
      Header: "",
      accessor: "Status",
      fixed: "left",
      fixWidth: 35,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", fixWidth: 200 },
    { Header: "Name", accessor: "Name", width: 150 },
    { Header: "Description", accessor: "Description", width: 150 },
    { Header: "APIKey", accessor: "APIKey", width: 200 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 150 },
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
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description",
      required: true
    },
    {
      field: "APIKey",
      type: "input",
      name: "APIKey",
      placeholder: "APIKey",
      required: true
    }
  ];
  const columnsEditAPIKey = [
    {
      field: "User_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "User",
      dataDropDow: UserQuery,
      placeholder: "User",
      fieldLabel: ["Code", "Name"]
    }
  ];
  const columnsEdit = [
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
    },
    {
      field: "APIKey",
      type: "input",
      name: "APIKey",
      placeholder: "APIKey"
    },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
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
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    },
    {
      field: "APIKey",
      type: "input",
      name: "APIKey",
      placeholder: "APIKey"
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
      <AmSetAPIKey
        columnsFilter={columnsFilter}
        columnsFilterPrimary={primarySearch}
        tableQuery={"APIKey"}
        table={"ams_APIKey"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        customUser={true}
        dataUser={dataUser}
        columnsEditAPIKey={columnsEditAPIKey}
        history={props.history}
      />
  );
};

export default APIKey;
