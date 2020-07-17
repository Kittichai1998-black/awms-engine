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
import SvgIcon from '@material-ui/core/SvgIcon';
import AmInput from "../../../components/AmInput";

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
    s: "[{'f':'StartTime','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const queryAPIServiceAPI = {
    queryString: window.apipath + "/v2/SelectDataMstAPI",
    t: "APIService",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const onChangeFilter = (condition, field, value) => {
    let obj = [...filterData];
    if (value === "") {
      obj = obj.filter(x => x.f !== field);
    } else {
      let row = obj.find(x => x.f === field);
      console.log(row)
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
  const onChange = (condition, field, value) => {
    let obj = [...filterData];
    if (value === "") {
      obj = obj.filter(x => x.f !== field);
    } else {
      let row = obj.find(x => x.f === field);
      console.log(row)
      if (row === null || row === undefined) {
        obj.push(
          {
            f: field, c: "like", v: value
          }
        )
      }
      else {
        row.c = "like"
        row.v = value;
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
            ddlMinWidth="200px"
            zIndex={1000}
            placeholder={"Select Service"}
            fieldDataKey="ID"
            fieldLabel={["Name"]}
            queryApi={queryAPIServiceAPI}
            ddlType={"search"}
            onChange={value => {
              onChangeFilter(condition, rowC.field, value)
              // setSelection(value)
            }
            }
          />
        </div>
      );
    }
  },
  {
    field: "InputText",
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
            {t("Input")} :{" "}
          </label>
          <AmInput
            width="200px"
            id={"InputText"}
            // placeholder={placeholder}
            type="input"
            onChange={value => {
              onChange(condition, rowC.field, value)
            }}
          />
        </div>
      );
    }
  },
  {
    field: "OutputText",
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
            {t("Output")} :{" "}
          </label>
          <AmInput
            width="200px"
            id={"OutputText"}
            // placeholder={placeholder}
            type="input"
            onChange={value => {
              onChange(condition, rowC.field, value)
            }}
          />
        </div>
      );
    }
  },
  {
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
              defaultValue={moment().format("YYYY-MM-DDT00:00")}
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
              defaultValue={moment().add(1, 'days').format("YYYY-MM-DDT00:00")}
            />
          }
        </div>
      );
    }
  }];
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
  const showReactJsonView = (name, data) => {
    return <ReactJson name={name} src={data}
      displayObjectSize={true} enableClipboard={handleCopy} displayDataTypes={false} indentWidth={2} />
  }
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
        {data.InputText ? showReactJsonView("Output-Text", JSON.parse(data.OutputText))
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
  const getResultMessage = (data) => {
    if (data.ResultMessage) {
      if (data.ResultMessage.length > 50) {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}><label className={classes.textNowrap}>{data.ResultMessage}</label>
            <AmRediRectInfo type={"customdialog"} customIcon={<PageView style={{ color: "#1a237e" }} />} bodyDialog={data.ResultMessage} titleDialog="Result Message"  />
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
      Header: "LogRefID",
      accessor: "LogRefID",
      width: 150,
    },
    {
      Header: "APIService",
      accessor: "APIService_Name",
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
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss"
    },
    {
      Header: "End Time",
      accessor: "EndTime",
      width: 200,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss"
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
