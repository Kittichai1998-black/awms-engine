import React, { useState, useEffect } from "react";

import AmDialogs from "../../components/AmDialogs";
import AmDropdown from "../../components/AmDropdown";
import AmInput from "../../components/AmInput";
import AmMultiDropdown from "../../components/AmMultiDropdown";
import { AmTable, AmPagination, AmFilterTable } from "../../components/table";
import AmEditorTable from "../../components/table/AmEditorTable";
//import Axios from "axios";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
import AmButton from "../../components/AmButton";
import AmDatePicker from "../../components/AmDate";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import queryString from "query-string";
// const createQueryString = select => {
//   let queryS =
//     select.queryString +
//     (select.t === "" ? "?" : "?t=" + select.t) +
//     (select.q === "" ? "" : "&q=" + select.q) +
//     (select.f === "" ? "" : "&f=" + select.f) +
//     (select.g === "" ? "" : "&g=" + select.g) +
//     (select.s === "" ? "" : "&s=" + select.s) +
//     (select.sk === "" ? "" : "&sk=" + select.sk) +
//     (select.l === 0 ? "" : "&l=" + select.l) +
//     (select.all === "" ? "" : "&all=" + select.all) +
//     "&isCounts=true" +
//     "&apikey=free01";
//   return queryS;
// };
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
const AmDocumentSearch = props => {
  const { t } = useTranslation();
  const query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "Document",
    q: '[{ "f": "DocumentType_ID", "c":"=", "v": "' + props.docTypeCode + '"}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 20,
    all: ""
  };

  const createComponent = searchList => {
    return searchList.map((row, idx) => {
      if (row.searchType === "input") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "0px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmInput
                  placeholder={row.placeholder}
                  style={{ width: "200px" }}
                  onChange={value => {
                    onChangeFilter(condition, rowC.field, value);
                  }}
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
                <label style={{ padding: "0 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmDropdown
                  width="200px"
                  zIndex={1000}
                  placeholder={row.placeholder}
                  data={row.dropdownData}
                  fieldDataKey={row.dropdownKey}
                  fieldLabel={row.dropdownLabel}
                  ddlType="normal"
                  onChange={value =>
                    onChangeFilter(condition, rowC.field, value)
                  }
                />
              </div>
            );
          }
        };
      } else if (row.searchType === "multipledropdown") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "150px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmMultiDropdown
                  width="200px"
                  placeholder={row.placeholder}
                  data={row.dropdownData}
                  fieldDataKey={row.dropdownKey}
                  fieldLabel={row.dropdownLabel}
                  ddlMinWidth="250px"
                  onChange={value =>
                    onChangeFilter(condition, rowC.field, value)
                  }
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
                  width="200px"
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

  async function getData(qryString) {
    const res = await Axios.get(createQueryString(qryString)).then(res => res);
    setDataSource(res.data.datas);
    setTotalSize(res.data.counts);
  }

  const [dataSource, setDataSource] = useState([]);
  const [filterData, setFilterData] = useState([
    { f: "DocumentType_ID", c: "=", v: props.docTypeCode }
  ]);
  const [sort, setSort] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [page, setPage] = useState();
  const [selection, setSelection] = useState();
  const [datetime, setDatetime] = useState({});
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [resetPage, setResetPage] = useState(false);
  const [textError, setTextError] = useState("");

  const [dialog, setDialog] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [dataSentToAPI, setDataSentToAPI] = useState([]);
  const [remark, setRemark] = useState("");
  const [text, setText] = useState([]);

  useEffect(() => {
    getData(query);
  }, []);

  useEffect(() => {
    if (resetPage === true) {
      setResetPage(false);
    }
  }, [resetPage]);

  useEffect(() => {
    if (typeof page === "number") {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
      getData(queryEdit);
    }
  }, [page]);

  useEffect(() => {
    if (sort) {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      getData(queryEdit);
    }
  }, [sort]);

  const onHandleFilterConfirm = (status, obj) => {
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
    query.q = JSON.stringify(filterDatas);
    getData(query);

    //setFilterData([{ "f": "DocumentType_ID", "c":"=", "v": props.docTypeCode}])
  };

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

  const onChangeFilter = (condition, field, value) => {
    let obj;
    if (filterData.length > 0) {
      obj = [...filterData];
    } else {
      obj = [condition];
    }
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
      let createObj = {};
      if (typeof value === "object" && value !== null) {
        createObj.f = field;
        createObj.v = value.join(",");
        createObj.c = "in";
        obj.push(createObj);
      } else {
        if (value) {
          createObj.f = field;
          createObj.v = value + "%";
          createObj.c = "like";
          obj.push(createObj);
        } else {
          let idx = obj.findIndex(x => x.f === field);
          obj.splice(idx, 1);
        }
      }
    }
    setFilterData(obj);
  };

  // add by ple
  async function onClickWorking() {
    let docID = [];
    if (selection.length > 0) {
      selection.forEach(rowdata => {
        docID.push(rowdata.ID);
      });
    }

    if (props.docTypeCode === "1002") {
      Axios.post(window.apipath + "/v2/WorkingGIDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    } else if (props.docTypeCode === "1012") {
      Axios.post(window.apipath + "/v2/WorkingLDDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    } else if (props.docTypeCode === "1001") {
      Axios.post(window.apipath + "/v2/WorkingGRDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    }
  }
  //============================================
  async function onClickReject() {
    let docID = [];
    if (selection.length > 0) {
      selection.forEach(rowdata => {
        docID.push(rowdata.ID);
      });
    }

    if (props.docTypeCode === "1001") {
      if (props.projectCustom === "MRK") {
        Axios.post(window.apipath + "/v2/MRKRejectedGRDocAPI", {
          docIDs: docID,
          remark: remark
        }).then(res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setOpenSuccess(true);
              getData(query);
              setPage(0);
              setResetPage(true);
              Clear();
            } else {
              setOpenError(true);
              setTextError(res.data._result.message);
              getData(query);
              setPage(0);
              setResetPage(true);
              Clear();
            }
          }
        });
      } else {
        Axios.post(window.apipath + "/v2/RejectedGRDocAPI", {
          docIDs: docID,
          remark: remark
        }).then(res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setOpenSuccess(true);
              getData(query);
              setPage(0);
              setResetPage(true);
              Clear();
            } else {
              setOpenError(true);
              setTextError(res.data._result.message);
              getData(query);
              setPage(0);
              setResetPage(true);
              Clear();
            }
          }
        });
      }
    } else if (props.docTypeCode === "1002") {
      Axios.post(window.apipath + "/v2/RejectedGIDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    } else if (props.docTypeCode === "2004") {
      Axios.post(window.apipath + "/v2/RejectedADDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    } else if (props.docTypeCode === "1012") {
      Axios.post(window.apipath + "/v2/RejectedLDDocAPI", {
        docIDs: docID,
        remark: remark
      }).then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            setPage(0);
            setResetPage(true);
            Clear();
          }
        }
      });
    }
  }

  //========================================================================
  const FuncRanderRemark = () => {
    const columns = [
      {
        field: "Option",
        type: "input",
        name: "Remark",
        placeholder: "Remark",
        required: true
      }
    ];
    const x = columns;
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
  };
  //========================================================================
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
  //=======================================================================
  const onHandleEditConfirm = (status, type) => {
    if (status) {
      onClickReject();
      //UpdateData();
    }

    setDialog(false);
    setSelection([]);
  };
  //======================================================================
  const onChangeEditor = (field, rowdata, value, type, inputType) => {
    console.log(value);
    if (selection.length === 0) {
      setOpenWarning(true);
    } else {
      let cloneData = selection;
      console.log(selection);
      setRemark(value);
      setDataSentToAPI(cloneData);
    }
  };
  //========================================================================
  const onClickClose = () => {
    let docID = [];
    if (selection.length > 0) {
      selection.forEach(rowdata => {
        docID.push(rowdata.ID);
      });
    }

    if (props.docTypeCode === "1001" || props.docTypeCode === "1002") {
      Axios.post(window.apipath + "/v2/CloseDocAPI", {
        docIDs: docID
      }).then(res => {
        console.log(res);
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData(query);
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData(query);
            Clear();
          }
        }
      });
    }
  };
  const Clear = () => {
    setSelection([]);
    setRemark("");
  };

  // end add by ple
  return (
    <div>
      {/*  add by ple */}
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status)}
        titleText={"Remark"}
        data={text}
        columns={FuncRanderRemark()}
      />
      <AmDialogs
        typePopup={"warning"}
        onAccept={e => {
          setOpenWarning(e);
        }}
        open={openWarning}
        content={"Please Select Data"}
      />
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      />
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      />
      {/* end add by ple */}
      <AmFilterTable
        defaultCondition={{
          f: "DocumentType_ID",
          c: "=",
          v: props.docTypeCode
        }}
        primarySearch={createComponent(props.primarySearch)}
        extensionSearch={createComponent(props.expensionSearch)}
        onAccept={(status, obj) => onHandleFilterConfirm(true)}
      />
      <br />
      <br />
      <AmTable
        primaryKey="ID"
        data={dataSource}
        columns={props.columns}
        sortable={true}
        sort={sort => setSort({ field: sort.id, order: sort.sortDirection })}
        selection={true}
        selectionType="checkbox"
        getSelection={data => setSelection(data)}
        style={{ maxHeight: "500px" }}
        currentPage={page}
        pageSize={20}
      />
      <div>
        <div
          style={{ display: "inline-flex", float: "left", paddingTop: "10px" }}
        >
          {props.buttonClose === true ? (
            <AmButton
              onClick={() => {
                onClickClose();
              }}
              style={{ marginRight: "5px" }}
              styleType="confirm"
            >
              {t("Close")}
            </AmButton>
          ) : (
            ""
          )}
          {props.buttonReject === true ? (
            <AmButton
              onClick={() => {
                onClickReject();
                //FuncRanderRemark();
                //setDialog(true);
              }}
              style={{ marginRight: "5px" }}
              styleType="delete"
            >
              {t("Reject")}
            </AmButton>
          ) : (
            ""
          )}
          {props.buttonWorking === true ? (
            <AmButton
              onClick={() => {
                onClickWorking();
                //FuncRanderRemark();
                //setDialog(true);
              }}
              styleType="warning"
            >
              {t("Working")}
            </AmButton>
          ) : (
            ""
          )}
        </div>
        <AmPagination
          //จำนวนข้อมูลทั้งหมด
          totalSize={totalSize}
          resetPage={resetPage}
          //จำนวนข้อมูลต่อ หน้า
          pageSize={20}
          //return หน้าที่ถูกกด : function
          onPageChange={page => setPage(page)}
        />
      </div>
      {props.renderActionButton ? props.renderActionButton(selection) : null}
    </div>
  );
};

export default AmDocumentSearch;
