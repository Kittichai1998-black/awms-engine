import React, { useState, useEffect, useContext } from "react";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";

import AmTable from "../../../components/AmTable/AmTable";

import styled from "styled-components";
import AmInput from "../../../components/AmInput";
import Link from "@material-ui/core/Link";
const Axios = new apicall();

//======================================================================
const LabelH = styled.label`
  font-weight: bold;
  width: 100px;
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


const DevInfo = props => {
  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)
  const iniCols = [
    { Header: "key", accessor: "key", width: 100 },
    { Header: "val", accessor: "val", width: 300 },
    { Header: "link", accessor: "link", width: 500, Cell: e => getLink(e.original.link) },
  ]
  useEffect(() => {
    getData();
  }, []);

  function getData(data) {

    Axios.get(
      window.apipath +
      "/v2/dev_info?menu=link"
    ).then(res => {
      setDataSource(res.data.rows)
      setCount(res.data.rows.length)
    });

  }
  const getLink = link => {
    console.log(link)

    return < Link
      component="button"
      variant="body2"
      onClick={() => {
        // PageDetail();
        window.open(window.apipath + '/v2' + link);
      }}
    >
      {link}
    </Link >
  };
  return (
    <div>
      <FormInline>
        {" "}
        <LabelH>{"Find"} : </LabelH>
        <InputDiv>
          <AmInput
            id={"ID"}
            style={{ width: "200px", margin: "0px" }}
            type="input"
            onKeyPress={(value, obj, element, event) => {
              if (event.key === "Enter") {
                console.log(value)
              }
            }}
          />
        </InputDiv>
      </FormInline>
      <br />
      <AmTable
        columns={iniCols}
        dataKey={"key"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={100}


      />
    </div>
  )
};

export default DevInfo;
