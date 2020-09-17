import React, { useState, useEffect, useContext } from "react";
import AmMoveLocation from "../../pageComponent/AmMoveLocation/AmMoveLocation";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import { StorageObjectEvenstatusTxt } from "../../../components/Models/StorageObjectEvenstatus";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import AmDropdown from "../../../components/AmDropdown";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
const Axios = new apicall();

//======================================================================
const FormInline = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  margin-right: 20px;
  // padding-bottom: 10px;
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

    // {
    //   Header: "Moving Jobs",
    //   accessor: "Code",
    //   width: 100
    // },
    {
      Header: "Pallet",
      accessor: "Pallet",
      width: 100
    },
    {
      Header: "Status",
      accessor: "PackStatus",
      width: 120,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: StorageObjectEvenstatusTxt,
        typeDropDown: "normal",
        widthDD: 120,
      },
      Cell: e => getStatus(e.original.PackStatus)
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
  const getStatus = Status => {
    return Status.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getStatus1(y)}
      </div>
    ));
  };
  const getStatus1 = Status => {
    console.log(Status)
    if (Status === "RECEIVED") {
      return <AmStorageObjectStatus key={"RECEIVED"} statusCode={12} />;
    } else if (Status === "AUDITED") {
      return <AmStorageObjectStatus key={"AUDITED"} statusCode={14} />;
    } else if (Status === "COUNTED") {
      return <AmStorageObjectStatus key={"COUNTED"} statusCode={16} />;
    } else if (Status === "CONSOLIDATED") {
      return <AmStorageObjectStatus key={"CONSOLIDATED"} statusCode={36} />;
    } else {
      return null;
    }
  };
  return (
    <div>


      <br />
      <AmMoveLocation
        columns={iniCols}
        dataAdd={columns}
        syncWC={false}
        height={470}
        warehouse={warehouse}
        customTopLeftControl={<FormInline>
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
              setWarehouse(value)
            }
            ddlType={"normal"}
          />{" "}
        </FormInline>}
      ></AmMoveLocation>

    </div>
  );
};

export default MoveLocation;
