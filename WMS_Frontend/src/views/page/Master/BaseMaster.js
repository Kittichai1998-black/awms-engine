import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmInput from "../../../components/AmInput";
import AmEntityStatus from "../../../components/AmEntityStatus";

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styled from "styled-components";
const Axios = new apicall();

//======================================================================
const BaseMaster = props => {
  const LabelH = styled.label`
  font-weight: bold;
  width: 100px;
`;

  const InputDiv = styled.div``;
  const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
  const BaseMasterTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "BaseMasterType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const UnitTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 2}]',
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
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 1}]',
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
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 150 },
    { Header: "Base Type", accessor: "BaseMasterType_Code", width: 200 },
    { Header: "Size", accessor: "ObjectSize_Code", width: 200 },
    { Header: "Unit Type", accessor: "UnitType_Code", width: 100 },
    { Header: "WeightKG", accessor: "WeightKG", width: 100, type: "number" },
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
      type: "Custom",
      name: "Code",
      placeholder: "Code",
      required: true,
      //Cell: e => setMultiBase(e.original)
    },
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
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Base Type",
      dataDropDow: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Size",
      dataDropDow: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
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
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Base Type",
      dataDropDow: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Size",
      dataDropDow: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
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
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    {
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "Base Type",
      dataDropDow: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "Size",
      dataDropDow: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "UnitType_Code",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
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

  const setMultiBase = () => {


    return <ExpansionPanel style={{ width: "100%", marginBottom: "10px" }}>
      <ExpansionPanelSummary style={{ width: "100%", margin: "0px" }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography >Add MultlBase</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <FormInline>
            {" "}
            <LabelH>{"Code to"} : </LabelH>
            <AmInput
              // error={rowError}
              // required={required}
              // id={cols.field}
              style={{ width: "100px", margin: "0px" }}
              id={"Code"}
              style={{ width: "100px", marginLeft: "5px" }}
              placeholder={"code"}
              type="input"
              //value={""}
              onChange={val => {
                console.log(val)
                onChangeEditor("Codefrom", val, true);
              }}
            />  <LabelH>{" from"} : </LabelH>
            <AmInput
              //required={required}
              id={"Code"}
              style={{ width: "100px", marginLeft: "5px" }}
              placeholder={"code"}
              type="input"
              //value={""}
              onChange={val => {
                console.log(val)
                onChangeEditor("Codeto", val, true);
              }}
            />
          </FormInline>

        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>


  };
  var x1 = []
  const onChangeEditor = (field, value, required) => {
    //console.log(field)
    console.log(value)
    // let editDataNew = Clone(editData)
    var x = {}


    x[field] = value



    x1 = x
    console.log(x1)
    console.log(x)
    // if (required) {
    //   if (!editDataNew[field]) {
    //     const arrNew = [...new Set([...inputError, field])]
    //     setInputError(arrNew)
    //   } else {
    //     const arrNew = [...inputError]
    //     const index = arrNew.indexOf(field);
    //     if (index > -1) {
    //       arrNew.splice(index, 1);
    //     }
    //     setInputError(arrNew)
    //   }
    // }
  };
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
        tableQuery={"BaseMaster"}
        table={"ams_BaseMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
        custompopupAddEle={setMultiBase()}
      />
    </div>
  );
};

export default BaseMaster;
