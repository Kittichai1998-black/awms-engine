import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import AmDialogs from '../../../components/AmDialogs';
import { AmTable, AmFilterTable, AmPagination } from '../../../components/table';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import AmButton from "../../../components/AmButton";
import moment from "moment";

const Axios = new apicall();

const DocumentItemLog = (props) => {
  const { t } = useTranslation();

  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [datetime, setDatetime] = useState({});
  const [selection, setSelection] = useState();

  const [query, setQuery] = useState({
    queryString: window.apipath + "/v2/SelectDataLogAPI",
    t: "DocumentItemEvent",
    q: '[{"f":"LogTime","v":' + moment().format("YYYY-MM-DDT00:00") + ',"c":">="},{"f":"LogTime","v":' + moment().add(1, 'days').format("YYYY-MM-DDT00:00") + ',"c":"<="}]',
    f: "*",
    g: "",
    s: "[{'f':'LogTime','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  });

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
    // console.log(value)
    // console.log(field + " : " + type)
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
    getQuery.q = JSON.stringify(filterDatas);
    setQuery(getQuery)
  };

  const filterItem = [{
    field: "dateFrom",
    component: (condition, rowC, idx) => {
      return (
        <div key={idx} style={{ display: "inline-flex" }}>
          <label style={{ padding: "10px 0 0 20px", width: "140px" }}>
            {t("From Date")} :{" "}
          </label>
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
      Header: "LogRef",
      accessor: "LogRefID",
      width: 150,
    },
    {
      Header: "RefDocumentItem ID",
      accessor: "RefDocumentItem_ID",
      width: 150,
    },
    {
      Header: "Document Code",
      accessor: "Code",
    },
    {
      Header: "SKU Code",
      accessor: "SKUMaster_Code",
    },
    {
      Header: "Pack Code",
      accessor: "PackMaster_Code",
    },
    {
      Header: "Code",
      accessor: "Code",
    },
    {
      Header: "Quantity",
      accessor: "Quantity",
    },
    {
      Header: "UnitType",
      accessor: "UnitType_Code",
    },
    {
      Header: "Base Quantity",
      accessor: "BaseQuantity",
    },
    {
      Header: "Base UnitType",
      accessor: "BaseUnitType_Code",
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
      Header: "Options",
      accessor: "Options",
    },
    {
      Header: "ProductionDate",
      accessor: "ProductionDate",
      type: "datetime"
    },
    {
      Header: "ExpireDate",
      accessor: "ExpireDate",
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
      Header: "Item No",
      accessor: "ItemNo",
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
    Axios.get(createQueryString(query)).then(res => {
      setDataSource(res.data.datas)
    });
  }, [query]);

  return <>
    <AmFilterTable
      primarySearch={filterItem}
      onAccept={onHandleFilterConfirm}
    />
    <AmTable data={dataSource} columns={columns} sortable={false} pageSize={100} />
  </>
}

export default DocumentItemLog;
