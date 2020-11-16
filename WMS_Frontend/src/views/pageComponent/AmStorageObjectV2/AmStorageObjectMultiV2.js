import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString, IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmTable from "../../../components/AmTable/AmTable";
import { DataGenerateMulti } from "../AmStorageObjectV2/SetMulti";
import { QueryGenerate } from '../../../components/function/UtilFunction';
import AmDropdown from '../../../components/AmDropdown';
import AmDatePicker from '../../../components/AmDatePicker';
import AmButton from "../../../components/AmButton";
import AmEditorTable from "../../../components/table/AmEditorTable";
import AmInput from "../../../components/AmInput";
import AmDialogs from "../../../components/AmDialogs";

const Axios = new apicall();

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;
const LabelD = styled.label`
font-size: 10px
  width: 50px;
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


  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)

  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);
  const [selection, setSelection] = useState();
  const [dialog, setDialog] = useState(false);
  const [remarkMode, setRemarkMode] = useState(false);
  const [hold, setHold] = useState(true);
  const [remark, setRemark] = useState("");
  const [dialogState, setDialogState] = useState({});
  const [pageSize, setPageSize] = useState(20);
  const [mode, setMode] = useState("");
  const [aditStatus, setAditStatus] = useState("");


  const [reset, setReset] = useState(false)

  const QueryCustom = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "r_StorageObjectV3",
    //q: '[{ "f": "Status", "c":"!=", "v": 0},{ "f": "ProductOwner_ID", "c":"in", "v": ' + localStorage.getItem("User_ProductOwner") + '}]',
    q: '[{ "f": "Status", "c":"!=", "v": 0},{ "f": "ProductOwner_ID", "c":"in", "v": "' + localStorage.getItem("User_ProductOwner") + '"}]',
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: pageSize,
    all: ""
  };
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "r_StorageObjectV3",
    q: '[{ "f": "Status", "c":"!=", "v": 0}]',
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: pageSize,
    all: ""
  };
  const [queryViewData, setQueryViewData] = useState(props.actionQueryCustom === true ? QueryCustom : Query);
  useEffect(() => {
    if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
      getData(queryViewData)

  }, [queryViewData])

  useEffect(() => {
    if (typeof (page) === "number" && !iniQuery) {
      const queryEdit = JSON.parse(JSON.stringify(queryViewData));
      queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
      getData(queryEdit)
    }
  }, [page])

  useEffect(() => {

    if (queryViewData.l !== pageSize) {
      queryViewData.l = pageSize
      setQueryViewData({ ...queryViewData })
    }
  }, [pageSize])


  function getData(data) {

    //setQueryViewData(Query)
    var queryStr = createQueryString(data)
    Axios.get(queryStr).then(res => {

      //var respone = DataGenerateMulti(res.data.datas)
      setDataSource(res.data.datas)
      setCount(res.data.counts)
    });
  }
  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
      console.log(fdata)
      if (fdata.customFilter !== undefined) {
        if (IsEmptyObject(fdata.customFilter)) {
          res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
        } else {
          res = QueryGenerate({ ...queryViewData }, fdata.customFilter.field, (fdata.customFilter.dateField === "dateTo" ? (fdata.value === "" ? null : fdata.value + "T23:59:59") : fdata.value), fdata.customFilter.dataType, fdata.customFilter.dateField)
        }
      } else {
        res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
      }

    });
    if (!IsEmptyObject(res))
      setQueryViewData(res)

  }

  const useColumns = (cols) => {

    const [columns, setColumns] = useState(cols);

    useEffect(() => {
      const iniCols = [...cols];

      iniCols.forEach(col => {
        let filterConfig = col.filterConfig;
        if (filterConfig !== undefined) {
          if (filterConfig.filterType === "dropdown") {
            col.Filter = (field, onChangeFilter) => {
              var checkType = Array.isArray(filterConfig.dataDropDown);
              if (checkType) {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                  ddlMinWidth={200}

                  defaultValue={(props.actionAuditStatus === true ? (field !== "AuditStatusName" ? null : "QUARANTINE") : null)}
                  zIndex={1000}
                  data={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                />
              }
              else {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                  ddlMinWidth={200}
                  defaultValue={(props.actionAuditStatus === true ? (field !== "AuditStatusName" ? null : "QUARANTINE") : null)}
                  zIndex={1000}
                  queryApi={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                  ddlType={filterConfig.typeDropDown}
                />
              }
            }
          } else if (filterConfig.filterType === "datetime") {
            col.width = 420;
            col.Filter = (field, onChangeFilter) => {
              return <FormInline>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateFrom" }) }} TypeDate={"date"} fieldID="dateFrom" />
                <label>-</label>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateTo" }) }} TypeDate={"date"} fieldID="dateTo" />
              </FormInline>
            }
          }
        }
      })
      setColumns(iniCols);
    }, [])

    return { columns };
  }
  const { columns } = useColumns(props.iniCols);

  const onHandleEditConfirm = (status) => {

    //var x = onChangeEditor()
    //console.log(remark)
    if (status) {
      onUpdateHold()
      setReset(true);
    }

    setDialog(false);
    setSelection([]);
  };

  useEffect(() => {
    return () => { setReset(false) }
  }, [reset]);


  const DataGenerateRemark = () => {
    const columns = [
      {
        field: "Option",
        type: "input",
        name: "Remark",
        placeholder: "Remark",
        required: true
      }
    ];
    return columns.map(y => {
      return {
        field: y.field,
        component: (data = null, cols, key) => {
          return (
            <div key={key}>
              <FormInline>
                {" "}
                <LabelH>{"Remark"} : </LabelH>
                <InputDiv>
                  <AmInput
                    id={cols.field}
                    style={{ width: "270px", margin: "0px" }}
                    type="input"
                    onChange={val => {
                      onChangeEditor(val);
                    }}
                  />
                </InputDiv>
              </FormInline>

            </div>
          );
        }
      };
    });
  };
  const onChangeEditor = (value) => {
    if (selection.length === 0) {
      setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
    } else {
      setRemark(value);
    }
  };
  const onUpdateHold = () => {
    let bstosID = [];

    if (selection.length > 0) {
      selection.forEach(rowdata => {
        bstosID.push(rowdata.ID);
      });
      let postdata = {
        bstosID: bstosID,
        IsHold: hold ? 1 : 0,
        remark: remark,
        remarkMode: remarkMode,
        mode: mode,
        aditStatus: aditStatus

      };

      Axios.post(window.apipath + "/v2/HoldStorageObjectAPI", postdata).then(
        res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setDialogState({ type: "success", content: "Success", state: true })
              if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
                getData(queryViewData);
              Clear();
            } else {
              setDialogState({ type: "error", content: res.data._result.message, state: true })
              if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
                getData(queryViewData);
              Clear();
            }
          }
        }
      );
    }

  }

  var auditAction = [{
    label: <div style={{ fontSize: "12px" }}>
      {"QUARANTINE"}</div>,
    action: (data) => {
      if (selection.length === 0) {
        setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
      } else {
        setDialog(true)
        setAditStatus("0")
        setMode("audit")
      }
    }

  }, {
    label: <div style={{ fontSize: "12px" }}>
      {"PASSED"}</div>,
    action: (data) => {
      if (selection.length === 0) {
        setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
      } else {
        setDialog(true)
        setAditStatus("1")
        setMode("audit")
      }
    }

  }, {
    label: <div style={{ fontSize: "12px" }}>
      {"REJECTED"}</div>,
    action: (data) => {
      if (selection.length === 0) {
        setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
      } else {
        setDialog(true)
        setAditStatus("2")
        setMode("audit")
      }
    }

  }, {
    label: <div style={{ fontSize: "12px" }}>
      {"HOLD"}</div>,
    action: (data) => {
      if (selection.length === 0) {
        setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
      } else {
        setDialog(true)
        setAditStatus("9")
        setMode("audit")
      }
    }

  },
  ]

  const Clear = () => {
    setSelection([]);
    setRemark("");
    setMode("")
    setAditStatus("")
    setRemarkMode(false)
  };
  //===========================================================
  return (
    <>
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status)}
        titleText={"Remark"}
        data={"text"}
        columns={DataGenerateRemark()}
      />
      <AmTable
        columns={columns}
        dataKey={"ID"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={pageSize}
        // onPageSizeChange={(pg) => { setPageSize(pg) }}
        filterable={true}
        filterData={res => { onChangeFilterData(res) }}
        clearSelectionAction={reset}
        pagination={true}
        selection={props.action === true ? "checkbox" : ""}
        selectionData={(data) => {
          setSelection(data);
        }}
        onPageSizeChange={(pageSize) => setPageSize(pageSize)}
        tableConfig={true}
        onPageChange={p => {
          if (page !== p)
            setPage(p)
          else
            setIniQuery(false)
        }}
        customTopLeftControl={props.customTopLeftControl}
        customAction={
          props.action === true ? (props.actionAuditStatus === true ? auditAction :
            [{
              label: <div style={{ fontSize: "12px" }}>
                {"LOCK"}</div>,
              action: (data) => {
                if (selection.length === 0) {
                  setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
                } else {
                  setDialog(true)
                  setHold(true)
                  setMode("Hold")
                }
              }

            },
            {
              label: <div style={{ fontSize: "12px" }}>
                {"UNLOCK"}</div>,
              action: (data) => {
                if (selection.length === 0) {
                  setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
                } else {
                  setDialog(true)
                  setHold(false)
                  setMode("Hold")
                }

              }
            },
            {
              label: <div style={{ fontSize: "12px" }}>
                {"REMARK"}</div>,
              action: (data) => {
                if (selection.length === 0) {
                  setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
                } else {
                  setDialog(true)
                  setRemarkMode(true)
                }

              }
            }]) : null}
      />

    </>
  );
};
export default AmStorageObjectMulti;
