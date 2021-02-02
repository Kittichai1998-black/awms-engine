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
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmWorkQueueStatus from "../../../components/AmWorkQueueStatus";

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

const WorkQueueLog = (props) => {
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
      Header: "ID",
      accessor: "ID",
      width: 50,
    },
    {
      Header: "WaveSeq ID",
      accessor: "WaveSeq_ID",
      width: 50,
    },
    {
      Header: "Seq",
      accessor: "Seq",
      width: 50,
    },
    {
      Header: "IOType",
      accessor: "IOType",
      width: 60,
      Cell: (data) => {
        if (data.original.IOType === 0) {
          return 'IN'
        } else {
          return 'OUT'
        }
      }
    },
    {
      Header: "Parent WQ ID",
      accessor: "Parent_WorkQueue_ID",
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.Parent_WorkQueue_ID} api={'/log/workqueuelog?id=' + data.original.Parent_WorkQueue_ID} />
          </div>
        )
      }
    },
    // {
    //   Header: "Document",
    //   accessor: "Document_Code",
    // },
    {
      Header: "StorageObject",
      accessor: "StorageObject_Code",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.StorageObject_Code} api={'/log/storageobjectlog?id=' + data.original.StorageObject_ID} />
          </div>
        )
      }
    },
    {
      Header: "Sou_Warehouse",
      accessor: "Sou_Warehouse_Code",
    },
    {
      Header: "Sou_Area",
      accessor: "Sou_Area_Code",
    },
    {
      Header: "Sou_Location",
      accessor: "Sou_AreaLocation_Code",
    },
    {
      Header: "Des_Warehouse",
      accessor: "Des_Warehouse_Code",
    },
    {
      Header: "Des_Area",
      accessor: "Des_Area_Code",
    },
    {
      Header: "Des_Location",
      accessor: "Des_AreaLocation_Code",
    },
    {
      Header: "Warehouse",
      accessor: "Warehouse_Code",
    },
    {
      Header: "Area",
      accessor: "Area_Code",
    },
    {
      Header: "Location",
      accessor: "AreaLocation_Code",
    },
    {
      Header: "Actual Time",
      accessor: "ActualTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "ActualTime" },
    },
    {
      Header: "Start Time",
      accessor: "StartTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "StartTime" },
    },
    {
      Header: "End Time",
      accessor: "EndTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "EndTime" },
    },
    {
      Header: "EventStatus",
      accessor: "EventStatus",
      Cell: (dataRow) => getStatus(dataRow.original.EventStatus, "EventStatus")
    },
    {
      Header: "Status",
      accessor: "Status",
      Cell: (dataRow) => getStatus(dataRow.original.Status, "Status")
    },
    {
      Header: "Create By",
      accessor: "CreateBy_Name",
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "CreateTime" },
    },
    {
      Header: "Modify By",
      accessor: "ModifyBy_Name",
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "ModifyTime" },
    },
  ]
  const getStatus = (value, type) => {
    if (value != null || value != undefined) {
      if (type === "Status") {
        return <AmEntityStatus statusCode={value} />;
      } else if (type === "EventStatus") {
        return <AmWorkQueueStatus statusCode={value} />;
      }
    } else {
      return null;
    }
  };
  const getMessage = (data, field) => {
    if (data[field]) {
      if (data[field].length > 50) {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}><label className={classes.textNowrap}>{data[field]}</label>
            <AmRediRectInfo type={"customdialog"} customIcon={<PageView style={{ color: "#1a237e" }} />} bodyDialog={data[field]} titleDialog={field} />
          </div>
        )
      } else {
        return <label>{data[field]}</label>
      }
    } else {
      return null;
    }
  }
  return <>
    <AmLog
      tableQuery={"WorkQueueEvent"}
      columns={columns}
      height={500}
      // sortable={true}
      historySearch={props.history.location.search}
      pageSize={25}
    />
  </>
}

export default withStyles(styles)(WorkQueueLog);