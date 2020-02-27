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
const DocumentLog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});

  const query = {
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "DocumentEvent",
    q: '',
    f: "*," +
      "iif(ParentDocument_ID is null, '',concat(ParentDocument_ID,':',ParentDocument_Code)) as ParentDocument," +
      "iif(DocumentType_ID is null, '',concat(DocumentType_ID,':',DocumentType_Code)) as DocumentType," +
      "iif(Sou_Customer_ID is null, '',concat(Sou_Customer_ID,':',Sou_Customer_Code)) as Sou_Customer," +
      "iif(Sou_Supplier_ID is null, '',concat(Sou_Supplier_ID,':',Sou_Supplier_Code)) as Sou_Supplier," +
      "iif(Sou_Branch_ID is null, '',concat(Sou_Branch_ID,':',Sou_Branch_Code)) as Sou_Branch," +
      "iif(Sou_Warehouse_ID is null, '',concat(Sou_Warehouse_ID,':',Sou_Warehouse_Code)) as Sou_Warehouse," +
      "iif(Sou_AreaMaster_ID is null, '',concat(Sou_AreaMaster_ID,':',Sou_AreaMaster_Code)) as Sou_AreaMaster," +
      "iif(Des_Customer_ID is null, '',concat(Des_Customer_ID,':',Des_Customer_Code)) as Des_Customer," +
      "iif(Des_Supplier_ID is null, '',concat(Des_Supplier_ID,':',Des_Supplier_Code)) as Des_Supplier," +
      "iif(Des_Branch_ID is null, '',concat(Des_Branch_ID,':',Des_Branch_Code)) as Des_Branch," +
      "iif(Des_Warehouse_ID is null, '',concat(Des_Warehouse_ID,':',Des_Warehouse_Code)) as Des_Warehouse," +
      "iif(Des_AreaMaster_ID is null, '',concat(Des_AreaMaster_ID,':',Des_AreaMaster_Code)) as Des_AreaMaster",
    g: "",
    s: "[{'f':'LogTime','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
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
    // setQuery(getQuery)
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
            />}
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
      Header: "Document",
      accessor: "Code",
      width: 150,
    },
    {
      Header: "Parent Doc.",
      accessor: "ParentDocument",
      width: 150,
    },
    {
      Header: "Doc.Type",
      accessor: "DocumentType",
      width: 150,
    },
    {
      Header: "Sou_Customer",
      accessor: "Sou_Customer",
    },
    {
      Header: "Sou_Supplier",
      accessor: "Sou_Supplier",
    },
    {
      Header: "Sou_Branch",
      accessor: "Sou_Branch",
    },
    {
      Header: "Sou_Warehouse",
      accessor: "Sou_Warehouse",
    },
    {
      Header: "Sou_Area",
      accessor: "Sou_AreaMaster",
    },
    {
      Header: "Des_Customer",
      accessor: "Des_Customer",
    },
    {
      Header: "Des_Supplier",
      accessor: "Des_Supplier",
    },
    {
      Header: "Des_Branch",
      accessor: "Des_Branch",
    },
    {
      Header: "Des_Warehouse",
      accessor: "Des_Warehouse",
    },
    {
      Header: "Des_Area",
      accessor: "Des_AreaMaster",
    },
    {
      Header: "For_Customer_ID",
      accessor: "For_Customer_ID",
    },
    {
      Header: "Transport_ID",
      accessor: "Transport_ID",
    },
    {
      Header: "Document Process Type",
      accessor: "DocumentProcessType_Code",
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
      Header: "Options",
      accessor: "Options",
      Cell: (dataRow) => getMessage(dataRow.original, "Options"),
      width: 150,
    },
    {
      Header: "Remark",
      accessor: "Remark"
    },
    {
      Header: "ActionTime",
      accessor: "ActionTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "DocumentDate",
      accessor: "DocumentDate",
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
      Header: "EventStatus",
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

export default withStyles(styles)(DocumentLog);
