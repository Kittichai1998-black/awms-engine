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
  // const [resetPage, setResetPage] = useState(false);
  // useEffect(() => {
  //   if (resetPage === true) {
  //     setResetPage(false);
  //   }
  // }, [resetPage]);

  const { t } = useTranslation();
  const [page, setPage] = useState();
  const [totalSize, setTotalSize] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [valueText, setValueText] = useState("");
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  // const getData = () => {
  //   Axios.get(
  //     window.apipath +
  //     "/v2/GetSPReportAPI?" +
  //     "&LogRefID=" +
  //     valueText +
  //     "&spname=LOG_SEARCH"
  //   ).then(res => {
  //     console.log(res);
  //     if (res) {
  //       if (res.data._result.status !== 0) {
  //         setTotalSize(res.data.datas.length);
  //         setDataSource(res.data.datas);
  //         setPage(0);
  //         setResetPage(true);
  //         setValueText("");
  //       } else {
  //         setOpenError(true);
  //         setTextError(res.data._result.message);
  //         setValueText("");
  //       }
  //     }
  //   });
  // };

  return (
    <div>

      <AmMoveLocation></AmMoveLocation>

    </div>
  );
};

export default MoveLocation;
