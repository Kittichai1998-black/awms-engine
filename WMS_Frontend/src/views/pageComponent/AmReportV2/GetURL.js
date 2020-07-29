import React from "react";
import styled from "styled-components";
import queryString from "query-string";
import Grid from '@material-ui/core/Grid';
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
const DataGenerateURL = (data, fileNameTable) => {
  console.log(data)
  if (data !== undefined) {
    if (fileNameTable === "CURINV") {
      // console.log(data.field)
      var x = DataURL(data)
      console.log(x)

    }
  }

  return x;

}
const DataURL = (data) => {
  console.log(data.field)
  var packCode = data.field === "Code" ? (data.value === undefined || data.value === null ? '' : encodeURIComponent(data.value.trim())) : '';
  var packName = data.field === "Name" ? (data.value === undefined || data.value === null ? '' : encodeURIComponent(data.value.trim())) : '';
  var orderNo = data.field === "orderNo" ? (data.value === undefined || data.value === null ? '' : encodeURIComponent(data.value.trim())) : '';
  var batch = data.field === "batch" ? (data.value === undefined || data.value === null ? '' : encodeURIComponent(data.value.trim())) : '';
  var lot = data.field === "lot" ? (data.value === undefined || data.value === null ? '' : encodeURIComponent(data.value.trim())) : '';

  return window.apipath + "/v2/GetSPReportAPI?"
    + "&packCode=" + packCode
    + "&packName=" + packName
    + "&orderNo=" + orderNo
    + "&batch=" + batch
    + "&lot=" + lot

    + "&spname=CURRENTINV_STOSUM";

}

export { DataGenerateURL }