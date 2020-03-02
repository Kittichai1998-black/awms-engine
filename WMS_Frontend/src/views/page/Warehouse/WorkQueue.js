import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall, createQueryString } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
import { useTranslation } from 'react-i18next'
import AmEntityStatus from "../../../components/AmEntityStatus";
import queryString from "query-string";
import AmWorkQueueStatus from "../../../components/AmWorkQueueStatus";
import AmRedirectLogSto from "../../../components/AmRedirectLogSto";
import AmRediRectInfo from '../../../components/AmRedirectInfo'
import AmRedirectLogWQ from '../../../components/AmRedirectLogWQ'
import moment from 'moment';
import AmDatePicker from "../../../components/AmDate";

const Axios = new apicall();

const styles = theme => ({
  root: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

const FormInline = styled.div`

display: inline-flex;
flex-flow: row wrap;
align-items: center;
margin-right: 20px;

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


const WorkQueue = (props) => {
  const { t } = useTranslation()
  const { classes } = props;
  const pageSize = 100;

  const queryData = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "WorkQueue",
    q: '',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const [query, setQuery] = useState(queryData);

  const [datavalue, setDataValue] = useState([]);
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [sort, setSort] = useState(null);
  const [exportApi, setExportApi] = useState(null);
  const [filterData, setFilterData] = useState([]);
  const [datetime, setDatetime] = useState({});




  const onGetData = () => {
    // console.log("cl")
    let getQuery = { ...query }
    let filterDatas = [...filterData];
    if (datetime) {
      if (datetime["dateFrom"]) {
        let createObj = {};
        createObj.f = datetime.field;
        createObj.v = datetime["dateFrom"];
        createObj.c = ">=";
        filterDatas.push(createObj);
      }
      if (datetime["dateTo"]) {
        let createObj = {};
        createObj.f = datetime.field;
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

    Axios.get(createQueryString(getQuery)).then((rowselect1) => {
      if (rowselect1) {
        if (rowselect1.data._result.status !== 0) {
          setDataValue(rowselect1.data.datas)
          setTotalSize(rowselect1.data.counts)
        }
      }
    });
  }
  useEffect(() => {
    if (typeof (page) === "number") {
      let queryEdit = { ...query }
      queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
      setQuery(queryEdit)
    }
  }, [page])

  const onGetDataExcel = () => {
    let queryEdit = { ...query }
    queryEdit.sk = 0
    queryEdit.l = 0
    setExportApi(createQueryString(queryEdit))

  }

  useEffect(() => {
    if (sort) {
      let queryEdit = { ...query }
      queryEdit.s = "[{'f':'" + sort.field + "','od':'" + sort.order + "'}]";
      setQuery(queryEdit)
    }
  }, [sort]);

  const onChangeFilter = (condition, field, value, type, event) => {
    let obj
    if (filterData.length > 0)
      obj = [...filterData];
    else
      obj = [condition];

    let filterDataList = filterData.filter(x => x.f === field)
    if (filterDataList.length > 0) {
      obj.forEach((x, idx) => {
        if (x.f === field) {
          if (typeof value === "object" && value !== null) {
            if (value.length > 0) {
              x.v = value.join(",")
              x.c = "in"
            } else {
              obj.splice(idx, 1)
            }
          }
          else {
            if (value) {
              if (value.toString().includes("*")) {
                value = value.replace(/\*/g, "%");
              }
              x.v = value
              x.c = "like"
            } else {
              obj.splice(idx, 1)
            }
          }
        }
      })

    } else {

      let createObj = {};
      createObj.f = field
      createObj.v = encodeURIComponent(value)
      createObj.c = "like"
      obj.push(createObj)

    }
    // console.log(obj)
    setFilterData(obj)
    // if (event && event.key == 'Enter') {
    //   onGetData();
    // }
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
    // console.log(datetimeRange)
    setDatetime(datetimeRange)

  };

  const primarySearch = [
    {
      field: "ID",
      component: (condition, rowC, idx) => {
        return (
          <div key={idx} style={{ display: "inline-block" }}>
            <label style={{ width: "100px", paddingLeft: "20px" }}>{t("WQ ID")} : </label>
            <AmInput
              id={rowC.field}
              placeholder={"Work Queue ID"}
              style={{ width: "200px" }}
              type="input"
              onChangeV2={(value) => { onChangeFilter(condition, rowC.field, value) }}
              // onKeyPress={(value, obj, element, event) => {
              //   if (event && event.key == 'Enter') {
              //     onChangeFilter(condition, rowC.field, value, event)
              //   }
              // }}
            />
          </div>
        );
      }
    },
    {
      field: "StorageObject_Code",
      component: (condition, rowC, idx) => {
        return (
          <div key={idx} style={{ display: "inline-block" }}>
            <label style={{ width: "100px", paddingLeft: "20px" }}>{t("Pallet")} : </label>
            <AmInput
              id={rowC.field}
              placeholder={"Pallet"}
              style={{ width: "200px" }}
              type="input"
              onChangeV2={(value) => { onChangeFilter(condition, rowC.field, value) }}
              // onKeyPress={(value, obj, element, event) => {
              //   if (event && event.key == 'Enter') {
              //     onChangeFilter(condition, rowC.field, value, event)
              //   }
              // }}
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
            <label style={{ width: "100px", paddingLeft: "20px" }}>
              {t("From Date")} :{" "}
            </label>
            {props.history.location != null && props.history.location.search != null && props.history.location.search.length > 0 ?
              <AmDatePicker
                FieldID={"dateFrom"}
                width="200px"
                TypeDate={"datetime-local"}
                onChange={value =>
                  onChangeFilterDateTime(value, "CreateTime", "dateFrom")
                }
              />
              :
              <AmDatePicker
                FieldID={"dateFrom"}
                width="200px"
                TypeDate={"datetime-local"}
                onChange={value =>
                  onChangeFilterDateTime(value, "CreateTime", "dateFrom")
                }
                defaultValue={true}
                defaultValueDateTime={moment().format("YYYY-MM-DDTHH:mm")}
              />
            }
          </div>
        );
      }
    },
    {
      field: "dateTo",
      component: (condition, rowC, idx) => {
        return (
          <div key={idx} style={{ display: "inline-flex" }}>
            <label style={{ width: "100px", paddingLeft: "20px" }}>
              {t("To Date")} :{" "}
            </label>
            {props.history.location != null && props.history.location.search != null && props.history.location.search.length > 0 ?
              <AmDatePicker
                FieldID={"dateTo"}
                width="200px"
                TypeDate={"datetime-local"}
                onChange={value =>
                  onChangeFilterDateTime(value, "CreateTime", "dateTo")
                }
              />
              :
              <AmDatePicker
                FieldID={"dateTo"}
                width="200px"
                TypeDate={"datetime-local"}
                onChange={value =>
                  onChangeFilterDateTime(value, "CreateTime", "dateTo")
                }
                defaultValue={true}
                defaultValueDateTime={moment().format("YYYY-MM-DDTHH:mm")}
              />
            }
          </div>
        );
      }
    }
  ];
  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px",
          direction: "rtl"
        }}
      >
        <AmRedirectLogSto
          api={
            "/log/storageobjectlog?id=" +
            data.StorageObject_ID +
            "&ParentStorageObject_ID=" +
            data.StorageObject_ID
          }
        />
        <AmRedirectLogWQ api={"/log/workqueuelog?id=" + data.ID} />
      </div>
    );
  };

  const columns = [
    {
      Header: "Status",
      accessor: "EventStatus",
      Cell: (data) => {
        return <div style={{ textAlign: "center" }}><AmWorkQueueStatus statusCode={data.original.EventStatus} /></div>
      },
      width: 70
    },
    { Header: "ID", accessor: "ID", width: 70 },
    { Header: "IOType", accessor: "IOType", width: 70 },
    { Header: "RefID", accessor: "RefID", width: 130 },
    { Header: "Pallet No.", accessor: "StorageObject_Code", width: 100 },
    { Header: "Sou.Warehouse", accessor: "Sou_Warehouse_Name", width: 100 },
    { Header: "Sou.Area", accessor: "Sou_Area", width: 100 },
    { Header: "Des.Warehouse", accessor: "Des_Warehouse_Name", width: 100 },
    { Header: "Des.Area", accessor: "Des_Area", width: 100 },
    { Header: "Cur.Warehouse", accessor: "Warehouse_Name", width: 100 },
    { Header: "Cur.Area", accessor: "Area", width: 100 },

    {
      Header: "Create By",
      accessor: "UserName",
      sortable: false,
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Log",
      width: 60,
      sortable: false,
      Cell: e => getRedirectLog(e.original)
    }
  ]
  useEffect(() => {
    onGetData();
    // onGetDataExcel();
  }, [query, datetime])

  return (
    <div>
      <AmReport
        // bodyHeadReport={GetBodyReports()}
        filterTable={true}
        primarySearch={primarySearch}
        onHandleFilterConfirm={onGetData}
        sortable={true}
        sort={(sort) => setSort(sort)}
        columnTable={columns}
        dataTable={datavalue}
        pageSize={pageSize}
        pages={(x) => setPage(x)}
        totalSize={totalSize}
        page={true}
        exportData={false}
      // exportApi={exportApi}
      // excelFooter={false}
      // fileNameTable={"WorkQueue"}
      ></AmReport>
    </div>
  )

}

export default withStyles(styles)(WorkQueue);
