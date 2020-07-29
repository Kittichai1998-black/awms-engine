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

const AmReport = props => {
  const { t } = useTranslation();
  const [valueText, setValueText] = useState({});
  const [dataSource, setDataSource] = useState([])
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0)
  const [iniQuery, setIniQuery] = useState(true);
  //const [queryViewData, setQueryViewData] = useState(onGetALL());
  const onGetALL = () => {
    return window.apipath + "/v2/GetSPReportAPI?"
      // + "&packCode=" + (valueText.packCode === undefined || valueText.packCode === null ? '' : encodeURIComponent(valueText.packCode.trim()))
      // + "&packName=" + (valueText.packName === undefined || valueText.packName === null ? '' : encodeURIComponent(valueText.packName.trim()))
      // + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
      // + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
      // + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))

      + "&spname=CURRENTINV_STOSUM";
  }
  // useEffect(() => {
  //   if (typeof (page) === "number" && !iniQuery) {
  //     const queryEdit = JSON.parse(JSON.stringify(queryViewData));
  //     queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
  //     getData(queryEdit)
  //   }
  // }, [page])
  useEffect(() => {
    getData()
  }, [])
  const getData = (data) => {

    //var pathGetAPI = DataGenerateURL(data, props.fileNameTable)
    // let pathGetAPI = onGetALL() +
    //   "&page=" + (page === undefined || null ? 0 : page)
    //   + "&limit=" + (count === undefined || null ? 100 : count);
    let pathGetAPI = onGetALL()
    Axios.get(pathGetAPI).then((res) => {
      if (res) {
        if (res.data._result.status !== 0) {
          console.log(res.data.datas)
          // setDataSource(res.data.datas)
          // setCount(res.data.counts)
        }
      }
    });
  }
  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
      console.log(fdata)
      getData(fdata)
      // if (fdata.customFilter !== undefined) {
      //   if (IsEmptyObject(fdata.customFilter)) {
      //     res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
      //   } else {
      //     res = QueryGenerate({ ...queryViewData }, fdata.customFilter.field, (fdata.customFilter.dateField === "dateTo" ? fdata.value + "T23:59:59" : fdata.value), fdata.customFilter.dataType, fdata.customFilter.dateField)
      //   }
      // } else {
      //   res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
      // }

    });
    // if (!IsEmptyObject(res))
    //   setQueryViewData(res)

  }
  //===========================================================
  return (
    <div>

      <AmTable
        columns={props.columnTable}
        dataKey={"Code"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={100}
        filterable={true}
        filterData={res => { onChangeFilterData(res) }}
      //pagination={true}

      />

    </div>
  );
};
export default AmReport;
