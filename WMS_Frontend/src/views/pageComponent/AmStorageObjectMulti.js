import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import AmButton from "../../components/AmButton";
import AmDatePicker from "../../components/AmDate";
import AmDialogs from "../../components/AmDialogs";
import AmDropdown from "../../components/AmDropdown";
import AmEditorTable from "../../components/table/AmEditorTable";
import AmExportDataTable from "../../components/table/AmExportDataTable";
import AmExportExcel from "../../components/AmExportExcel";
import AmFilterTable from "../../components/table/AmFilterTable";
import AmFindPopup from "../../components/AmFindPopup";
import AmInput from "../../components/AmInput";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
import Clone from "../../components/function/Clone";
import Pagination from "../../components/table/AmPagination";
import Table from "../../components/table/AmTable";
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
const Axios = new apicall();

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div``;
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
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

const AmStorageObjectMulti = props => {
  const { t } = useTranslation();
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', 'c':'!=', 'v': 0}]",
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const ExportQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', 'c':'!=', 'v': 0}]",
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: 0,
    all: ""
  };
  //===========================================================

  //=============================================================
  const [dataSource, setDataSource] = useState([]);
  const [dataSource1, setDataSource1] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [columns, setColumns] = useState(props.iniCols);
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState();
  const [selection, setSelection] = useState();
  const [query, setQuery] = useState(Query);
  const [editRow, setEditRow] = useState([]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [datetime, setDatetime] = useState({});
  const [filterData, setFilterData] = useState([]);
  const [table, setTable] = useState();
  const [text, setText] = useState([]);
  const [valueText2, setValueText2] = useState({});
  const [addData, setAddData] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [data2, setData2] = useState({});
  const [dataSentToAPI, setDataSentToAPI] = useState([]);
  const [remark, setRemark] = useState("");
  const [typeButton, setTypeButton] = useState(0);
  const [name, setName] = useState("");
  const [excelDataSrouce, setExcelDataSource] = useState([]);
  const [resetPage, setResetPage] = useState([]);
  //===========================================================

  useEffect(() => {
    setTable(
      <Table
        primaryKey="ID"
        data={
          props.dataSourceModefybuttonB4
            ? props.dataSourceModefybuttonB4
            : dataSource
        }
        columns={columns}
        pageSize={100}
        sort={sort => setSort({ field: sort.id, order: sort.sortDirection })}
        style={{ maxHeight: "550px" }}
        editFlag="editFlag"
        currentPage={page}
        selection={props.selection}
        selectionType="checkbox"
        getSelection={data => {
          setSelection(data);
        }}
        renderCustomButtonB4={
          props.modifyRemark === true && props.selection === true ? (
            <AmButton
              style={{ marginRight: "5px" }}
              styleType="add"
              onClick={() => {
                FuncRanderRemark();
                setAddData(true);
                setDialog(true);
              }}
            >
              Remark
            </AmButton>
          ) : props.randerModefybuttonB4 ? (
            props.randerModefybuttonB4
          ) : (
                ""
              )
        }
      />
    );
  }, [dataSource]);

  useEffect(() => {
    getData(createQueryString(query));
  }, [query]);

  useEffect(() => {
    if (typeof page === "number") {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
      setQuery(queryEdit);
    }
  }, [page]);

  useEffect(() => {
    if (sort) {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      setQuery(queryEdit);
    }
  }, [sort]);
  //===========================================================
  const FuncRanderRemark = () => {
    if (props.dataRemark) {
      const x = props.dataRemark;
      return x.map(y => {
        return {
          field: y.field,
          component: (data = null, cols, key) => {
            return (
              <div key={key}>
                {FuncTestSetEle(
                  y.name,
                  y.type,
                  data,
                  cols,
                  y.dataDropDow,
                  y.typeDropdow,
                  y.colsFindPopup,
                  y.placeholder,
                  y.labelTitle,
                  y.fieldLabel,
                  y.validate,
                  y.required
                )}
              </div>
            );
          }
        };
      });
    }
  };
  //===========================================================
  const FuncTestSetEle = (
    name,
    type,
    data,
    cols,
    dataDropDow,
    typeDropdow,
    colsFindPopup,
    placeholder,
    labelTitle,
    fieldLabel,
    validate,
    required
  ) => {
    return (
      <FormInline>
        {" "}
        <LabelH>{name} : </LabelH>
        <InputDiv>
          <AmInput
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            //value={data ? data[cols.field]:""}
            onChange={val => {
              onChangeEditor(cols.field, data, val);
            }}
          />
        </InputDiv>
      </FormInline>
    );
  };
  //===========================================================
  const onChangeEditor = (field, rowdata, value, type, inputType) => {
    if (selection.length === 0) {
      setOpenWarning(true);
    } else {
      let cloneData = selection;
      setRemark(value);
      setDataSentToAPI(cloneData);
    }
  };
  //===========================================================
  async function getData(qryString) {
    setTable([]);

    const res = await Axios.get(qryString).then(res => res);

    //var groupPallet = _.groupBy(res.data.datas, "Pallet");

    // res.data.datas.forEach(x => {
    //   x.Remark = decodeURIComponent(x.Remark);
    // });

    //var dataGroup = [];
    //console.log(props.multi);
    if (props.multi === true) {
      res.data.datas.forEach(x => {
        x.SKU_Code = x.SKU_Code.split("\\n").map(y => (
          <div style={{ marginBottom: "3px" }}>{y}</div>
        ));
        x.SKU_Name = x.SKU_Name.split("\\n").map(y => (
          <div style={{ marginBottom: "3px" }}>{y}</div>
        ));
        x.Qty = x.Qty.toString()
          .split("\\n")
          .map(y => <div style={{ marginBottom: "3px" }} >{y.split(".000")}</div>);
        x.Base_Unit = x.Base_Unit.split("\\n").map(y => (
          <div style={{ marginBottom: "3px" }}>{y}</div>
        ));
        x.Lot = x.Lot.split("\\n").map(y => (
          <div style={{ marginBottom: "3px" }}>{y}</div>
        ));

        x.Status = x.Status.split("\\n").map(y => (
          <div style={{ marginBottom: "3px", textAlign: "center" }}>
            {getStatus(y)}
          </div>
        ));
      });
    }
    console.log(res.data.datas)
    setDataSource(res.data.datas);
    //setDataSource(dataGroup)
    setTotalSize(res.data.counts);

    if (props.export === true) {
      let getExcelQuery = Clone(ExportQuery);
      getExcelQuery.q = query.q;
      getExcelQuery.s = query.s;
      //const resExcel = await Axios.get(createQueryString(getExcelQuery)).then(res => res)
      const resExcel = createQueryString(getExcelQuery);
      setExcelDataSource(resExcel);
    }
  }
  //===========================================================
  const getStatus = Status => {
    if (Status === "NEW") {
      return <AmStorageObjectStatus key={Status} statusCode={10} />;
    } else if (Status === "RECEIVING") {
      return <AmStorageObjectStatus key={Status} statusCode={11} />;
    } else if (Status === "RECEIVED") {
      return <AmStorageObjectStatus key={Status} statusCode={12} />;
    } else if (Status === "AUDITING") {
      return <AmStorageObjectStatus key={Status} statusCode={13} />;
    } else if (Status === "AUDITED") {
      return <AmStorageObjectStatus key={Status} statusCode={14} />;
    } else if (Status === "PICKING") {
      return <AmStorageObjectStatus key={Status} statusCode={17} />;
    } else if (Status === "PICKED") {
      return <AmStorageObjectStatus key={Status} statusCode={18} />;
    } else if (Status === "HOLD") {
      return <AmStorageObjectStatus key={Status} statusCode={99} />;
    } else if (Status === "QUALITY_CONTROL") {
      return <AmStorageObjectStatus key={Status} statusCode={98} />;
    } else if (Status === "REMOVING") {
      return <AmStorageObjectStatus key={Status} statusCode={21} />;
    } else if (Status === "REMOVED") {
      return <AmStorageObjectStatus key={Status} statusCode={22} />;
    } else {
      return null;
    }
  };
  useEffect(() => {
    setColumns(Clone(columns));
  }, [dataSource, editRow]);

  const onHandleDDLChangeFilter = (
    value,
    dataObject,
    inputID,
    fieldDataKey,
    condition,
    colsField
  ) => {
    setValueText2({
      ...valueText2,
      [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey
      }
    });
    onChangeFilter(condition, colsField, value);
  };
  const onHandleChangeKeyEnter = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    console.log(event.key);
    if (event && event.key == "Enter") {
      console.log("dfdh");
      onHandleFilterConfirm(true);
    }
  };
  //===========================================================
  const createComponent = searchList => {
    return searchList.map((row, idx) => {
      if (row.searchType === "input") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmInput
                  id={rowC.field}
                  style={{ width: "200px", paddingTop: "5px" }}
                  placeholder={row.placeholder}
                  onChangeV2={value => {
                    onChangeFilter(condition, rowC.field, value);
                  }}
                  onKeyPress={(value, obj, element, event) =>
                    onHandleChangeKeyEnter(
                      value,
                      null,
                      "PalletCode",
                      null,
                      event
                    )
                  }
                />
              </div>
            );
          }
        };
      } else if (row.searchType === "dropdown") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmDropdown
                  id={row.field}
                  zIndex={1000}
                  placeholder={row.placeholder}
                  fieldDataKey={row.fieldDataKey}
                  fieldLabel={row.fieldLabel}
                  labelPattern=" : "
                  width={200}
                  ddlMinWidth={200}
                  valueData={valueText2[row.field]}
                  queryApi={row.dataDropDow}
                  onChange={(value, dataObject, inputID, fieldDataKey) =>
                    onHandleDDLChangeFilter(
                      value,
                      dataObject,
                      inputID,
                      fieldDataKey,
                      condition,
                      rowC.field
                    )
                  }
                  ddlType={row.typeDropdow}
                />
              </div>
            );
          }
        };
      } else if (row.searchType === "findPopup") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmFindPopup
                  id={row.field}
                  placeholder={row.placeholder}
                  fieldDataKey={row.fieldDataKey}
                  fieldLabel={row.fieldLabel}
                  labelPattern=" : "
                  valueData={valueText2[row.field]}
                  labelTitle={row.labelTitle}
                  queryApi={row.dataDropDow}
                  columns={row.colsFindPopup}
                  width={200}
                  onChange={(value, dataObject, inputID, fieldDataKey) =>
                    onHandleDDLChangeFilter(
                      value,
                      dataObject,
                      inputID,
                      fieldDataKey,
                      condition,
                      rowC.field
                    )
                  }
                />
              </div>
            );
          }
        };
      } else if (row.searchType === "status") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmDropdown
                  id={row.field}
                  placeholder={row.placeholder}
                  fieldDataKey={"value"}
                  width={200}
                  ddlMinWidth={200}
                  zIndex={1000}
                  valueData={valueText2[row.field]}
                  data={row.dataDropDow}
                  onChange={(value, dataObject, inputID, fieldDataKey) =>
                    onHandleDDLChangeFilter(
                      value,
                      dataObject,
                      inputID,
                      fieldDataKey,
                      condition,
                      rowC.field
                    )
                  }
                  ddlType={row.typeDropdow}
                />
              </div>
            );
          }
        };
      } else if (row.searchType === "datepicker") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmDatePicker
                  id={row.field}
                  width="200px"
                  //style={{ width: "200px" }}
                  placeholder={row.placeholder}
                  TypeDate={row.typedate}
                  onChange={value =>
                    onChangeFilterDateTime(
                      value,
                      rowC.field,
                      row.dateSearchType
                    )
                  }
                />
              </div>
            );
          }
        };
      } else {
        return null;
      }
    });
  };
  //===========================================================
  const onHandleFilterConfirm = (status, obj) => {
    if (status) {
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
      setResetPage([]);
      query.q = JSON.stringify(filterDatas);
      getData(createQueryString(query));
    }

    // props.primarySearch.forEach(x=>{
    //   document.getElementById(x.field).value="";
    // })

    //setDatetime({})
    //setFilterData([{ 'f': 'Status', 'c':'!=', 'v': 0}])
  };
  //===========================================================
  const onChangeFilterDateTime = (value, field, type) => {
    let datetimeRange = datetime;
    if (value === null || value === undefined) {
      delete datetimeRange[type];
    } else {
      datetimeRange["field"] = field;
      if (type === "dateFrom") datetimeRange[type] = value.fieldDataKey;
      if (type === "dateTo")
        datetimeRange[type] = value.fieldDataKey
          ? value.fieldDataKey + "T23:59:59"
          : null;
    }
    setDatetime(datetimeRange);
  };
  //===========================================================
  const onHandleEditConfirm = (status, type) => {
    if (status) {
      UpdateData(type);
    }

    setAddData(false);
    setDialog(false);
    setSelection([]);
  };
  //===========================================================
  async function UpdateData(type) {
    var dataObj = [];

    for (var data in dataSentToAPI) {
      const Query3 = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI/",
        t: props.table,
        q:
          "[{ 'f': 'ParentStorageObject_ID', c:'==', 'v': " +
          dataSentToAPI[data].ID +
          "}]",
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
      };

      await Axios.get(createQueryString(Query3)).then(res => {
        var row = res.data.datas;

        row.forEach(row1 => {
          delete row1["ModifyBy"];
          delete row1["ModifyTime"];

          var qryStr = queryString.parse(row1.Options);

          qryStr.Remark = remark.replace("&", encodeURIComponent("&"));
          var qryStr1 = queryString.stringify(qryStr);
          var uri_dec = decodeURIComponent(qryStr1);
          row1.Options = uri_dec;
        });
        dataObj.push(row[0]);
      });
    }

    let updjson = {
      t: "amt_StorageObject",
      pk: "ID",
      datas: dataObj,
      nr: false,
      _token: localStorage.getItem("Token")
    };
    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson)
      .then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            //setOpenSuccess(true)
            getData(createQueryString(query));
            Clear();
          } else {
            //setOpenError(true)
            setTextError(res.data._result.message);
            getData(createQueryString(query));
            Clear();
          }
        }
      })
      .then(x => {
        if (type != 0) {
          if (type === 99) {
            holdData(99);
          } else if (type === 98) {
            holdData(98);
          } else if (type === 12) {
            holdData(12);
          } else if (type === 97) {
            holdData(97);
          } else if (type === 96) {
            holdData(96);
          }
        }
      });

    return dataObj;
  }
  //===========================================================
  const onChangeFilter = (condition, field, value) => {
    let obj;
    if (filterData.length > 0) {
      obj = [...filterData];
    } else obj = [];
    let filterDataList = filterData.filter(x => x.f === field);
    if (filterDataList.length > 0) {
      obj.forEach((x, idx) => {
        if (x.f === field) {
          if (typeof value === "object" && value !== null) {
            if (value.length > 0) {
              x.v = value.join(",");
              x.c = "in";
            } else {
              obj.splice(idx, 1);
            }
          } else {
            if (value) {
              if (field === "Month") {
                x.v = value;
                x.c = ">=";
              } else {
                x.v = value + "%";
                x.c = "like";
              }
            } else {
              obj.splice(idx, 1);
            }
          }
        }
      });
    } else {
      let createObj = {};
      if (typeof value === "object" && value !== null) {
        createObj.f = field;
        createObj.v = value.join(",");
        createObj.c = "in";
        obj.push(createObj);
      } else {
        if (value) {
          if (field === "Month") {
            createObj.f = field;
            createObj.v = value;
            createObj.c = ">=";
            obj.push(createObj);
          } else {
            createObj.f = field;
            createObj.v = value + "%";
            createObj.c = "like";
            obj.push(createObj);
          }
        } else {
          let idx = obj.findIndex(x => x.f === field);
          obj.splice(idx, 1);
        }
      }
    }

    setFilterData(obj);
  };
  //===========================================================
  const holdData = status => {
    let bstosID = [];

    if (selection.length > 0) {
      selection.forEach(rowdata => {
        bstosID.push(rowdata.ID);
      });
      let postdata = { bstosID: bstosID, eventStatus: status };

      Axios.post(window.apipath + "/v2/HoldStorageObjectAPI", postdata).then(
        res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setOpenSuccess(true);
              getData(createQueryString(query));
              Clear();
            } else {
              setOpenError(true);
              setTextError(res.data._result.message);
              getData(createQueryString(query));
              Clear();
            }
          }
        }
      );
    }
  };
  //===========================================================
  const onClickHold = type => {
    setTypeButton(type);
    setDialog(true);
  };
  //===========================================================
  const Clear = () => {
    setSelection([]);
    setRemark("");
  };
  //===========================================================

  const [isLoad, setIsLoad] = useState(false);
  const onHandleLoadFile = (val, obj, element, event) => {
    setIsLoad(true);
  };
  const exportColumns = () => {
    return columns.filter(x => {
      return x.accessor;
    });
  };
  //===========================================================
  const comma = value => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const SumTables = () => {
    return columns
      .filter(row => row.Footer === true)
      .map(row => {
        console.log(row);
        return {
          accessor: row.accessor,
          sumData: sumFooterTotal(dataSource, row.accessor)
        };
      });
  };
  const sumFooterTotal = (data, value) => {
    data.forEach(x => {
      x[value] = parseInt(x[value]);
    });
    var sumVal = _.sumBy(data, value);
    if (
      sumVal === 0 ||
      sumVal === null ||
      sumVal === undefined ||
      isNaN(sumVal)
    ) {
      return "-";
    } else {
      return comma(sumVal.toFixed(2));
    }
  };
  const CreateDataWithFooter = data => {
    if (data && data.length > 0) {
      var tempdata = Clone(data);
      var objfoot = {};
      columns
        .filter(row => row.Footer === true)
        .forEach(row => {
          objfoot[row.accessor] = sumFooterTotal(data, row.accessor);
          objfoot["norownum"] = true;
        });
      return tempdata.concat(objfoot);
    }
    return null;
  };
  //===========================================================
  return (
    <div>
      <AmDialogs
        typePopup={"warning"}
        onAccept={e => {
          setOpenWarning(e);
        }}
        open={openWarning}
        content={"Please Select Data"}
      ></AmDialogs>
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      ></AmDialogs>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status, typeButton)}
        titleText={name}
        data={text}
        columns={FuncRanderRemark()}
      />
      <AmFilterTable
        //defaultCondition={{}}
        primarySearch={createComponent(props.primarySearch)}
        extensionSearch={createComponent(props.expensionSearch)}
        onAccept={(status, obj) => onHandleFilterConfirm(true)}
      />
      <br />
      <br />

      <Table
        primaryKey="ID"
        data={
          props.dataSourceModefybuttonB4
            ? props.dataSourceModefybuttonB4
            : dataSource
        }
        //data={props.dataSourceModefybuttonB4}
        sumFooter={SumTables()}
        columns={columns}
        pageSize={100}
        sort={sort => setSort({ field: sort.id, order: sort.sortDirection })}
        style={{ maxHeight: "550px" }}
        currentPage={page}
        selection={props.selection}
        selectionType="checkbox"
        getSelection={data => {
          setSelection(data);
        }}
        exportData={props.export ? props.export : false}
        excelQueryAPI={excelDataSrouce}
        renderCustomButtonBTMLeft={
          props.modifyRemark === true && props.selection === true ? (
            <div style={{ paddingTop: "10px" }}>
              {props.modifyhold === true ? (
                <AmButton
                  style={{ marginRight: "5px" }}
                  styleType="confirm"
                  onClick={() => {
                    onClickHold(99);
                    setName("Remark HOLD");
                  }}
                >
                  HOLD
                </AmButton>
              ) : null}
              {props.modifyreceived === true ? (
                <AmButton
                  style={{ marginRight: "5px" }}
                  styleType="confirm"
                  onClick={() => {
                    onClickHold(12);
                    setName("Remark RECEIVED");
                  }}
                >
                  RECEIVED
                </AmButton>
              ) : null}
              {props.modifyQC === true ? (
                <AmButton
                  style={{ marginRight: "5px" }}
                  styleType="confirm"
                  onClick={() => {
                    onClickHold(98);
                    setName("Remark QC");
                  }}
                >
                  QC
                </AmButton>
              ) : null}
              {props.modifyQC === true ? (
                <AmButton
                  style={{ marginRight: "5px" }}
                  styleType="confirm"
                  onClick={() => {
                    onClickHold(97);
                    setName("Remark Partial");
                  }}
                >
                  PARTIAL
                </AmButton>
              ) : null}
              {props.modifyQC === true ? (
                <AmButton
                  style={{ marginRight: "5px" }}
                  styleType="confirm"
                  onClick={() => {
                    onClickHold(96);
                    setName("Remark Return");
                  }}
                >
                  RETURN
                </AmButton>
              ) : null}
              <AmButton
                style={{ marginRight: "5px" }}
                styleType="warning"
                onClick={() => {
                  FuncRanderRemark();
                  setTypeButton(0);
                  setAddData(true);
                  setDialog(true);
                  setName("Remark");
                }}
              >
                REMARK
              </AmButton>
            </div>
          ) : null
        }
      />

      <Pagination
        totalSize={totalSize}
        pageSize={100}
        resetPage={resetPage}
        onPageChange={page => setPage(page)}
      />
      <br />
    </div>
  );
};
export default AmStorageObjectMulti;
