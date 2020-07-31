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

  useEffect(() => {
    getData(props.inc)
  }, [page])

  const getValue = (value, inputID) => {
    if (value && value.toString().includes("*")) {
      value = value.replace(/\*/g, "%");
    }
    valueText[inputID] = value;
  }
  // const onHandleChangeInput = (value, inputID) => {
  //   getValue(value, inputID);
  // };

  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
      console.log(fdata)
      getValue(fdata.value, fdata.field)
      setPage(1)
      getData()

    });
  }

  const getData = (data) => {
    console.log(count)
    console.log(page)
    // console.log(data)
    // if (data !== undefined) {
    //   var pathAPI = props.inc
    // } else {
    //   var pathAPI = DataGenerateURL(valueText, props.fileNameTable)
    // }
    var pathAPI = DataGenerateURL(valueText, props.fileNameTable)
    console.log(pathAPI)
    // let pathGetAPI = pathAPI +
    //   "&page=0"
    //   + "&limit=100";
    //console.log(pathGetAPI)
    let pathGetAPI = pathAPI +
      "&page=" + (page - 1)
      + "&limit=100" //+ (count === 0 || count === undefined ? 100 : count);
    // let pathGetAPI = onGetALL()

    Axios.get(pathGetAPI).then((res) => {
      if (res) {
        if (res.data._result.status !== 0) {

          setDataSource(res.data.datas)
          setCount(res.data.datas[0] ? res.data.datas[0].totalRecord : 0)
        }
      }
    });
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
        pagination={true}
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
export default AmReport;
