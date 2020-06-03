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
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      // Cell: (e) => { console.log(e) }
    },


  ];
  return (
    <div>

      <AmMoveLocation
        columns={iniCols}
        dataAdd={columns}
      ></AmMoveLocation>

    </div>
  );
};

export default MoveLocation;
