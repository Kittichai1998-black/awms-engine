import React, { useState, useEffect } from "react";

import Table from "../../components/table/AmTable";
import Checkbox from "@material-ui/core/Checkbox";
// import DocView from "../../views/pageComponent/DocumentView";
import Pagination from "../../components/table/AmPagination";
import AmEditorTable from "../../components/table/AmEditorTable";
import axios from "axios";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
// import Button from '@material-ui/core/Button';
import Clone from "../../components/function/Clone";
// import { withFixedColumnsScrollEvent } from "react-table-hoc-fixed-columns";
import AmButton from "../../components/AmButton";
// import Grid from '@material-ui/core/Grid';
import AmInput from "../../components/AmInput";
import AmDialogs from "../../components/AmDialogs";
import styled from "styled-components";
import AmDropdown from "../../components/AmDropdown";
import AmFindPopup from "../../components/AmFindPopup";
import AmFilterTable from "../../components/table/AmFilterTable";
// import AmCheckBox from '../../components/AmCheckBox'
import AmDate from "../../components/AmDate";
import guid from "guid";
import moment from "moment";
import { useTranslation } from "react-i18next";
import readXlsxFile from "read-excel-file";

import queryString from "query-string";

const Axios = new apicall();
//   const createQueryString = (select) => {
//     let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
//         + (select.q === "" ? "" : "&q=" + select.q)
//         + (select.f === "" ? "" : "&f=" + select.f)
//         + (select.g === "" ? "" : "&g=" + select.g)
//         + (select.s === "" ? "" : "&s=" + select.s)
//         + (select.sk === "" ? "" : "&sk=" + select.sk)
//         + (select.l === 0 ? "" : "&l=" + select.l)
//         + (select.all === "" ? "" : "&all=" + select.all)
//         + "&isCounts=true"
//         + "&apikey=free01"
//     return queryS
// }

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
const MasterData = props => {
  const { t } = useTranslation();
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: props.manualConditionViw
      ? props.manualConditionViw
      : "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s:
      props.tableQuery === "AreaRoute" ||
        props.tableQuery === "ObjectSizeMap" ||
        props.tableQuery === "WorkQueue"
        ? "[{'f':'ID','od':'asc'}] "
        : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  // ExportQuery
  const ExportQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: props.manualConditionViw
      ? props.manualConditionViw
      : "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s:
      props.tableQuery === "AreaRoute" ||
        props.tableQuery === "ObjectSizeMap" ||
        props.tableQuery === "WorkQueue"
        ? "[{'f':'ID','od':'asc'}] "
        : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 0,
    all: ""
  };
  //===========================================================
  const Query2 = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s:
      props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap"
        ? "[{'f':'ID','od':'asc'}] "
        : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  //===========================================================
  const [resetPage, setResetPage] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (resetPage === true) {
      setResetPage(false);
    }
  }, [resetPage]);

  // useEffect(() => {
  //   console.log(props.checked)
  //   setEditData({})
  // }, [props.checked]);

  const FuncSetTable = () => {
    const iniCols = props.iniCols;
    if (props.notModifyCol !== true) {
      if (props.customUser === true) {
        iniCols.push(
          {
            Header: "Role",
            width: 80,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="confirm"
                onClick={() => {
                  FuncSetEleRole(e);
                  setEditData(Clone(e.original));
                  setTimeout(() => setDialogRole(true), 500);
                }}
              >
                {t("Role")}
              </AmButton>
            ),
            sortable: false
          },
          {
            Header: "Edit",
            width: 100,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="info"
                onClick={() => {
                  setEditData(Clone(e.original));
                  edit(e, "editPass");
                }}
              >
                {t("Password")}
              </AmButton>
            ),
            sortable: false
          },
          {
            Header: "Edit",
            width: 80,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="info"
                onClick={() => {
                  setEditData(Clone(e.original));
                  edit(e, "edit");
                }}
              >
                {t("Info")}
              </AmButton>
            ),
            sortable: false
          },
          {
            Header: "Delete",
            width: 80,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="delete"
                onClick={() => {
                  setDeleteData(e);
                  edit(e, "delete");
                }}
              >
                {t("Delete")}
              </AmButton>
            ),
            sortable: false
          }
        );
      } else {
        iniCols.push(
          {
            Header: "Edit",
            width: 80,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="info"
                onClick={() => {
                  setEditData(Clone(e.original));
                  edit(e, "edit");
                }}
              >
                {t("Edit")}
              </AmButton>
            ),
            sortable: false
          },
          {
            Header: "Delete",
            width: 80,
            Cell: e => (
              <AmButton
                style={{ lineHeight: "1" }}
                styleType="delete"
                onClick={() => {
                  setDeleteData(e);
                  edit(e, "delete");
                }}
              >
                {t("Delete")}
              </AmButton>
            ),

            sortable: false
          }
        );
      }
    }

    return iniCols;
  };
  //===========================================================
  // const [dataRole, setDataRole] = useState([])
  const [datax, setDatax] = useState([]);
  const FuncGetRole = () => {
    const iniCols = [
      { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
      { Header: "Name", accessor: "Name", width: 200 }
    ];

    return [
      {
        field: "Code",
        component: (data, cols, key) => {
          return (
            <div key={key}>
              <Table
                sortable={false}
                defaultSelection={datax}
                primaryKey="ID"
                data={props.dataUser}
                columns={iniCols}
                pageSize={100}
                style={{ maxHeight: "550px" }}
                selection={true}
                selectionType="checkbox"
                getSelection={data => {
                  setSelection(data);
                }}
              />{" "}
            </div>
          );
        }
      }
    ];
  };

  async function FuncSetEleRole(data) {
    var defaultRole = [];
    const Query = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "User_Role",
      q:
        "[{ 'f': 'User_ID', c:'==', 'v': " +
        data.original.ID +
        "},{ 'f': 'Status', 'c':'==', 'v': 1}]",
      f: "ID,Role_ID",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    await Axios.get(createQueryString(Query)).then(res => {
      var row = res.data.datas;
      row.forEach(x => {
        //defaultRole.push(x.Role_ID)
        defaultRole.push({ ID: x.Role_ID });
      });
    });
    setDatax(defaultRole);
    //return randerFunc(defaultRole,iniCols)
  }

  //=============================================================
  const onHandleSetRoleConfirm = (status, rowdata) => {
    if (status) {
      UpdateRole(rowdata);
    }
    setDialogRole(false);
  };

  //=============================================================
  async function UpdateRole(rowdata) {
    const Query3 = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "User_Role",
      q: "[{ 'f': 'User_ID', c:'==', 'v': " + rowdata.ID + "}]",
      f: "ID,Role_ID,User_ID,Status",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };

    await Axios.get(createQueryString(Query3))
      .then(res => {
        var row = res.data.datas;

        var datafi = row.map(dataMap => {
          var dataselect = selection.find(list => {
            return list.ID === dataMap.Role_ID;
          });
          if (dataselect) {
            dataMap.Status = 1;
          } else {
            dataMap.Status = 0;
          }
          return dataMap;
        });

        var dataselectInsert = selection.map(datas => {
          var datafiInsert = row.find(listInsert => {
            return listInsert.Role_ID === datas.ID;
          });
          if (!datafiInsert) {
            return {
              ID: 0,
              User_ID: rowdata.ID,
              Role_ID: datas.ID,
              Status: 1
            };
          }
        });

        return datafi.concat(dataselectInsert.filter(x => x !== undefined));
      })
      .then(response => {
        let updjson = {
          t: "ams_User_Role",
          pk: "ID",
          datas: response,
          nr: false,
          _token: localStorage.getItem("Token")
        };
        Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then(res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setOpenSuccess(true);
              getData(createQueryString(query));
              setPage(0);
              setResetPage(true);
              Clear();
            } else {
              setOpenError(true);
              setTextError(res.data._result.message);
              getData(createQueryString(query));
              setPage(0);
              setResetPage(true);
              Clear();
            }
          }
        });
      });
  }
  //===========================================================
  const [idEdit, setiIdEdit] = useState({});
  const [query3, setQuery3] = useState();
  const edit = (e, type) => {
    const Query3 = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: props.tableQuery,
      q: "[{ 'f': 'ID', c:'==', 'v': " + e.original.ID + "}]",
      f: "*",
      g: "",
      s:
        props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap"
          ? "[{'f':'ID','od':'asc'}] "
          : "[{'f':'Code','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    setQuery3(Query3);

    Axios.get(createQueryString(Query3)).then(res => {
      //setDataSource1(res.data.datas)
      setiIdEdit(res.data.datas);
    });

    if (type === "edit") {
      setDialogEdit(true);
    } else if (type === "editPass") {
      setDialogEditPassWord(true);
    } else {
      setDialogDelete(true);
    }
  };

  //===========================================================
  const [fileCol, setFileCol] = useState(null);
  const input = document.getElementById("input");
  const FuncImport = e => {
    var columnsExcel = props.columnsExcel;
    readXlsxFile(input.files[0]).then(rows => {
      var dataImport = [];

      for (var i = 1; i < rows.length; i++) {
        var dataObj = {};

        rows[i].forEach((row, idx) => {
          if (columnsExcel[idx] !== undefined) {
            dataObj[columnsExcel[idx]] = row;
          }
        });
        dataImport.push(dataObj);
      }
      Axios.post(window.apipath + "/v2/UpdateImportSKUAPI", {
        data: dataImport
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            input.value = null;
            getData(createQueryString(query));
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            input.value = null;
            getData(createQueryString(query));
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    });
  };

  //===========================================================
  const [valueText1, setValueText1] = useState({});

  const FuncTest = () => {
    if (props.dataAdd) {
      const x = props.dataAdd;
      return x.map(y => {
        return {
          field: y.field,
          component: (data = null, cols, key) => {
            let rowError = inputError.length ? inputError.some(z => {
              return z === y.field
            }) : false
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
                  y.required,
                  rowError,
                  y.disable,
                  y.disableCustom
                )}
              </div>
            );
          }
        };
      });
    }
  };
  //===========================================================
  const FuncTestEdit = () => {
    if (props.dataEdit) {
      const x = props.dataEdit;
      return x.map(y => {
        return {
          field: y.field,
          component: (data = null, cols, key) => {
            let rowError = inputError.length ? inputError.some(z => {
              return z === y.field
            }) : false
            return (
              <div key={key}>
                {FuncTestSetEleEdit(
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
                  y.inputType,
                  y.disable,
                  y.required,
                  rowError
                )}
              </div>
            );
          }
        };
      });
    }
  };
  const FuncTestEditPassWord = () => {
    if (props.columnsEditPassWord) {
      const x = props.columnsEditPassWord;
      return x.map(y => {
        return {
          field: y.field,
          component: (data = null, cols, key) => {
            let rowError = inputError.length ? inputError.some(z => {
              return z === y.field
            }) : false
            return (
              <div key={key}>
                {FuncTestSetEleEdit(
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
                  y.inputType,
                  null,
                  y.required,
                  rowError
                )}
              </div>
            );
          }
        };
      });
    }
  };
  //===========================================================

  const FuncFilter = () => {
    if (props.columnsFilter) {
      const x = props.columnsFilter;
      return x.map(y => {
        return {
          field: y.field,
          component: (condition, cols, key) => {
            return (
              <div key={key} style={{ display: "inline-block" }}>
                {FuncFilterSetEle(
                  key,
                  y.field,
                  y.type,
                  y.name,
                  condition,
                  cols.field,
                  y.fieldLabel,
                  y.placeholder,
                  y.dataDropDow,
                  y.typeDropdow,
                  y.labelTitle,
                  y.colsFindPopup,
                  y.fieldDataKey,
                  y.checkBox
                )}
              </div>
            );
          }
        };
      });
    }
  };
  const FuncFilterPri = () => {
    const x = props.columnsFilterPrimary;
    return x.map(y => {
      return {
        field: y.field,
        component: (condition, cols, key) => {
          return (
            <div key={key} style={{ display: "inline-block" }}>
              {FuncFilterSetEle(
                key,
                y.field,
                y.type,
                y.name,
                condition,
                cols.field,
                y.fieldLabel,
                y.placeholder,
                y.dataDropDow,
                y.typeDropdow,
                y.labelTitle,
                y.colsFindPopup,
                y.fieldDataKey,
                y.checkBox
              )}
            </div>
          );
        }
      };
    });
  };
  //===========================================================

  const FuncFilterSetEle = (
    key,
    field,
    type,
    name,
    condition,
    colsField,
    fieldLabel,
    placeholder,
    dataDropDow,
    typeDropdow,
    labelTitle,
    colsFindPopup,
    fieldDataKey,
    inputType
  ) => {
    if (type === "input") {
      return (
        <div key={key}>
          <label style={{ width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>
          <AmInput
            id={field}
            placeholder={placeholder}
            style={{ width: "200px" }}
            type="input"
            onChangeV2={ele => {
              onChangeFilter(condition, colsField, ele);
            }}
            onKeyPress={(value, obj, element, event) =>
              onHandleChangeKeyEnter(value, null, "PalletCode", null, event)
            }
          />
        </div>
      );
    } else if (type === "dropdow") {
      return (
        <FormInline>
          {" "}
          <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>{" "}
          <AmDropdown
            id={field}
            placeholder={placeholder}
            fieldDataKey={fieldDataKey}
            fieldLabel={fieldLabel}
            labelPattern=" : "
            width={200}
            ddlMinWidth={200}
            zIndex={1000}
            valueData={valueText2[field]}
            queryApi={dataDropDow}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChangeFilter(
                value,
                dataObject,
                inputID,
                fieldDataKey,
                condition,
                colsField
              )
            }
            ddlType={typeDropdow}
          />{" "}
        </FormInline>
      );
    } else if (type === "findPopup") {
      return (
        <FormInline>
          <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>
          <AmFindPopup
            id={field}
            placeholder={placeholder}
            fieldDataKey={fieldDataKey}
            fieldLabel={fieldLabel}
            labelPattern=" : "
            valueData={valueText2[field]}
            labelTitle={labelTitle}
            queryApi={dataDropDow}
            columns={colsFindPopup}
            width={200}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChangeFilter(
                value,
                dataObject,
                inputID,
                fieldDataKey,
                condition,
                colsField
              )
            }
          />
        </FormInline>
      );
    } else if (type === "status" || type === "iotype") {
      return (
        <FormInline>
          {" "}
          <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>
          <AmDropdown
            id={field}
            placeholder={placeholder}
            fieldDataKey={"value"}
            width={200}
            ddlMinWidth={200}
            zIndex={1000}
            valueData={valueText2[field]}
            data={dataDropDow}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChangeFilter(
                value,
                dataObject,
                inputID,
                fieldDataKey,
                condition,
                colsField
              )
            }
            ddlType={typeDropdow}
          />{" "}
        </FormInline>
      );
    } else if (type === "dateFrom") {
      return (
        <FormInline>
          {" "}
          <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>
          <AmDate
            id={field}
            TypeDate={"date"}
            width="200px"
            //style={{width:"200px"}}
            onChange={value =>
              onChangeFilterDateTime(value, colsField, "dateFrom")
            }
            FieldID={"dateFrom"}
          ></AmDate>
        </FormInline>
      );
    } else if (type === "dateTo") {
      return (
        <FormInline>
          {" "}
          <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>
            {t(name)} :{" "}
          </label>
          <AmDate
            id={field}
            TypeDate={"date"}
            width="200px"
            //style={{width:"200px"}}
            onChange={value =>
              onChangeFilterDateTime(value, colsField, "dateTo")
            }
            FieldID={"dateTo"}
          ></AmDate>
        </FormInline>
      );
    }
  };
  //===========================================================

  const [filterData, setFilterData] = useState([
    { f: "status", c: "!=", v: "2" }
  ]);
  const [filterDialog, setFilterDialog] = useState(false);
  const [datetime, setDatetime] = useState({});
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
  const onChangeFilter = (condition, field, value, type) => {
    let obj;
    if (filterData.length > 0) obj = [...filterData];
    else obj = [condition];

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
              x.v = value + "%";
              x.c = "like";
            } else {
              obj.splice(idx, 1);
            }
          }
        }
      });
    } else {
      if (type === "dateFrom") {
        let createObj = {};
        createObj.f = field;
        createObj.type = "dateFrom";
        createObj.v = value;
        createObj.c = ">=";
        obj.push(createObj);
      } else if (type === "dateTo") {
        let createObj = {};
        createObj.f = field;
        createObj.type = "dateTo";
        createObj.v = moment(value).format("YYYY-MM-DDT23:59:00");
        createObj.c = "<=";
        obj.push(createObj);
      } else {
        let createObj = {};
        createObj.f = field;
        createObj.v = value + "%";
        createObj.c = "like";
        obj.push(createObj);
      }
    }
    setFilterData(obj);
  };
  const onHandleChangeKeyEnter = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      onHandleFilterConfirm(true);
    }
  };
  //===========================================================

  const onHandleFilterConfirm = (status, obj) => {
    //console.log(props.history.location)
    if (status) {
      let getQuery = Clone(query);
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
      var datachecknull = filterDatas.filter(x => x.v !== "%");
      var datacheckLike = datachecknull.filter(x => x.c === "like");
      var result = datacheckLike.map(x => {
        return x.f + "=" + encodeURIComponent(x.v);
      });
      var resultfilter = result.join("&");
      props.history.push(props.history.location.pathname + "?" + resultfilter);

      getQuery.q = JSON.stringify(filterDatas);
      setQuery(getQuery);
    }
    //setDatetime({})
    //setFilterData([{"f":"status","c":"!=","v":"2"}])
    setFilterDialog(false);
    setFilterDialog(false);
  };
  //===========================================================
  const [packCode, setPackCode] = useState("");
  const [packName, setPackName] = useState("");

  const onHandleDDLChange = (
    value,
    dataObject,
    inputID,
    fieldDataKey,
    data,
    required
  ) => {
    setValueText1({
      ...valueText1,
      [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey
      }
    });
    onChangeEditor(inputID, data, value, null, null, required);
  };
  //=============================================================

  const [valueText2, setValueText2] = useState({});

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
  //=============================================================
  const [customAdd, setCustomAdd] = useState(false);
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
    required,
    rowError,
    disable,
    disableCustom
  ) => {

    if (type === "input") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput

              id={cols.field}
              error={rowError}
              required={required}
              validate={true}
              // msgError="Error"
              regExp={validate}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="input"
              //value={checkEvent ? "" : data[cols.field]}
              disabled={
                disableCustom ? (
                  cols.field === "Code2" ? !checkEvent : checkEvent
                ) : disable
              }
              //value={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, null, null, required, checkEvent);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } if (type === "checkbox") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <Checkbox onClick={event => {
            setCheckEvent(!event.target.checked)
            //console.log(event.target.checked)
            if (event.target.checked) {
              data["Code2"] = "";
              document.getElementById("Code2").value = "";
            } else {
              data["CodeEnd"] = "";
              data["CodeStart"] = "";
              document.getElementById("CodeEnd").value = "";
              document.getElementById("CodeStart").value = "";
            }

          }}
            defaultChecked={false}
          />
        </FormInline>
      );
    } else if (type === "password") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              error={rowError}
              autoComplete="off"
              id={cols.field}
              required={required}
              validate={true}
              // msgError="Error"
              regExp={validate}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="password"
              // value={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, null, null, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "dropdow") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <AmDropdown
            error={rowError}
            required={required}
            id={cols.field}
            placeholder={placeholder}
            fieldDataKey={"ID"}
            fieldLabel={fieldLabel}
            labelPattern=" : "
            width={270}
            ddlMinWidth={270}
            valueData={valueText1[cols.field]}
            queryApi={dataDropDow}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)
            }
            ddlType={typeDropdow}
          />
        </FormInline>
      );
    } else if (type === "findPopup") {
      return (
        <FormInline>
          <LabelH>{t(name)} : </LabelH>
          <AmFindPopup
            error={rowError}
            required={required}
            id={cols.field}
            placeholder={placeholder}
            fieldDataKey="ID"
            fieldLabel={fieldLabel}
            labelPattern=" : "
            valueData={valueText1[cols.field]}
            labelTitle={labelTitle}
            queryApi={dataDropDow}
            columns={colsFindPopup}
            defaultValue={data ? data[cols.field] : ""}
            width={270}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleChange(value, dataObject, inputID, fieldDataKey, data)
            }
          />
        </FormInline>
      );
    } else if (type === "inputPackCode") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              error={rowError}
              required={required}
              id={cols.field}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="input"
              // value={data[cols.field] && data ? data[cols.field] : packCode}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "Pack Code", null, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "inputPackName") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              error={rowError}
              required={required}
              id={cols.field}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="input"
              // value={data[cols.field] && data ? data[cols.field] : packName}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "Pack Name", null, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "status" || type === "iotype") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <AmDropdown
            error={rowError}
            id={cols.field}
            required={required}
            placeholder={placeholder}
            fieldDataKey={"value"}
            width={270}
            ddlMinWidth={270}
            valueData={valueText1[cols.field]}
            data={dataDropDow}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)
            }
            ddlType={typeDropdow}
          />
        </FormInline>
      );
    }
  };
  //=============================================================

  const FuncTestSetEleEdit = (
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
    inputType,
    disable,
    required,
    inputError
  ) => {
    if (type === "input") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              required={required}
              error={inputError}
              id={cols.field}
              validate={true}
              // msgError="Error"
              regExp={validate}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type={"input"}
              defaultValue={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "", inputType, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "password") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              required={required}
              error={inputError}
              id={cols.field}
              validate={true}
              // msgError="Error"
              regExp={validate}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type={"password"}
              defaultValue={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "", inputType, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "dropdow") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <AmDropdown
            required={required}
            error={inputError}
            id={cols.field}
            disabled={disable}
            placeholder={placeholder}
            fieldDataKey={"ID"}
            fieldLabel={fieldLabel}
            labelPattern=" : "
            width={270}
            ddlMinWidth={270}
            valueData={valueText1[cols.field]}
            queryApi={dataDropDow}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)
            }
            ddlType={typeDropdow}
          />
        </FormInline>
      );
    } else if (type === "findPopup") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <AmFindPopup
            required={required}
            error={inputError}
            id={cols.field}
            placeholder={placeholder}
            fieldDataKey="ID"
            fieldLabel={fieldLabel}
            labelPattern=" : "
            valueData={valueText1[cols.field]}
            labelTitle={labelTitle}
            queryApi={dataDropDow}
            columns={colsFindPopup}
            defaultValue={data ? data[cols.field] : ""}
            width={270}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleChange(value, dataObject, inputID, fieldDataKey, data, required)
            }
          />
        </FormInline>
      );
    } else if (type === "inputPackCode") {
      if (!valueText1["SKUMaster_ID"]) {
        setPackCode(data[cols.field]);
      }
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              required={required}
              error={inputError}
              id={cols.field}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="input"
              // value={packCode}
              defaultValue={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "Pack Code", null, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "inputPackName") {
      if (!valueText1["SKUMaster_ID"]) {
        setPackName(data[cols.field]);
      }
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <InputDiv>
            <AmInput
              required={required}
              error={inputError}
              id={cols.field}
              style={{ width: "270px", margin: "0px" }}
              placeholder={placeholder}
              type="input"
              // value={packName}
              defaultValue={data ? data[cols.field] : ""}
              onChange={val => {
                onChangeEditor(cols.field, data, val, "Pack Name", null, required);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (type === "status" || type === "iotype") {
      return (
        <FormInline>
          {" "}
          <LabelH>{t(name)} : </LabelH>
          <AmDropdown
            required={required}
            error={inputError}
            id={cols.field}
            placeholder={placeholder}
            fieldDataKey={"value"}
            width={270}
            ddlMinWidth={270}
            valueData={valueText1[cols.field]}
            data={dataDropDow}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)
            }
            ddlType={typeDropdow}
          />
        </FormInline>
      );
    }
  };
  //=============================================================

  const onHandleChange = (value, dataObject, inputID, fieldDataKey, data, required) => {
    setValueText1({
      ...valueText1,
      [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey
      }
    });

    if (props.tableQuery === "PackMaster") {
      if (dataObject !== null) {
        setPackCode(dataObject.Code);
        setPackName(dataObject.Name);
      }
      if (dataObject === null) {
        setPackCode("");
        setPackName("");
      }
    }
    onChangeEditor(inputID, data, value, null, null, required);
  };
  //=============================================================
  const [dataSource, setDataSource] = useState([]);
  const [dataSource1, setDataSource1] = useState([])
  const [checkEvent, setCheckEvent] = useState(true);
  const [totalSize, setTotalSize] = useState(0);
  const [columns, setColumns] = useState(FuncSetTable());
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState();
  const [selection, setSelection] = useState();
  const [query, setQuery] = useState(Query);
  const [query2, setQuery2] = useState(Query2);
  const [editRow, setEditRow] = useState([]);
  const [editData, setEditData] = useState({});
  const [deleteData, setDeleteData] = useState();
  const [deleteDataTmp, setDeleteDataTmp] = useState([]);
  const [addData, setAddData] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogEdit, setDialogEdit] = useState(false);
  const [dialogEditPassWord, setDialogEditPassWord] = useState(false);
  const [dialogRole, setDialogRole] = useState(false);
  const [dialogDelete, setDialogDelete] = useState(false);
  const [data2, setData2] = useState({});
  const [dataSentToAPI, setDataSentToAPI] = useState([]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [excelDataSrouce, setExcelDataSource] = useState([]);
  const [openFilex, setOpenFilex] = useState();
  const [inputError, setInputError] = useState([])
  //const [page, setPage] = useState();

  //===========================================================

  const onHandleEditConfirm = (status, rowdata, arrObjInputError, type) => {
    //console.log(status);
    if (status) {
      if (arrObjInputError.length) {
        setInputError(arrObjInputError.map(x => x.field))
      } else {
        //console.log("is Action");
        UpdateData(rowdata, type);
        // type is add, edit, editPass
      }
    } else {
      setValueText1([]);
      setEditData({});
      setAddData(false);
      setDialog(false);
      setDialogEdit(false);
      setDialogEditPassWord(false);
      setPackCode("");
      setPackName("");
    }

  };
  //=================================================
  const UpdateData = (rowdata, type) => {
    // console.log(rowdata)
    // console.log(type)
    var dataEditx = {}
    if (type === "edit" || type === "editPass") {
      props.dataEdit.forEach(y => {
        // console.log(y)
        dataEditx["ID"] = rowdata["ID"]
        dataEditx[y.field] = rowdata[y.field]

      })
    } else {
      //console.log(props.dataAdd)
      props.dataAdd.forEach(y => {
        // console.log(y)
        dataEditx["ID"] = null
        dataEditx[y.field] = rowdata[y.field]
      })
    }
    if (props.tableQuery === "User") {
      var guidstr = guid.raw().toUpperCase()
      var i = 0, strLength = guidstr.length;
      for (i; i < strLength; i++) {
        guidstr = guidstr.replace('-', '');
      }
      dataEditx["password"] = "@@sql_gen_password," + dataEditx["password"] + "," + guidstr
      dataEditx["SaltPassword"] = guidstr
    }
    dataEditx["Status"] = 1
    var dataBaseMitiObj = []
    if (props.tableQuery === "BaseMaster" && type === "add") {
      // console.log(checked)
      var prefix = props.prefix
      var codeLength = props.baseLength
      // console.log(dataEditx["CodeEnd"])
      // console.log(dataEditx["CodeStart"])

      if (dataEditx["CodeStart"] !== undefined && dataEditx["CodeEnd"] !== undefined) {

        if (dataEditx["CodeStart"] !== "" && dataEditx["CodeEnd"] !== "") {
          var prefixStart = dataEditx["CodeStart"].substring(0, prefix);
          var numStart = dataEditx["CodeStart"].substring(prefix, codeLength);
          //END
          var prefixEnd = dataEditx["CodeEnd"].substring(0, prefix);
          var numEnd = dataEditx["CodeEnd"].substring(prefix, codeLength);

          if (dataEditx["CodeStart"].length != codeLength)
            throw new UserException("Length ของ Code Start ไม่ถูกต้อง")

          if (dataEditx["CodeEnd"].length != codeLength)
            throw new UserException("Length ของ Code End ไม่ถูกต้อง")

          if (prefixStart.length != prefix)
            throw new UserException("Length ของ Prefix Start ไม่ถูกต้อง")

          if (prefixEnd.length != prefix)
            throw new UserException("Length ของ Prefix End ไม่ถูกต้อง")

          if (numEnd <= numStart)
            throw new UserException("Code Start มีค่าน้อยกว่าหรือเท่ากับ Code End")

          for (var i = numStart; i <= numEnd; i++) {
            var genBase = prefixStart.toUpperCase() + i.toString().padStart(codeLength - prefix, '0');
            // console.log(genBase)

            delete dataEditx["CodeEnd"]
            delete dataEditx["CodeStart"]
            delete dataEditx["Checkbox"]
            delete dataEditx["Code2"]

            dataEditx["Code"] = genBase

            var x = Clone(dataEditx)
            dataBaseMitiObj.push(x)
            // console.log(dataEditx["Code"])

          }
        } else {
          delete dataEditx["Checkbox"]
          delete dataEditx["CodeEnd"]
          delete dataEditx["CodeStart"]
          dataEditx["Code"] = dataEditx["Code2"]
          delete dataEditx["Code2"]
          dataBaseMitiObj.push(dataEditx)
        }
      } else {
        delete dataEditx["Checkbox"]
        delete dataEditx["CodeEnd"]
        delete dataEditx["CodeStart"]
        dataEditx["Code"] = dataEditx["Code2"]
        delete dataEditx["Code2"]
        dataBaseMitiObj.push(dataEditx)
      }
    }
    // console.log(dataBaseMitiObj)
    // console.log([dataEditx])
    let updjson = {
      "t": props.table,
      "pk": "ID",
      "datas": props.tableQuery === "BaseMaster" ? (dataBaseMitiObj.length !== 0 ? dataBaseMitiObj : [dataEditx]) : [dataEditx],
      "nr": false,
      "_token": localStorage.getItem("Token")
    }
    // console.log(updjson)
    // console.log(dataSentToAPI)
    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then((res) => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          dataEditx = {}
          setOpenSuccess(true)
          getData(createQueryString(query))
          setPage(0);

          setResetPage(true);
          Clear()
        } else {
          dataEditx = {}
          setOpenError(true)
          setTextError(res.data._result.message)
          getData(createQueryString(query))
          setPage(0);
          setResetPage(true);
          Clear()
        }
      }
    })
  }
  //===========================================================
  function UserException(message) {
    setOpenError(true)
    setTextError(message)
    this.message = message;
    this.name = 'UserException';
  }
  const onHandleDeleteConfirm = (status, rowdata) => {
    if (status) {
      DeleteData();
    }
    setDialogDelete(false);
  };
  //===========================================================
  useEffect(() => { }, [editRow]);

  useEffect(() => {
    getDataFilterURL();
  }, []);

  const getDataFilterURL = () => {
    if (
      props.history.location != null &&
      props.history.location.search != null &&
      props.history.location.search.length > 0
    ) {
      let searchValue = queryString.parse(props.history.location.search);
      let newSel = [];

      Object.entries(searchValue).forEach(([key, value], index) => {
        if (index === 0) {
          newSel.push({
            f: key,
            c: "like",
            v: encodeURIComponent(value)
          });
        } else {
          newSel.push({
            o: "or",
            f: key,
            c: "like",
            v: encodeURIComponent(value)
          });
        }
      });
      onHandleFilterConfirmURL(newSel);
    }
  };
  const onHandleFilterConfirmURL = obj => {
    let getQuery = { ...query };
    let filterDatas = [...filterData];
    filterDatas.unshift({ q: obj });
    getQuery.q = JSON.stringify(filterDatas);
    setQuery(getQuery);
  };
  useEffect(() => {
    if (query !== null) getData(createQueryString(query));
  }, [query]);

  useEffect(() => {
    if (typeof page === "number") {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
      setQuery(queryEdit);
    }
  }, [page]);

  useEffect(() => {
    if (sort !== 0) {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      setQuery(queryEdit);
    }
  }, [sort]);
  //===========================================================

  async function getData(qryString) {
    const res = await Axios.get(qryString).then(res => res);
    setDataSource(res.data.datas);
    setTotalSize(res.data.counts);
    setPackCode("");
    if (props.notModifyCol !== true) {
      Axios.get(createQueryString(query2)).then(res => {
        setDataSource1(res.data.datas);
      });
    }

    let getExcelQuery = Clone(ExportQuery);
    getExcelQuery.q = query.q;
    //const resExcel = await Axios.get(createQueryString(getExcelQuery)).then(res => res)
    const resExcel = createQueryString(getExcelQuery);
    setExcelDataSource(resExcel);
  }
  //===========================================================
  let fil1 = {};
  const DeleteData = () => {
    let dataDelete = idEdit[0];
    dataDelete["Status"] = 2;
    delete dataDelete["ModifyBy"];
    delete dataDelete["ModifyTime"];

    var DataTmp = [];
    DataTmp.push(dataDelete);
    let updjson = {
      t: props.table,
      pk: "ID",
      datas: DataTmp,
      nr: false,
      _token: localStorage.getItem("Token")
    };
    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setOpenSuccess(true);
          getData(createQueryString(query));
          setPage(0);
          setResetPage(true);
          Clear();
        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
          getData(createQueryString(query));
          setPage(0);
          setResetPage(true);
          Clear();
        }
      }
    });
  };
  //===========================================================

  const onChangeEditor = (field, rowdata, value, type, inputType, required, disable) => {



    if (field === "WeightKG" && value === "") {
      //console.log("xx")
      value = null;
    }

    if (inputType === "number" && value == "") {
      value = null;
    }
    let fil = {};
    if (type === "Pack Code") {
      setPackCode(value);
      setValueText1({ SKUMaster_ID: "xxxxxx" });
    } else if (type === "Pack Name") {
      setPackName(value);
      setValueText1({ SKUMaster_ID: "xxxxxx" });
    }
    //console.log(editData)


    let editDataNew = Clone(editData)

    if (addData && Object.getOwnPropertyNames(editDataNew).length === 0) {
      editDataNew["ID"] = null
      editDataNew["Revision"] = 1;
      editDataNew["Status"] = 1;
      editDataNew[field] = value;
      if (props.tableQuery === "PackMaster") {
        editDataNew["Code"] = packCode;
        editDataNew["Name"] = packName;
      }
    } else {
      editDataNew[field] = value;
    }
    setEditData(editDataNew);



    if (required) {
      if (!editDataNew[field]) {
        const arrNew = [...new Set([...inputError, field])]
        setInputError(arrNew)
      } else {
        const arrNew = [...inputError]
        const index = arrNew.indexOf(field);
        if (index > -1) {
          arrNew.splice(index, 1);
        }
        setInputError(arrNew)
      }
    }



  };
  //===========================================================
  useEffect(() => {
    setColumns(Clone(columns));
  }, [dataSource, editRow]);

  //===========================================================

  const Clear = () => {
    setEditRow([]);
    setDialog(false);
    setDialogEdit(false)
    setDialogEditPassWord(false)
    setDeleteDataTmp([]);
    setData2({});
    setDataSentToAPI([]);
    setValueText1([]);
    setPackCode("");
    setPackName("");
  };

  //===========================================================
  return (
    <div>
      {/* {props.custompopupAddEle} */}
      {customAdd === true ? props.custompopupAddEle : null}
      <AmFilterTable
        defaultCondition={{ f: "status", c: "!=", v: "2" }}
        primarySearch={FuncFilterPri()}
        extensionSearch={FuncFilter()}
        onAccept={(status, obj) => onHandleFilterConfirm(status, obj)}
      />
      <br />
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
        //style={{width:"600",height:"300px"}}
        open={dialog}
        onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "add")}
        titleText={"Add"}
        data={editData}
        columns={FuncTest()}
        objColumnsAndFieldCheck={{ objColumn: props.dataAdd, fieldCheck: "field" }}
      />
      <AmEditorTable
        open={dialogEdit}
        onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "edit")}
        titleText={"Edit"}
        data={editData}
        columns={FuncTestEdit()}
        objColumnsAndFieldCheck={{ objColumn: props.dataEdit, fieldCheck: "field" }}
      />
      <AmEditorTable
        open={dialogEditPassWord}
        onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "editPass")}
        titleText={addData === true ? "Add" : "Edit Password "}
        data={editData}
        columns={FuncTestEditPassWord()}
        objColumnsAndFieldCheck={{ objColumn: props.columnsEditPassWord, fieldCheck: "field" }}
      />
      <AmEditorTable
        open={dialogDelete}
        onAccept={status => onHandleDeleteConfirm(status)}
        titleText={"Confirm Delete"}
        columns={[]}
      />
      <AmEditorTable
        open={dialogRole}
        onAccept={(status, rowdata) => onHandleSetRoleConfirm(status, rowdata)}
        titleText={"Edit Role"}
        data={editData}
        columns={FuncGetRole()}
      />

      <Table
        excelQueryAPI={excelDataSrouce}
        primaryKey="ID"
        data={dataSource}
        columns={columns}
        pageSize={100}
        sort={sort => setSort({ field: sort.id, order: sort.sortDirection })}
        style={{ maxHeight: "550px" }}
        editFlag="editFlag"
        currentPage={page}
        exportData={true}
        //excelData={excelDataSrouce}
        renderCustomButtonB4={
          <FormInline>
            {props.dataAdd ? (
              <AmButton
                style={{ marginRight: "5px" }}
                styleType="add"
                onClick={() => {
                  FuncTest();
                  setAddData(true);
                  setDialog(true);
                }}
              >
                {t("Add")}
              </AmButton>
            ) : null}
            {props.import == true ? (
              <label
                style={{
                  width: "60px",
                  fontWeight: "bolder",
                  display: "inline-block",
                  background: "#22a6b3",
                  //marginTop:"0px !important",
                  //marginBottom:"0px !important",
                  margin: "0px 0px 0px 0px ",
                  color: "white",
                  //border: "1px solid #999",
                  marginRight: "5px",
                  borderRadius: "5px",
                  padding: "6px 5px",
                  paddingTop: "4px",
                  outline: "none",
                  whiteSpace: "nowrap",
                  boxShadow:
                    "0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)"
                }}
              >
                Import
                <input
                  style={{ visibility: "hidden", width: "0px" }}
                  id="input"
                  type="file"
                  onChange={e => FuncImport(e)}
                />
              </label>
            ) : null}
            {props.customButton}
          </FormInline>
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
export default MasterData;
