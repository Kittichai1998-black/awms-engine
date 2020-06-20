import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmTable from "../../../components/AmTable/AmTable";
import { DataGenerateMulti } from "../AmStorageObjectV2/SetMulti";
import { QueryGenerate } from '../../../components/function/UtilFunction';
import AmButton from "../../../components/AmButton";

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

  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)
  const [queryViewData, setQueryViewData] = useState();
  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (typeof (page) === "number" && !iniQuery) {
      const queryEdit = JSON.parse(JSON.stringify(queryViewData));
      queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
      getData(queryEdit)
    }
  }, [page])

  function getData(data) {
    const Query = {
      queryString: window.apipath + "/v2/SelectDataViwAPI/",
      t: "r_StorageObject",
      q: '[{ "f": "Status", "c":"!=", "v": 0}]',
      f: "*",
      g: "",
      s: "[{'f':'Pallet','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    setQueryViewData(Query)
    var queryStr = createQueryString(data != undefined ? data : Query)
    Axios.get(queryStr).then(res => {

      var respone = DataGenerateMulti(res.data.datas)
      setDataSource(respone)
      setCount(res.data.counts)
    });
  }
  const onChangeFilterData = (filterValue) => {
    var res = queryViewData;
    filterValue.forEach(fdata => {
      res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
    });
    getData(res)

  }

  //===========================================================
  return (
    <div>
      <AmTable
        columns={props.iniCols}
        dataKey={"ID"}
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
export default AmStorageObjectMulti;
