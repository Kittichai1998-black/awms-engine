import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString,
  IsEmptyObject
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

const AmSearchDocumentV2 = props => {
  const { t } = useTranslation();
  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);
  const [selection, setSelection] = useState();
  const [dialog, setDialog] = useState(false);
  const [dialogState, setDialogState] = useState({});
  const [remark, setRemark] = useState("");
  const [pageSize, setPageSize] = useState(50);

  const [reset, setReset] = useState(false)
  const QueryCustom = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "Document",
    q: '[{ "f": "DocumentType_ID", "c":"=", "v": "' + props.docTypeCode + '"},{ "f": "ProductOwner_ID", "c":"in", "v": "' + localStorage.getItem("User_ProductOwner") + '"}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: pageSize,
    all: ""
  };
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "Document",
    q: '[{ "f": "DocumentType_ID", "c":"=", "v": "' + props.docTypeCode + '"}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: pageSize,
    all: ""
  };
  //const [queryViewData, setQueryViewData] = useState(Query);
  const [queryViewData, setQueryViewData] = useState(props.actionQueryCustom === true ? QueryCustom : Query);
  useEffect(() => {
    if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
      getData(queryViewData)

  }, [queryViewData])

  useEffect(() => {
    return () => { setReset(false) }
  }, [reset]);

  useEffect(() => {
    if (typeof (page) === "number" && !iniQuery) {
      const queryEdit = JSON.parse(JSON.stringify(queryViewData));
      queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
      getData(queryEdit)
    }
  }, [page])

  function getData(data) {
    var queryStr = createQueryString(data)
    Axios.get(queryStr).then(res => {
      setDataSource(res.data.datas)
      setCount(res.data.counts)
    });
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
                  zIndex={1000}
                  data={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                />
              }
              else {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "Name" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                  ddlMinWidth={200}
                  zIndex={1000}
                  queryApi={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                  ddlType={filterConfig.typeDropDown}
                />
              }

            }
          } else if (filterConfig.filterType === "datetime") {
            col.width = 425;
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

  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
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

    //getData(res)

  }
  const generateClose = () => {
    if (props.buttonClose) {
      return <AmButton
        style={{ marginRight: "5px" }}
        styleType="confirm"
        onClick={() => {
          if (selection.length === 0) {
            setDialogState({ type: "warning", content: "????????????????????????????????????????????????", state: true })
          } else
            onUpdateStatus()
        }}
      >
        CLOSE
     </AmButton>
    } else { return null; }
  }

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
      setDialogState({ type: "warning", content: "????????????????????????????????????????????????", state: true })
    } else {
      setRemark(value);
    }
  };
  const onHandleEditConfirm = (status) => {
    if (status) {
      onUpdateStatus("reject")
      setReset(true)
    }

    setDialog(false);
    setSelection([]);
  };
  const onUpdateStatus = (type) => {
    let docID = [];
    if (selection.length > 0) {
      selection.forEach(rowdata => {
        docID.push(rowdata.ID);
      });
    }
    Axios.post(window.apipath + (type === "reject" ? props.apiReject : props.apiClose), {
      docIDs: docID,
      remark: remark
    }).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setDialogState({ type: "success", content: "Success", state: true })

          if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
            getData(queryViewData)

          Clear();
        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
          if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
            getData(queryViewData)

          Clear();
        }
      }
    });

  }
  const Clear = () => {
    setSelection([]);
    setRemark("");
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
        filterable={true}
        clearSelectionAction={reset}
        filterData={res => { onChangeFilterData(res) }}
        pagination={true}
        selection={"checkbox"}
        selectionData={(data) => {
          setSelection(data);
        }}
        onPageChange={p => {
          if (page !== p)
            setPage(p)
          else
            setIniQuery(false)
        }}
        onPageSizeChange={(pageSize) => setPageSize(pageSize)}
        //customTopLeftControl={<div>{generateClose()}{generateReject()}</div>}
        tableConfig={true}
        customAction={[{
          label: <div style={{ fontSize: "12px" }}>
            {"REJECT"}</div>,
          action: (data) => {
            if (selection.length === 0) {
              setDialogState({ type: "warning", content: "????????????????????????????????????????????????", state: true })
            } else {

              setDialog(true)

            }

          }
        }, {
          label: <div style={{ fontSize: "12px" }}>
            {"CLOSE"}</div>,
          action: (data) => {
            if (selection.length === 0) {
              setDialogState({ type: "warning", content: "????????????????????????????????????????????????", state: true })
            } else {
              onUpdateStatus()
            }

          }
        }]}
      />

    </>
  );
};
export default AmSearchDocumentV2;
