import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import moment from "moment";
import queryString from "query-string";
import ReactJson from 'react-json-view'
import AmRediRectInfo from '../../../components/AmRedirectInfo'
import Divider from '@material-ui/core/Divider';
import Typography from "@material-ui/core/Typography";
import ViewList from '@material-ui/icons/ViewList';
import PageView from '@material-ui/icons/Pageview';
import SvgIcon from '@material-ui/core/SvgIcon';
import AmInput from "../../../components/AmInput";
import AmLog from "../../pageComponent/AmLog";

const Axios = new apicall();
const styles = theme => ({
  textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});
function JsonIcon(props) {
  return (
    <SvgIcon {...props} >
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}
const handleCopy = (copy) => {
  navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'))
}
 
const SendAPILog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;


  const columns = [
    {
      Header: "Log Time",
      accessor: "LogTime",
      width: 150,
      sortable: true,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "LogTime" },
    },
    {
      Header: "Log Row",
      accessor: "LogRow",
      width: 70,
      sortable: true,
    },
    {
      Header: "LogRefID",
      accessor: "LogRefID",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.LogRefID} api={'/log/apiservicelog?LogRefID=' + data.original.LogRefID} />
          </div>
        )
      }
    },
    {
      Header: "APIService Module",
      accessor: "APIService_Module",
    },
    {
      Header: "API Name",
      accessor: "APIName",
    },
    {
      Header: "Result Message",
      accessor: "ResultMessage",
      Cell: (dataRow) => getResultMessage(dataRow.original),
    },
    {
      Header: "Input/Output",
      Cell: (dataRow) => getIOText(dataRow.original),
      width: 90
    },
    {
      Header: "Start Time",
      accessor: "StartTime",
      width: 200,
      // sortable: true,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "StartTime" },
    },
    {
      Header: "End Time",
      accessor: "EndTime",
      width: 200,
      sortable: true,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "EndTime" },
    }
  ]
  const getIOText = (data) => {
    if (data.InputText || data.OutputText) {

      var datashow = <div>
        <Typography variant="h6">{"Input"}</Typography>
        {data.InputText ? showReactJsonView("Input-Text", JSON.parse(data.InputText))
          : <label>Data Not Found.</label>}
        <br />
        <Divider />
        <br />
        <Typography variant="h6">{"Output"}</Typography>
        {data.OutputText ? showReactJsonView("Output-Text", JSON.parse(data.OutputText))
          : <label>Data Not Found.</label>}
      </div>
      return (
        <div style={{ display: "flex", maxWidth: '160px' }}>
          <AmRediRectInfo type={"custom_button_dialog"}
            startIcon={<JsonIcon fontSize='small' style={{ color: "#1a237e" }} />}
            textButton='JSON'
            styleTypeBtn={'confirm_clear'}
            bodyDialog={datashow} titleDialog="Input / Output" />
        </div>
      )
    } else {
      return null;
    }
  }
  const showReactJsonView = (name, data) => {
    if (data != null || data != undefined) {
      return <ReactJson name={name} src={data}
        displayObjectSize={true} enableClipboard={handleCopy} displayDataTypes={false} indentWidth={2} />
    }
  }
  const getResultMessage = (data) => {
    if (data.ResultMessage) {
      if (data.ResultMessage.length > 50) {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}><label className={classes.textNowrap}>{data.ResultMessage}</label>
            <AmRediRectInfo type={"customdialog"} customIcon={<PageView style={{ color: "#1a237e" }} />} bodyDialog={data.ResultMessage} titleDialog="Result Message" />
          </div>
        )
      } else {
        return <label>{data.ResultMessage}</label>
      }
    } else {
      return null;
    }
  }
  return <>
    <AmLog
      tableQuery={"APIPostEvent"}
      columns={columns}
      height={500}
      // sortable={true}
      historySearch={props.history.location.search}
      pageSize={25}
    />
  </>
}

export default withStyles(styles)(SendAPILog);