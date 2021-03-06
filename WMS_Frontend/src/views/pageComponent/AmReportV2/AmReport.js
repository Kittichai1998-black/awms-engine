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
import { DataGenerateURL } from "../AmReportV2/GetURL";
import AmDropdown from '../../../components/AmDropdown';
import AmDatePicker from '../../../components/AmDatePicker';
import AmButton from "../../../components/AmButton";

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

const AmReport = props => {
  const { t } = useTranslation();
  const [valueText, setValueText] = useState({});
  const [dataSource, setDataSource] = useState([])
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0)
  const [iniQuery, setIniQuery] = useState(true);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (!iniQuery)
      getData()
  }, [page])

  const getValue = (value, inputID) => {
    if (value && value.toString().includes("*")) {
      value = value.replace(/\*/g, "%");
    }
    valueText[inputID] = value;
  }
  useEffect(() => {
    getData()
  }, [pageSize])

  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
      console.log(fdata)
      if (IsEmptyObject(fdata.customFilter)) {
        getValue(fdata.value, fdata.field)
      } else {
        if (fdata.customFilter !== undefined) {
          getValue(fdata.value, fdata.customFilter.dateField)
        } else {
          getValue(fdata.value, fdata.field)
        }
      }


    });
    setPage(1)
    getData()
  }

  const getData = () => {

    var pathAPI = DataGenerateURL(valueText, props.fileNameTable, props.typeDoc)
    console.log(valueText)
    let pathGetAPI = pathAPI +
      "&page=" + (page - 1)
      + "&limit=" + pageSize
    Axios.get(pathGetAPI).then((res) => {
      if (res) {
        if (res.data._result.status !== 0) {
          setDataSource(res.data.datas)
          setCount(res.data.counts,res.data.datas[0] ? res.data.datas[0].totalRecord : 0)
        }
      }
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
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "ID" : filterConfig.fieldDataKey}
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
            col.width = 200;
            col.Filter = (field, onChangeFilter) => {
              return <div>
                <AmDatePicker
                  defaultValue={true}
                  onDefaultSet={(e) => {
                    if (e !== undefined && e !== null)
                      onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "fromDate" })
                  }}
                  style={{ display: "inline-block" }}
                  onChange={(ele) => { }}
                  TypeDate={"date"}
                  fieldID="fromDate"
                  onBlur={(e) => {
                    if (e !== undefined && e !== null)
                      onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "fromDate" })
                  }}
                />
                <AmDatePicker
                  onDefaultSet={(e) => {
                    if (e !== undefined && e !== null)
                      onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "fromDate" })
                  }} defaultValue={true} style={{ display: "inline-block" }} onChange={(ele) => { }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "toDate" }) }} TypeDate={"date"} fieldID="toDate" />
              </div>
            }
          }
        }
      })
      setColumns(iniCols);
    }, [])

    return { columns };
  }
  const { columns } = useColumns(props.columnTable);

  const checkStatusColor = (rowInfo) => {
    if (rowInfo.isHead) {
      return { backgroundColor: "#E0E0E0" }
    }

  }
  //===========================================================
  return (
    <>
      {console.log(dataSource)}
      <AmTable
        columns={columns}
        dataKey={props.tableKey}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        tableConfig={true}
        pageSize={100}
        cellStyle={(accessor, cellData, dataSource) => { return checkStatusColor(dataSource) }}
        onPageSizeChange={(pg) => { setPageSize(pg) }}
        filterable={true}
        filterData={res => { onChangeFilterData(res) }}
        pagination={true}
        onPageChange={p => {
          if (page !== p)
            setPage(p)
          else
            setIniQuery(false)
        }}
        groupBy={props.groupBy === true ? {
          "field": ["Code", "Lot", "unitType"],
          "sumField": ["qty", "qty_avt0", "qty_avt1", "qty_avt2", "qty_avt9",
            "qty_evt10", "qty_evt11", "qty_evt12", "qty_evt13", "qty_evt14",
            "qty_evt15", "qty_evt16", "qty_evt33", "qty_evt34",]
        } : null}
      />

    </>
  );
};
export default AmReport;
