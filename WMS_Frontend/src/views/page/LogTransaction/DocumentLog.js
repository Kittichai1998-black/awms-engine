import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import AmDialogs from '../../../components/AmDialogs';
import { AmTable, AmFilterTable, AmPagination } from '../../../components/table';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import AmButton from "../../../components/AmButton";
import moment from "moment";
import queryString from "query-string";

const Axios = new apicall();

const DocumentLog = (props) => {
  const { t } = useTranslation();

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});

  const query = {
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "DocumentEvent",
    q: '',
    f: "*",
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

  const columns = [
    {
      Header: "Log Time",
      accessor: "LogTime",
      width: 200,
      type: "datetime"
    },
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
      Header: "Document Code",
      accessor: "Code",
    },
    {
      Header: "ParentDocument ID",
      accessor: "ParentDocument_ID",
    },
    {
      Header: "DocumentType",
      accessor: "DocumentType_ID",
    },
    {
      Header: "Sou_Customer",
      accessor: "Sou_Customer_Code",
    },
    {
      Header: "Sou_Supplier",
      accessor: "Sou_Supplier_Code",
    },
    {
      Header: "Sou_Branch",
      accessor: "Sou_Branch_Code",
    },
    {
      Header: "Sou_Warehouse",
      accessor: "Sou_Warehouse_Code",
    },
    {
      Header: "Sou_Area",
      accessor: "Sou_AreaMaster_Code",
    },
    {
      Header: "Des_Customer",
      accessor: "Des_Customer_Code",
    },
    {
      Header: "Des_Supplier",
      accessor: "Des_Supplier_Code",
    },
    {
      Header: "Des_Branch",
      accessor: "Des_Branch_Code",
    },
    {
      Header: "Des_Warehouse",
      accessor: "Des_Warehouse_Code",
    },
    {
      Header: "Des_Area",
      accessor: "Des_AreaMaster_Code",
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
    },
    {
      Header: "Remark",
      accessor: "Remark"
    },
    {
      Header: "ActionTime",
      accessor: "ActionTime",
      type: "datetime"
    },
    {
      Header: "DocumentDate",
      accessor: "DocumentDate",
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
      type: "datetime"
    },
    {
      Header: "Modify By",
      accessor: "ModifyBy_Name",
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
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

export default DocumentLog;
