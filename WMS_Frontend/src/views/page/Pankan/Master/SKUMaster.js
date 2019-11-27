import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
import AmButton from "../../../../components/AmButton";
import AmDate from "../../../../components/AmDate";
import styled from 'styled-components'
import { apicall } from "../../../../components/function/CoreFunction2";
import AmDialogs from "../../../../components/AmDialogs"
import moment from "moment";
import "moment/locale/pt-br";
import Axios1 from "axios";
const Axios = new apicall();


const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;



//======================================================================
const SKUMaster = props => {

    const [dates, setdates] = useState();
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");




  const UnitTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
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
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const SKUMasterTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "SKUMasterType",
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
      Header: window.project === "TAP" ? "Part NO." : "SKU Code",
      accessor: "Code",
      fixed: "left",
      width: 120
    },
    {
      Header: window.project === "TAP" ? "Part Name" : "SKU Name",
      accessor: "Name",
      width: 250
    },
    { Header: "SKU Type", accessor: "SKUMasterType_Name", width: 100 },
    {
      Header: "Gross Weight",
      accessor: "WeightKG",
      width: 120,
      type: "number"
    },
    { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },
    { Header: "% Weight Verify", accessor: "ObjectSizeCode", width: 150 },
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
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: window.project === "TAP" ? "Part Name" : "SKU Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "SKUMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "SKU Type",
      dataDropDow: SKUMasterTypeQuery,
      placeholder: "SKU Type",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "WeightKG",
      type: "input",
      inputType: "number",
      name: "Gross Weight",
      placeholder: "Gross Weight",
      validate: /^[0-9\.]+$/
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"],
      required: true
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: window.project === "TAP" ? "Part NO." : "SKU Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: window.project === "TAP" ? "Part Name" : "SKU Name",
      placeholder: "Name",
      validate: /^.+$/
    },
    {
      field: "SKUMasterType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "SKU Type",
      dataDropDow: SKUMasterTypeQuery,
      placeholder: "SKU Type",
      fieldLabel: ["Code", "Name"],
      validate: /^.+$/
    },
    {
      field: "WeightKG",
      type: "input",
      inputType: "number",
      name: "Gross Weight",
      placeholder: "Gross Weight",
      validate: /^[0-9\.]+$/
    },
    {
      field: "UnitType_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"]
    },
    {
      field: "ObjectSize_ID",
      type: "dropdow",
      typeDropdow: "search",
      name: "% Weight Verify",
      dataDropDow: ObjectSizeQuery,
      placeholder: "% Weight Verify",
      fieldLabel: ["Code", "Name"]
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
    const columnsFilter = [
        {
            field: "SKUMasterType_Name",
            type: "dropdow",
            typeDropdow: "search",
            name: "SKU Type",
            dataDropDow: SKUMasterTypeQuery,
            placeholder: "SKU Type",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Name"
        },
        {
            field: "WeightKG",
            type: "input",
            inputType: "number",
            name: "Gross Weight",
            placeholder: "Gross Weight",
            validate: /^[0-9\.]+$/
        },
        {
            field: "UnitTypeCode",
            type: "dropdow",
            typeDropdow: "search",
            name: "Unit Type",
            dataDropDow: UnitTypeQuery,
            placeholder: "Unit Type",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code"
        },
        {
            field: "ObjectSizeCode",
            type: "dropdow",
            typeDropdow: "search",
            name: "% Weight Verify",
            dataDropDow: ObjectSizeQuery,
            placeholder: "% Weight Verify",
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

    const BtnexportCSV = () => {
        return <div>
            <FormInline>
                <div style={{ marginLeft: "20px" }}>
                <AmDate
                        TypeDate={"date"}
                        defaultValue={true}                     
                    onChange={(ele) => { onChangeEditorDate(ele) }}
                    />
                </div>
                <AmButton styleType="info"
                    onClick={() => { OnclickExportData() }}
                >{"Export Data"}</AmButton>

                <AmButton styleType="add"
                    onClick={() => { OnclickLoadData() }}
                >{"Load Data"}</AmButton>

            </FormInline>

        </div>

    }

    const onChangeEditorDate = (e) => {
        setdates(e.fieldDataObject)

    }

    const OnclickExportData = () => {
        let dateExports = moment(dates).format("YYMMDD");
        let dataExport = {
            "exportName": "ProductToShop",
            "whereValues": [dates, dateExports],
        }
        Axios.post(window.apipath + "/v2/ExportQueryToFileServerAPI" , dataExport).then((res) => {
            console.log(res)
            if (res.data._result.status === 1) {
                setMsgDialogSuc("Success")
                setStateDialogSuc(true)
            } else {
                setStateDialogErr(true)
                setMsgDialogErr("Export Data Fail")

            }

            })


    }

    const OnclickLoadData = () => {

        Axios.post(window.apipath + "/v2/PutSKUMasterFromFileServerAPI", {}).then((res) => {
    
            if (res.data.apiResults.length > 0) {
                setMsgDialogSuc(res.data.apiResults[0].fileRequest + "Success")
                setStateDialogSuc(true)
            } else {
                setStateDialogErr(true)
                setMsgDialogErr("Load Data Fail")

            }

        })


    }
    const primarySearch = [
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
            name:  "Name",
            placeholder: "Name",
            validate: /^.+$/
        }
    ];

  return (
      <div>
          <AmDialogs
              typePopup={"success"}
              content={msgDialogSuc}
              onAccept={e => {
                  setStateDialogSuc(e);
              }}
              open={stateDialogSuc}
          ></AmDialogs>
          <AmDialogs
              typePopup={"error"}
              content={msgDialogErr}
              onAccept={e => {
                  setStateDialogErr(e);
              }}
              open={stateDialogErr}
          ></AmDialogs>



          <MasterData
        columnsFilterPrimary={primarySearch}
       columnsFilter={columnsFilter}
       customButton={BtnexportCSV()}
        tableQuery={"SKUMaster"}
        table={"ams_SKUMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default SKUMaster;
