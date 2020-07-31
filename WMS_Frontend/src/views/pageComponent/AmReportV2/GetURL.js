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
const DataGenerateURL = (valueText, fileNameTable) => {
  console.log(valueText)
  if (valueText !== undefined) {
    if (fileNameTable === "CURINV") {
      return window.apipath + "/v2/GetSPReportAPI?"
        + "&packCode=" + (valueText.Code === undefined || valueText.Code === null ? '' : encodeURIComponent(valueText.Code.trim()))
        + "&packName=" + (valueText.Name === undefined || valueText.Name === null ? '' : encodeURIComponent(valueText.Name.trim()))
        + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
        + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
        + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))

        + "&spname=CURRENTINV_STOSUM";

    }
  }

  //return null;

}

export { DataGenerateURL }