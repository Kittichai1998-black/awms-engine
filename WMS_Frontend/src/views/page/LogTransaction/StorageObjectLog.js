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
const StorageObjectLog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});
  const [selection, setSelection] = useState();

  const query = {
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "StorageObjectEvent",
    q: '',
    f: "*," +
      "iif(AreaMaster_ID is null, '',concat(AreaMaster_ID,':',AreaMaster_Code)) as AreaMaster," +
      "iif(AreaLocationMaster_ID is null, '',concat(AreaLocationMaster_ID,':',AreaLocationMaster_Code)) as AreaLocationMaster," +
      "iif(ParentStorageObject_ID is null, '',concat(ParentStorageObject_ID,':',ParentStorageObject_Code)) as ParentStorageObject," +
      "iif(PackMaster_ID is null, '',concat(PackMaster_ID,':',PackMaster_Code)) as PackMaster," +
      "iif(BaseMaster_ID is null, '',concat(BaseMaster_ID,':',BaseMaster_Code)) as BaseMaster," +
      "concat(UnitType_ID, ':' ,UnitType_Code) as UnitType," +
      "concat(BaseUnitType_ID, ':' ,BaseUnitType_Code) as BaseUnitType"
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
    },
    {
      Header: "Code",
      accessor: "Code",
      width: 150,
    },
    {
      Header: "Name",
      accessor: "Name",
      width: 200,
    },
    {
      Header: "Area",
      accessor: "AreaMaster",
    },
    {
      Header: "Location",
      accessor: "AreaLocationMaster",
    },
    {
      Header: "Parent Sto",
      accessor: "ParentStorageObject",
      width: 150,
    },
    {
      Header: "Base",
      accessor: "BaseMaster",
      width: 150,
    },
    {
      Header: "Pack",
      accessor: "PackMaster",
      width: 150,
    },
    {
      Header: "For Customer",
      accessor: "For_Customer_ID",
    },
    {
      Header: "Object Type",
      accessor: "ObjectType",
    },
    {
      Header: "WeigthKG",
      accessor: "WeigthKG",
    },
    {
      Header: "Qty",
      accessor: "Quantity",
    },
    {
      Header: "Unit",
      accessor: "UnitType",
    },
    {
      Header: "Base Qty",
      accessor: "BaseQuantity",
    },
    {
      Header: "Base Unit",
      accessor: "BaseUnitType",
    },
    {
      Header: "Order No.",
      accessor: "OrderNo",
    },
    {
      Header: "Batch",
      accessor: "Batch",
    },
    {
      Header: "Lot",
      accessor: "Lot",
    },
    {
      Header: "Expiry Date",
      accessor: "ExpiryDate",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Product Date",
      accessor: "ProductDate",
      width: 150,
      type: "datetime"
    },
    {
      Header: "RefID",
      accessor: "RefID",
    },

    {
      Header: "Ref1",
      accessor: "Ref1",
    },
    {
      Header: "Ref2",
      accessor: "Ref2",
    },
    {
      Header: "Options",
      accessor: "Options",
      Cell: (dataRow) => getMessage(dataRow.original, "Options"),
      width: 150,
    },
    {
      Header: "Event Status",
      accessor: "EventStatus",
    },
    {
      Header: "Status",
      accessor: "Status",
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

export default withStyles(styles)(StorageObjectLog);
