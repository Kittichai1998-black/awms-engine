import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { withStyles } from '@material-ui/core/styles';
import AmDialogs from '../../../components/AmDialogs';
import { AmTable, AmFilterTable, AmPagination } from '../../../components/table';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import AmButton from "../../../components/AmButton";
import moment from "moment";
import queryString from "query-string";
import PageView from '@material-ui/icons/Pageview';
import AmRediRectInfo from '../../../components/AmRedirectInfo'

const Axios = new apicall();
const styles = theme => ({
  textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});
const WorkQueueLog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});
  const [selection, setSelection] = useState();

  const query = {
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "WorkQueueEvent",
    q: '',
    f: "*," +
      "iif(Document_ID is null, '',concat(Document_ID,':',Document_Code)) as Document," +
      "iif(StorageObject_ID is null, '',concat(StorageObject_ID,':',StorageObject_Code)) as StorageObject," +
      "iif(Sou_Warehouse_ID is null, '',concat(Sou_Warehouse_ID,':',Sou_Warehouse_Code)) as Sou_Warehouse," +
      "iif(Sou_Area_ID is null, '',concat(Sou_Area_ID,':',Sou_Area_Code)) as Sou_Area," +
      "iif(Sou_AreaLocation_ID is null, '',concat(Sou_AreaLocation_ID,':',Sou_AreaLocation_Code)) as Sou_AreaLocation," +
      "iif(Des_Warehouse_ID is null, '',concat(Des_Warehouse_ID,':',Des_Warehouse_Code)) as Des_Warehouse," +
      "iif(Des_Area_ID is null, '',concat(Des_Area_ID,':',Des_Area_Code)) as Des_Area," +
      "iif(Des_AreaLocation_ID is null, '',concat(Des_AreaLocation_ID,':',Des_AreaLocation_Code)) as Des_AreaLocation," +
      "iif(Area_ID is null, '',concat(Area_ID,':',Area_Code)) as Area," +
      "iif(Warehouse_ID is null, '',concat(Warehouse_ID,':',Warehouse_Code)) as Warehouse," +
      "iif(AreaLocation_ID is null, '',concat(AreaLocation_ID,':',AreaLocation_Code)) as AreaLocation"
    ,
    g: "",
    s: "[{'f':'LogTime','od':'desc'}]",
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
    //console.log(value + field + type)
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
        createObj.f = 'LogTime';
        createObj.v = datetime["dateFrom"];
        createObj.c = ">=";
        filterDatas.push(createObj);
      }
      if (datetime["dateTo"]) {
        let createObj = {};
        createObj.f = 'LogTime';
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
    Axios.get(createQueryString(getQuery)).then(res => {
      if (res) {
        if (res.data._result.status !== 0) {
          setDataSource(res.data.datas)
        }
      }
    });
  };

  const filterItem = [{
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

  const columns = [
    {
      Header: "Log Time",
      accessor: "LogTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "ID",
      accessor: "ID",
      width: 60
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
      Header: "RefID",
      accessor: "RefID",
      width: 150,
    },
    {
      Header: "IOType",
      accessor: "IOType",
      width: 60,
      Cell: (data) => {
        if(data.original.IOType === 0){
          return 'IN'
        }else{
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
    //   accessor: "Document",
    // },
    {
      Header: "StorageObject",
      accessor: "StorageObject",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.StorageObject} api={'/log/storageobjectlog?id=' + data.original.StorageObject_ID} />
          </div>
        )
      }
    },
    {
      Header: "Sou_Warehouse",
      accessor: "Sou_Warehouse",
    },
    {
      Header: "Sou_Area",
      accessor: "Sou_Area",
    },
    {
      Header: "Sou_Location",
      accessor: "Sou_AreaLocation",
    },
    {
      Header: "Des_Warehouse",
      accessor: "Des_Warehouse",
    },
    {
      Header: "Des_Area",
      accessor: "Des_Area_Code",
    },
    {
      Header: "Des_Location",
      accessor: "Des_AreaLocation",
    },
    {
      Header: "Warehouse",
      accessor: "Warehouse",
    },
    {
      Header: "Area",
      accessor: "Area",
    },
    {
      Header: "Location",
      accessor: "AreaLocation",
    },
    {
      Header: "EventStatus",
      accessor: "EventStatus",
    },
    {
      Header: "Status",
      accessor: "Status",
    },
    {
      Header: "ActualTime",
      accessor: "ActualTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "StartTime",
      accessor: "StartTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "EndTime",
      accessor: "EndTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Create By",
      accessor: "CreateBy_Name",
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Modify By",
      accessor: "ModifyBy_Name",
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime"
    },
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

export default withStyles(styles)(WorkQueueLog);
