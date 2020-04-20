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
import LabelT from '../../components/AmLabelMultiLanguage'

const Axios = new apicall();
const LabelH = {
  "font-weight": "bold",
  width: "200px"
}


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
const AmDoneWorkQueue = props => {
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

  const onHandleChangeKeyEnter = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      onHandleFilterConfirm(true);
      getData(query);
    }
  };
  const createComponent = searchList => {
    return searchList.map((row, idx) => {
      if (row.searchType === "input") {
        return {
          field: row.field,
          component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label
                  style={{
                    padding: "0px 0 0 20px",
                    paddingTop: "10px",
                    width: "150px"
                  }}
                >
                  {t(row.label)} :{" "}
                </label>
                <AmInput
                  placeholder={row.placeholder}
                  style={{ width: "200px" }}
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
                <label
                  style={{
                    padding: "0 0 0 20px",
                    width: "150px",
                    paddingTop: "10px"
                  }}
                >
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
                <label style={{ padding: "10px 0 0 20px", width: "200px" }}>
                  {t(row.label)} :{" "}
                </label>
                <AmMultiDropdown
                  width="200px"
                  placeholder={row.placeholder}
                  data={row.dropdownData}
                  fieldDataKey={row.dropdownKey}
                  fieldLabel={row.dropdownLabel}
                  ddlMinWidth="150px"
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
                  //style={{ width: "200px" }}
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

  async function getData() {

    const res = await Axios.get(
      window.apipath +
      "/v2/GetSPReportAPI?" +
      "&IOType=0" +
      "&spname=DONE_WORKQUEUE"
    ).then(res => res);
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

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (resetPage === true) {
      setResetPage(false);
    }
  }, [resetPage]);

  useEffect(() => {
    if (typeof page === "number") {
      onHandleFilterConfirm();
      // const queryEdit = JSON.parse(JSON.stringify(query));
      // queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
      // getData(queryEdit);
      getData();
    }
  }, [page]);


  const onHandleFilterConfirm = () => {
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

  //========================================================================

  const Clear = () => {
    setSelection([]);
  };
  // end add by ple
  return (
    <div>
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
      <AmFilterTable
        defaultCondition={{
          f: "DocumentType_ID",
          c: "=",
          v: props.docTypeCode
        }}
        primarySearch={createComponent(props.primarySearch)}
        extensionSearch={createComponent(props.expensionSearch)}
        onAccept={(status, obj) => {
          onHandleFilterConfirm(true);
          getData(query);
        }}
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
        renderCustomButtonB4={<div> {props.customButton} </div>}
        pageSize={20}
      />
      <div>
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
    </div >
  );
};

export default AmDoneWorkQueue;
