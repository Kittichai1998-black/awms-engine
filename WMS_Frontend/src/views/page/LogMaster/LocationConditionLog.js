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

const LocationConditionLog = (props) => {
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
      Header: "Priority",
      accessor: "Priority",
      width: 50,
    },
    {
      Header: "Bank",
      accessor: "LocationBankNumRange",
      width: 50,
    },
    {
      Header: "Bay",
      accessor: "LocationBayNumRange",
      width: 50,
    },
    {
      Header: "Level",
      accessor: "LocationLvNumRange",
      width: 50,
    },
    {
      Header: "Min Qty",
      accessor: "MinQuantity",
      width: 50,
    },
    {
      Header: "Max Qty",
      accessor: "MaxQuantity",
      width: 50,
    },
    // {
    //   Header: "ObjectSize ID",
    //   accessor: "ObjectSize_ID",
    //   width: 50,
    // },
    // {
    //   Header: "ObjectSize Code",
    //   accessor: "ObjectSize_Code",
    //   width: 50,
    // },
    // {
    //   Header: "SKUMasterType ID",
    //   accessor: "SKUMasterType_ID",
    //   width: 50,
    // },
   
    // {
    //   Header: "SKUMasterType GroupType",
    //   accessor: "SKUMasterType_GroupType",
    //   width: 50,
    // },
    {
      Header: "SKUMaster ID",
      accessor: "SKUMaster_ID",
      width: 50,
    },
    {
      Header: "SKUMaster Code",
      accessor: "SKUMaster_Code",
      width: 50,
    },
    {
      Header: "SKUMasterType Code",
      accessor: "SKUMasterType_Code",
      width: 50,
    },
    // {
    //   Header: "Info1",
    //   accessor: "SKUMaster_Info1",
    //   width: 50,
    // },
    // {
    //   Header: "Info2",
    //   accessor: "SKUMaster_Info2",
    //   width: 50,
    // },
    // {
    //   Header: "Info3",
    //   accessor: "SKUMaster_Info3",
    //   width: 50,
    // },
    {
      Header: "UnitType ID",
      accessor: "UnitType_ID",
      width: 50,
    },
    {
      Header: "UnitType Code",
      accessor: "UnitType_Code",
      width: 50,
    },
   
    // {
    //   Header: "Min Weight(KG)",
    //   accessor: "MinWeightKG",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MaxWeightKG",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MinBeforeIncubationDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MaxBeforeIncubationDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MinBeforeShelfLifeDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MaxBeforeShelfLifeDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MinBeforeExpireDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MaxBeforeExpireDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MinDeadStockDay",
    //   width: 50,
    // },
    // {
    //   Header: "Max Weight(KG)",
    //   accessor: "MaxDeadStockDay",
    //   width: 50,
    // },
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
      tableQuery={"AreaLocationConditionEvent"}
      columns={columns}
      height={500}
      // sortable={true}
      historySearch={props.history.location.search}
      pageSize={25}
    />
  </>
}

export default withStyles(styles)(LocationConditionLog);