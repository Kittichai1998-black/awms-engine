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

  const [valueInput, setValueInput] = useState({});
  const [objData, setObjData] = useState();
  const onHandleChangeInput = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    valueInput[field] = value;
    console.log(value)
    console.log(field)
    console.log(valueInput[field])
    console.log(valueInput.CodeFrom)
    setDataPallet(valueInput.CodeTo, valueInput.CodeFrom)
  };
  const onHandleChangeInputPalletCode = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      valueInput[field] = value;
      console.log(value)
      console.log(field)
      console.log(valueInput.CodeFrom)
      console.log(valueInput.CodeTo)
      console.log(valueInput[field])
      //setDataPallet(valueInput.CodeTo, valueInput.CodeFrom)
    }
  };
  var arrData1 = null
  const setDataPallet = (CodeTo, CodeFrom) => {
    var arrData = []

    arrData["CodeTo"] = CodeTo
    arrData["CodeFrom"] = CodeFrom

    console.log(arrData)
    //setObjData(arrData)
    arrData1 = arrData
    console.log(setObjData)
  }


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
              id={"CodeTo"}
              placeholder="Scan pallet or box code"
              autoFocus={true}
              type="input"
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInput(value, null, "CodeTo", null, event)
              }
              onKeyPress={(value, obj, element, event) =>
                onHandleChangeInputPalletCode(
                  value,
                  null,
                  "PalletCode",
                  null,
                  event
                )
              }
            /> <LabelH>{" from"} : </LabelH>
            <AmInput
              id={"CodeFrom"}
              placeholder="Scan pallet or box code"
              autoFocus={true}
              type="input"
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInput(value, null, "CodeFrom", null, event)
              }
              onKeyPress={(value, obj, element, event) =>
                onHandleChangeInputPalletCode(
                  value,
                  null,
                  "PalletCode",
                  null,
                  event
                )
              }
            />
            />
          </FormInline>

        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>


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
      {console.log(arrData1)}
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
