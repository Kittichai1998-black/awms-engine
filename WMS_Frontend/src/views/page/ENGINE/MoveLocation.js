import React, { useState, useEffect, useContext } from "react";
import AmMoveLocation from "../../pageComponent/AmMoveLocation";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
import {
  AmTable,
  AmFilterTable,
  AmPagination
} from "../../../components/table";
import AmInput from "../../../components/AmInput";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Pagination from "../../../components/table/AmPagination";
import AmDialogs from "../../../components/AmDialogs";
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
const MoveLocation = props => {
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

      <AmMoveLocation
        columns={iniCols}
        dataAdd={columns}
        syncWC={false}
      ></AmMoveLocation>

    </div>
  );
};

export default MoveLocation;
