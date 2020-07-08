import React, { useState, useEffect, useContext } from "react";
import AmMoveLocation from "../../pageComponent/AmMoveLocation/AmMoveLocation";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";

import { useTranslation } from "react-i18next";
import styled from "styled-components";

import AmDropdown from "../../../components/AmDropdown";
const Axios = new apicall();

//======================================================================
const FormInline = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  margin-right: 20px;
  padding-bottom: 10px;
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
const LabelH = styled.label`
  // font-weight: bold;
  width: 100px;
`;
const LabelDD = {
  fontWeight: "bold",
  width: "100px"
};
const WarehouseQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "Warehouse",
  q: "[{ 'f': 'Status', 'c':'!=', 'v': 0}]",
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
};
const MoveLocation = props => {
  const { t } = useTranslation();
  const [warehouse, setWarehouse] = useState(1);
  const columns = [
    {
      field: "Priority",
      type: "input",
      name: "Priority",
      placeholder: "Priority",
      required: true
    }]
  const iniCols = [

    {
      Header: "Moving Jobs",
      accessor: "Code",
      width: 100
    },
    {
      Header: "Base",
      accessor: "Pallet",
      width: 100
    },
    {
      Header: "Status",
      accessor: "PackStatus",
      width: 100
    },
    {
      Header: "Current Area",
      accessor: "Area",
      width: 100
    },
    {
      Header: "Location",
      accessor: "Location",
      width: 100
    },
    {
      Header: "Sou Area",
      accessor: "Sou_Area_Code",
      width: 100
    },
    {
      Header: "Location",
      accessor: "Sou_AreaLocation_Code",
      width: 100
    },
    {
      Header: "Des Area",
      accessor: "Des_Area_Code",
      width: 100
    },
    {
      Header: "Location",
      accessor: "Des_AreaLocation_Code",
      width: 100
    }
  ];
  return (
    <div>
      <FormInline>
        {" "}
        <label style={LabelDD}>
          {t("Warehouse")} :{" "}
        </label>
        <AmDropdown
          id={"WH"}
          placeholder={"Select Warehouse..."}
          fieldDataKey={"ID"}
          fieldLabel={["Code", "Name"]}
          labelPattern=" : "
          width={250}
          ddlMinWidth={200}
          zIndex={1000}
          defaultValue={1}
          queryApi={WarehouseQuery}
          onChange={(value, dataObject, inputID, fieldDataKey) =>
            //getData(value)
            //console.log(value)
            setWarehouse(value)
          }
          ddlType={"normal"}
        />{" "}
      </FormInline>
      <br />
      <AmMoveLocation
        columns={iniCols}
        dataAdd={columns}
        syncWC={false}
        warehouse={warehouse}

      ></AmMoveLocation>

    </div>
  );
};

export default MoveLocation;
