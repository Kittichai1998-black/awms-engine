import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall, createQueryString } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
import { useTranslation } from 'react-i18next'
import AmEntityStatus from "../../../components/AmEntityStatus";
import queryString from "query-string";
import AmWorkQueueStatus from "../../../components/AmWorkQueueStatus";
import AmRedirectLogSto from "../../../components/AmRedirectLogSto";
import AmRediRectInfo from '../../../components/AmRedirectInfo'
import AmRedirectLogWQ from '../../../components/AmRedirectLogWQ'

const Axios = new apicall();

const styles = theme => ({
  root: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

const FormInline = styled.div`

display: inline-flex;
flex-flow: row wrap;
align-items: center;
margin-right: 20px;

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


const WorkQueue = (props) => {
  const { t } = useTranslation()
  const { classes } = props;
  const pageSize = 100;

  const queryData = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "WorkQueue",
    q: '',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const [query, setQuery] = useState(queryData);

  const [datavalue, setDataValue] = useState([]);
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [sort, setSort] = useState(0);

  useEffect(() => {
    onGetData()
  }, [page])



  const onGetData = () => {

    Axios.get(createQueryString(query)).then((rowselect1) => {
      if (rowselect1) {
        if (rowselect1.data._result.status !== 0) {
          setDataValue(rowselect1.data.datas)
          setTotalSize(rowselect1.data.counts)
        }
      }
    });
  }
  useEffect(() => {
    console.log(sort)

    if (sort !== 0) {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      setQuery(queryEdit)
    }
  }, [sort])
  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px",
          direction: "rtl"
        }}
      >

        <AmRedirectLogSto
          api={
            "/log/storageobjectlog?id=" +
            data.StorageObject_ID +
            "&ParentStorageObject_ID=" +
            data.StorageObject_ID
          }
        />
        <AmRedirectLogWQ api={"/log/workqueuelog?id=" + data.ID} />
      </div>
    );
  };
  const columns = [
    {
      Header: "Status",
      accessor: "EventStatus",
      Cell: (data) => {
        return <div style={{ textAlign: "center" }}><AmWorkQueueStatus statusCode={data.original.EventStatus} /></div>
      },
      width: 70
    },
    { Header: "IOType", accessor: "IOType", width: 70 },
    { Header: "RefID", accessor: "RefID", width: 130 },
    { Header: "Pallet No.", accessor: "StorageObject_Code", width: 100 },
    { Header: "Pack", accessor: "Pack_Name", width: 300 },
    { Header: "Sou.Warehouse", accessor: "Sou_Warehouse_Name", width: 100 },
    { Header: "Sou.Area", accessor: "Sou_Area", width: 100 },
    { Header: "Des.Warehouse", accessor: "Des_Warehouse_Name", width: 100 },
    { Header: "Des.Area", accessor: "Des_Area", width: 100 },
    { Header: "Cur.Warehouse", accessor: "Warehouse_Name", width: 100 },
    { Header: "Cur.Area", accessor: "Area", width: 100 },

    {
      Header: "Create By",
      accessor: "UserName",
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime"
    },
    {
      Header: "Log",
      width: 60,
      sortable: false,
      Cell: e => getRedirectLog(e.original)
    }
  ]

  const customBtnSelect = () => {
    return <AmButton styleType="confirm" onClick={onGetData} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
  }
  return (
    <div className={classes.root}>
      <AmReport
        // bodyHeadReport={GetBodyReports()}
        sortable={true}
        sort={(sort) => setSort({ field: sort.id, order: sort.sortDirection })}
        columnTable={columns}
        dataTable={datavalue}
        pageSize={pageSize}
        pages={(x) => setPage(x)}
        totalSize={totalSize}
        renderCustomButton={customBtnSelect()}
        page={true}
        exportApi={createQueryString(query)}
        excelFooter={false}
        fileNameTable={"WorkQueue"}
      ></AmReport>
    </div>
  )

}

export default withStyles(styles)(WorkQueue);
