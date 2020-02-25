import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { withStyles } from '@material-ui/core/styles';
import { AmTable, AmFilterTable, AmPagination } from '../../../components/table';
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

const Axios = new apicall();
const styles = theme => ({
  textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});
const APIServiceLog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});
  const [selection, setSelection] = useState();

  const query = {
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "APIServiceEvent",
    q: '',
    f: "ID, LogRefID, APIService_Name,InputText, OutputText, ResultMessage,StartTime,EndTime",
    g: "",
    s: "[{'f':'ID','od':'desc'},{'f':'StartTime','od':'desc'}]",
    sk: 0,
    l: 20,
    all: ""
  };

  const onChangeFilter = (condition, field, value) => {
    let obj = [...filterData];
    if (value === "") {
      obj = obj.filter(x => x.f !== field);
    } else {
      let row = obj.find(x => x.f === field);
      if (row === null || row === undefined) {
        obj.push(
          {
            f: field, c: "=", v: value
          }
        )
      }
      else {
        row.v = value
      }
    }
    setFilterData(obj)
  };

  const onChangeFilterDateTime = (value, field, type) => {
    let datetimeRange = datetime;
    if (value === null || value === undefined) {
      delete datetimeRange[type];
    } else {
      datetimeRange["field"] = field;
      if (type === "dateFrom") datetimeRange[type] = value.fieldDataKey + ":00";
      if (type === "dateTo")
        datetimeRange[type] = value.fieldDataKey + ":00";
    }
    setDatetime(datetimeRange);
  };

  const onHandleFilterConfirm = () => {
    let getQuery = { ...query }
    let filterDatas = [...filterData];
    if (datetime) {
      if (datetime["dateFrom"]) {
        let createObj = {};
        createObj.f = 'StartTime';
        createObj.v = datetime["dateFrom"];
        createObj.c = ">=";
        filterDatas.push(createObj);
      }
      if (datetime["dateTo"]) {
        let createObj = {};
        createObj.f = 'StartTime';
        createObj.v = datetime["dateTo"];
        createObj.c = "<=";
        filterDatas.push(createObj);
      }
    }

    if (props.history.location != null && props.history.location.search != null && props.history.location.search.length > 0) {
      let searchValue = queryString.parse(props.history.location.search);
      let newSel = [];

      Object.entries(searchValue).forEach(([key, value], index) => {
        // console.log(`${index}: ${key} = ${value}`);
        if (index === 0) {
          newSel.push({
            "f": key,
            "c": "like", "v": encodeURIComponent(value)
          });
        } else {
          newSel.push({
            "o": "or", "f": key,
            "c": "like", "v": encodeURIComponent(value)
          });
        }
      });
      filterDatas.unshift({ "q": newSel })
    }

    getQuery.q = JSON.stringify(filterDatas);
    // console.log(getQuery)
    Axios.get(createQueryString(getQuery)).then(res => {
      if (res) {
        if (res.data._result.status !== 0) {
          setDataSource(res.data.datas)
        }
      }
    });
  };

  const filterItem = [{
    field: "APIService_ID",
    component: (condition, rowC, idx) => {
      return (
        <div key={idx} style={{ display: "inline-flex" }}>
          <label
            style={{
              padding: "0 0 0 20px",
              width: "140px",
              paddingTop: "10px"
            }}
          >
            {t("API Service")} :{" "}
          </label>
          <AmDropdown
            width="200px"
            zIndex={1000}
            placeholder={"Select Service"}
            value={selection}
            data={[
              { "label": "Register Work Queue", "value": 13 },
              { "label": "Process Queue", "value": 88 },
              { "label": "Confirm Process Queue", "value": 89 },
              { "label": "Working Work Queue", "value": 16 },
              { "label": "Done Work Queue", "value": 9 },
            ]}
            ddlType="normal"
            onChange={value => {
              onChangeFilter(condition, rowC.field, value)
              setSelection(value)
            }
            }
          />
        </div>
      );
    }
  }, {
    field: "dateFrom",
    component: (condition, rowC, idx) => {
      return (
        <div key={idx} style={{ display: "inline-flex" }}>
          <label style={{ padding: "10px 0 0 20px", width: "140px" }}>
            {t("From Date")} :{" "}
          </label>
          {props.history.location != null && props.history.location.search != null && props.history.location.search.length > 0 ?
            <AmDatePicker
              FieldID={"dateFrom"}
              width="200px"
              TypeDate={"datetime-local"}
              onChange={value =>
                onChangeFilterDateTime(value, rowC.field, "dateFrom")
              }
            /> :
            <AmDatePicker
              FieldID={"dateFrom"}
              width="200px"
              TypeDate={"datetime-local"}
              onChange={value =>
                onChangeFilterDateTime(value, rowC.field, "dateFrom")
              }
              defaultValue={true}
              defaultValueDateTime={moment().format("YYYY-MM-DDT00:00")}
            />
          }
        </div>
      );
    }
  }, {
    field: "dateTo",
    component: (condition, rowC, idx) => {
      return (
        <div key={idx} style={{ display: "inline-flex" }}>
          <label style={{ padding: "10px 0 0 20px", width: "140px" }}>
            {t("To Date")} :{" "}
          </label>
          {props.history.location != null && props.history.location.search != null && props.history.location.search.length > 0 ?
            <AmDatePicker
              FieldID={"dateTo"}
              width="200px"
              TypeDate={"datetime-local"}
              onChange={value =>
                onChangeFilterDateTime(value, rowC.field, "dateTo")
              }
            /> :
            <AmDatePicker
              FieldID={"dateTo"}
              width="200px"
              TypeDate={"datetime-local"}
              onChange={value =>
                onChangeFilterDateTime(value, rowC.field, "dateTo")
              }
              defaultValue={true}
              defaultValueDateTime={moment().add(1, 'days').format("YYYY-MM-DDT00:00")}
            />
          }
        </div>
      );
    }
  }];


  const getIOText = (data) => {
    if (data.InputText || data.OutputText) {

      var datashow = <div>
        <Typography variant="h6">{"Input"}</Typography>
        {data.InputText ? <ReactJson src={JSON.parse(data.InputText)} /> : <label>Data Not Found.</label>}
        <br />
        <Divider />
        <br />
        <Typography variant="h6">{"Output"}</Typography>
        {data.OutputText ? <ReactJson src={JSON.parse(data.OutputText)} /> : <label>Data Not Found.</label>}
      </div>
      return (
        <div style={{ display: "flex", maxWidth: '160px' }}>
          <AmRediRectInfo type={"customdialog"} customIcon={<ViewList style={{ color: "#1a237e" }} />} bodyDialog={datashow} titleDialog="Input / Output" />
        </div>
      )
    } else {
      return null;
    }
  }
  const getResultMessage = (data) => {
    if (data.ResultMessage) {
      if (data.ResultMessage.length > 50) {
        return (
          <div style={{ display: "flex", maxWidth: '160px' }}><label className={classes.textNowrap}>{data.ResultMessage}</label>
            <AmRediRectInfo type={"customdialog"} customIcon={<PageView fontSize="small" style={{ color: "#1a237e" }} />} bodyDialog={data.ResultMessage} titleDialog="Result Message" />
          </div>
        )
      } else {
        return <label>{data.ResultMessage}</label>
      }
    } else {
      return null;
    }
  }
  const columns = [
    {
      Header: "ID",
      accessor: "ID",
      width: 60
    },
    {
      Header: "LogRef",
      accessor: "LogRefID",
      width: 150,
    },
    {
      Header: "APIService",
      accessor: "APIService_Name",
    },
    {
      Header: "I/O Text",
      Cell: (dataRow) => getIOText(dataRow.original),
      width: 60
    },
    {
      Header: "Result",
      accessor: "ResultMessage",
      Cell: (dataRow) => getResultMessage(dataRow.original),
    },
    {
      Header: "Start Time",
      accessor: "StartTime",
      width: 200,
      type: "datetime"
    },
    {
      Header: "End Time",
      accessor: "EndTime",
      width: 200,
      type: "datetime"
    }
  ]

  useEffect(() => {
    onHandleFilterConfirm();
  }, [datetime])

  return <>
    <AmFilterTable
      primarySearch={filterItem}
      onAccept={onHandleFilterConfirm}
    />
    <AmTable data={dataSource} columns={columns} sortable={false} pageSize={100} />
  </>
}

export default withStyles(styles)(APIServiceLog);
