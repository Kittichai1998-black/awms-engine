import React from "react";
import styled from "styled-components";
import queryString from "query-string";

import {
  IsEmptyObject
} from "../../../components/function/CoreFunction";
import moment from "moment";
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 0px 0px 0px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
var dataSet = {};
const DataGenerateURL = (valueText, fileNameTable, typeDoc) => {
  console.log(valueText)

  if (fileNameTable === "CURINV") {
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&packCode=" + (valueText.Code === undefined || valueText.Code === null ? '' : encodeURIComponent(valueText.Code.trim()))
      + "&packName=" + (valueText.Name === undefined || valueText.Name === null ? '' : encodeURIComponent(valueText.Name.trim()))
      + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
      + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
      + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))

      + "&spname=CURRENTINV_STOSUM";

  } else if (fileNameTable === "DAILYSTO_RECEIVE" || fileNameTable === "DAILYSTO_ISSUE" || fileNameTable === "DAILYSTO_COUNTING") {
    if (IsEmptyObject(valueText)) {
      valueText.fromDate = moment().format("YYYY-MM-DD")
      valueText.toDate = moment().format("YYYY-MM-DD")
    }
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&dateFrom=" + (valueText.fromDate === undefined || valueText.fromDate === null ? '' : encodeURIComponent(valueText.fromDate))
      + "&dateTo=" + (valueText.toDate === undefined || valueText.toDate === null ? '' : encodeURIComponent(valueText.toDate))
      + "&docCode=" + (valueText.docCode === undefined || valueText.docCode === null ? '' : encodeURIComponent(valueText.docCode.trim()))
      + "&docProcessTypeID=" + (valueText.DocProcessName === undefined || valueText.DocProcessName === null ? '' : encodeURIComponent(valueText.DocProcessName))
      + "&docType=" + typeDoc
      + "&spname=DAILY_STO";

  } else if (fileNameTable === "STC") {

    if (IsEmptyObject(valueText)) {

      valueText.fromDate = moment().format("YYYY-MM-DD")
      valueText.toDate = moment().format("YYYY-MM-DD")
    }
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&fromDate=" + (valueText.fromDate === undefined || valueText.fromDate === null ? '' : encodeURIComponent(valueText.fromDate))
      + "&toDate=" + (valueText.toDate === undefined || valueText.toDate === null ? '' : encodeURIComponent(valueText.toDate))
      + "&packCode=" + (valueText.pstoCode === undefined || valueText.pstoCode === null ? '' : encodeURIComponent(valueText.pstoCode.trim()))
      + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
      + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
      + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))
      + "&docProcessTypeID=" + (valueText.Description === undefined || valueText.Description === null ? '' : encodeURIComponent(valueText.Description))
      + "&spname=DAILY_STOCKCARD";

  } else if (fileNameTable === "DAILYSTO_SUM_RECEIVE" || fileNameTable === "DAILYSTO_SUM_ISSUE" || fileNameTable === "DAILYSTO_SUM_COUNTING") {

    if (IsEmptyObject(valueText)) {

      valueText.fromDate = moment().format("YYYY-MM-DD")
      valueText.toDate = moment().format("YYYY-MM-DD")
    }
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&dateFrom=" + (valueText.fromDate === undefined || valueText.fromDate === null ? '' : encodeURIComponent(valueText.fromDate))
      + "&dateTo=" + (valueText.toDate === undefined || valueText.toDate === null ? '' : encodeURIComponent(valueText.toDate))
      + "&docCode=" + (valueText.docCode === undefined || valueText.docCode === null ? '' : encodeURIComponent(valueText.docCode.trim()))
      + "&docProcessTypeID=" + (valueText.documentProcessType === undefined || valueText.documentProcessType === null ? '' : encodeURIComponent(valueText.documentProcessType))
      + "&docType=" + typeDoc
      + "&spname=DAILY_STOSUM";

  }

}

export { DataGenerateURL }