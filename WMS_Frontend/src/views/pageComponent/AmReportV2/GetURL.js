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
      + "&orderNo=" + (valueText.OrderNo === undefined || valueText.OrderNo === null ? '' : encodeURIComponent(valueText.OrderNo.trim()))
      + "&batch=" + (valueText.Batch === undefined || valueText.Batch === null ? '' : encodeURIComponent(valueText.Batch.trim()))
      + "&lot=" + (valueText.Lot === undefined || valueText.Lot === null ? '' : encodeURIComponent(valueText.Lot.trim()))

      + "&spname=CURRENTINV_STOSUM";

  } else if (fileNameTable === "DAILYSTO_RECEIVE" || fileNameTable === "DAILYSTO_ISSUE" || fileNameTable === "DAILYSTO_COUNTING" || fileNameTable === "DAILYSTO_AUDIT") {
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
      + "&packCode=" + (valueText.pstoCode === undefined || valueText.pstoCode === null ? '' : encodeURIComponent(valueText.pstoCode.trim()))
      + "&orderNo=" + (valueText.pstoOrderNo === undefined || valueText.pstoOrderNo === null ? '' : encodeURIComponent(valueText.pstoOrderNo.trim()))
      + "&batch=" + (valueText.pstoBatch === undefined || valueText.pstoBatch === null ? '' : encodeURIComponent(valueText.pstoBatch.trim()))
      + "&lot=" + (valueText.pstoLot === undefined || valueText.pstoLot === null ? '' : encodeURIComponent(valueText.pstoLot.trim()))
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

  } else if (fileNameTable === "DAILYSTO_SUM_RECEIVE" || fileNameTable === "DAILYSTO_SUM_ISSUE" || fileNameTable === "DAILYSTO_SUM_COUNTING" || fileNameTable === "DAILYSTO_SUM_AUDIT") {

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
      + "&packCode=" + (valueText.pstoCode === undefined || valueText.pstoCode === null ? '' : encodeURIComponent(valueText.pstoCode.trim()))
      + "&orderNo=" + (valueText.pstoOrderNo === undefined || valueText.pstoOrderNo === null ? '' : encodeURIComponent(valueText.pstoOrderNo.trim()))
      + "&batch=" + (valueText.pstoBatch === undefined || valueText.pstoBatch === null ? '' : encodeURIComponent(valueText.pstoBatch.trim()))
      + "&lot=" + (valueText.pstoLot === undefined || valueText.pstoLot === null ? '' : encodeURIComponent(valueText.pstoLot.trim()))
      + "&spname=DAILY_STOSUM";

  } else if (fileNameTable === "DAILY_LOAD") {

    if (IsEmptyObject(valueText)) {

      valueText.fromDate = moment().format("YYYY-MM-DD")
      valueText.toDate = moment().format("YYYY-MM-DD")
    }
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&dateFrom=" + (valueText.fromDate === undefined || valueText.fromDate === null ? '' : encodeURIComponent(valueText.fromDate))
      + "&dateTo=" + (valueText.toDate === undefined || valueText.toDate === null ? '' : encodeURIComponent(valueText.toDate))
      + "&driverName=" + (valueText.driverName === undefined || valueText.driverName === null ? '' : encodeURIComponent(valueText.driverName.trim()))
      + "&transportCar=" + (valueText.transportCar === undefined || valueText.transportCar === null ? '' : encodeURIComponent(valueText.transportCar.trim()))
      + "&transportObjectCode=" + (valueText.transportObjectCode === undefined || valueText.transportObjectCode === null ? '' : encodeURIComponent(valueText.transportObjectCode.trim()))
      + "&packCode=" + (valueText.pstoCode === undefined || valueText.pstoCode === null ? '' : encodeURIComponent(valueText.pstoCode.trim()))
      + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
      + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
      + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))
      + "&spname=DAILY_LOAD";
  } else if (fileNameTable === "LOG_SEARCH") {
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&LogRefID=" + (valueText.LogRefID === undefined || valueText.LogRefID === null ? '' : encodeURIComponent(valueText.LogRefID.trim()))
      + "&spname=LOG_SEARCH";
  } else if (fileNameTable === "STOCKUSE") {
      return window.apipath + "/v2/GetSPReportAPI?"
          + "&LogRefID=" + (valueText.LogRefID === undefined || valueText.LogRefID === null ? '' : encodeURIComponent(valueText.LogRefID.trim()))
          + "&bank=" + (valueText.bank === undefined || valueText.bank === null ? '' : encodeURIComponent(valueText.bank.trim()))
          + "&bay=" + (valueText.bay === undefined || valueText.bay === null ? '' : encodeURIComponent(valueText.bay.trim()))
          + "&level=" + (valueText.level === undefined || valueText.level === null ? '' : encodeURIComponent(valueText.level.trim()))
          + "&spname=STOCKLOCATIONUSE";
  }

}

export { DataGenerateURL }