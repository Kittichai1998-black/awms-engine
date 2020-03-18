import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
import {
  AmTable,
  AmFilterTable,
  AmPagination
} from "../../../components/table";
import AmInput from "../../../components/AmInput";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Pagination from "../../../components/table/AmPagination";
import AmDialogs from "../../../components/AmDialogs";
const Axios = new apicall();

//======================================================================
const FormInline = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  margin-right: 20px;
  padding-bottom: 10px;
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
const LabelH = styled.label`
  // font-weight: bold;
  width: 100px;
`;
const SearchLog = props => {
  useEffect(() => {
    if (resetPage === true) {
      setResetPage(false);
    }
  }, [resetPage]);

  const { t } = useTranslation();
  const [page, setPage] = useState();
  const [totalSize, setTotalSize] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [resetPage, setResetPage] = useState(false);
  const [valueText, setValueText] = useState("");
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const getData = () => {
    Axios.get(
      window.apipath +
        "/v2/GetSPReportAPI?" +
        "&LogRefID=" +
        valueText +
        "&spname=LOG_SEARCH"
    ).then(res => {
      console.log(res);
      if (res) {
        if (res.data._result.status !== 0) {
          setTotalSize(res.data.datas.length);
          setDataSource(res.data.datas);
          setPage(0);
          setResetPage(true);
          setValueText("");
        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
          setValueText("");
        }
      }
    });
  };
  const columns = [
    {
      Header: "LogRefID",
      accessor: "LogRefID",
      width: 100
    },
    {
      Header: "Service Name",
      accessor: "APIService_Name",
      width: 170
    },
    {
      Header: "Doc Code",
      accessor: "Code",
      width: 120
    },
    {
      Header: "Doc Type",
      accessor: "DocumentType_ID",
      width: 70
    },
    {
      Header: "Doc Event",
      accessor: "DocEventStatus",
      width: 100
    },
    {
      Header: "Doc Status",
      accessor: "DocStatus",
      width: 80
    },

    {
      Header: "SKUCode",
      accessor: "SKUMaster_Code",
      width: 100
    },
    {
      Header: "Docitem Qty",
      accessor: "Quantity",
      width: 100
    },
    {
      Header: "Unit",
      accessor: "UnitType_Code",
      width: 100
    },
    {
      Header: "DocItem Event",
      accessor: "DocItemEventStatus",
      width: 100
    },
    {
      Header: "DocItem Status",
      accessor: "DocItemStatus",
      width: 100
    },

    {
      Header: "Sto Code",
      accessor: "StoCode",
      width: 150
    },
    {
      Header: "Disto Qty",
      accessor: "DistoQty",
      width: 100
    },
    {
      Header: "Disto Status",
      accessor: "DistoStatus",
      width: 100
    },
    {
      Header: "Area Code",
      accessor: "AreaMaster_Code",
      width: 100
    },
    {
      Header: "AreaLocation",
      accessor: "AreaLocationMaster_Code",
      width: 100
    },
    {
      Header: "Parent Sto",
      accessor: "ParentStorage",
      width: 100
    },
    {
      Header: "Sto Qty",
      accessor: "StoQty",
      width: 100
    },
    {
      Header: "Sto Unit",
      accessor: "StoUnit",
      width: 100
    },
    {
      Header: "Sto Event",
      accessor: "StoEvent",
      width: 100
    },
    {
      Header: "Sto Status",
      accessor: "StoStatus",
      width: 100
    },
    {
      Header: "WQ ID",
      accessor: "WorkQueue_ID",
      width: 100
    },
    {
      Header: "WQ Event",
      accessor: "WQEvent",
      width: 100
    },
    {
      Header: "WQ Status",
      accessor: "WQStatus",
      width: 100
    },
    {
      Header: "Lot",
      accessor: "Lot",
      width: 100
    },
    {
      Header: "Batch",
      accessor: "Batch",
      width: 100
    },
    {
      Header: "Result",
      accessor: "ResultMessage",
      width: 100
    },
    {
      Header: "ActionBy",
      accessor: "ActionBy",
      width: 100
    },
    {
      Header: "Start Time",
      accessor: "StartTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "End Time",
      accessor: "EndTime",
      width: 150,
      type: "datetime"
    }
  ];

  const onHandleChangeKeyEnter = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      getData();
    }
  };
  const onChangeFilter = value => {
    setValueText(value);
  };
  return (
    <div>
      {" "}
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      />
      <FormInline>
        <LabelH>{"Log Ref ID"}</LabelH>
        <AmInput
          placeholder={"Log Ref ID"}
          style={{ width: "200px" }}
          value={valueText}
          onChangeV2={ele => {
            onChangeFilter(ele);
          }}
          onKeyPress={(value, obj, element, event) =>
            onHandleChangeKeyEnter(value, null, "LogRefID", null, event)
          }
        />
      </FormInline>
      <AmTable
        data={dataSource}
        columns={columns}
        sortable={false}
        pageSize={100}
        currentPage={page}
        primaryKey="ID"
      />
      <Pagination
        totalSize={totalSize}
        pageSize={100}
        resetPage={resetPage}
        onPageChange={page => setPage(page)}
      />
    </div>
  );
};

export default SearchLog;
