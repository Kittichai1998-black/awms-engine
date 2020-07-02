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
import AmDatePicker from '../../../components/AmDate';
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

  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "Document",
    q: '[{ "f": "DocumentType_ID", "c":"=", "v": "' + props.docTypeCode + '"}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 20,
    all: ""
  };

  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)
  const [queryViewData, setQueryViewData] = useState(Query);
  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);
  const [selection, setSelection] = useState();
  const [dialog, setDialog] = useState(false);
  const [dialogState, setDialogState] = useState({});

  useEffect(() => {
    if(!IsEmptyObject(queryViewData) && queryViewData !== undefined)
      getData(queryViewData)

  }, [queryViewData])

  // useEffect(() => {
  //   if (typeof (page) === "number" && !iniQuery) {
  //     const queryEdit = JSON.parse(JSON.stringify(queryViewData));
  //     queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
  //     getData(queryEdit)
  //   }
  // }, [page])

  function getData(data) {
    var queryStr = createQueryString(data)
    //console.log(queryStr)
    Axios.get(queryStr).then(res => {
      console.log(res.data.datas)
      // var respone = DataGenerateMulti(res.data.datas)
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
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
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
            col.width = 350;
            col.Filter = (field, onChangeFilter) => {
              return <FormInline>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "datetime", dateField: "dateFrom" }) }} TypeDate={"date"} fieldID="dateFrom" />
                <label>-</label>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "datetime", dateField: "dateTo" }) }} TypeDate={"date"} fieldID="dateTo" />
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
    console.log(queryViewData)
    console.log("filterValue")
    var res = {};
    filterValue.forEach(fdata => {
      console.log(fdata)
      if (fdata.customFilter !== undefined) {
        res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField)
        console.log(res)
      } else
        res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
    });

    if(!IsEmptyObject(res))
      setQueryViewData(res)
    //getData(res)

  }

  //===========================================================
  return (
    <div>
      {/* <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} /> */}

      <AmTable
        columns={columns}
        dataKey={"ID"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={100}
        filterable={true}
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

      />

    </div>
  );
};
export default AmSearchDocumentV2;
