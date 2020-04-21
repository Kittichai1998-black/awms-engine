import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Table from '../../components/table/AmTable'
import Pagination from '../../components/table/AmPagination';
import Clone from '../../components/function/Clone'
import _ from 'lodash';
// import { useTranslation } from 'react-i18next'
import { apicall } from '../../components/function/CoreFunction2'
import AmFilterTable from '../../components/table/AmFilterTable';
import AmButton from "../../components/AmButton";
import AmEditorTable from "../../components/table/AmEditorTable";
import AmDialogs from "../../components/AmDialogs";
const Axios = new apicall();

const AmDoneWorkQueue = (props) => {
  const {
    bodyHeadReport,
    bodyFooterReport,
    columnTable,
    dataTable,
    pageSize,
    sort,
    sortable,
    filterTable,
    primarySearch,
    extensionSearch,
    onHandleFilterConfirm,
    page,
    pages,
    exportData,
    excelFooter,
    renderCustomButton,
    totalSize,
    exportApi,
    fileNameTable
  } = props;

  const [dataSrc, setDataSrc] = useState([]);
  const [pageTb, setPageTb] = useState(0);
  const [dataExport, setDataExport] = useState([]);
  const [selection, setSelection] = useState();
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [textError, setTextError] = useState("");

  useEffect(() => {
    if (dataTable) {
      setDataSrc(dataTable)
    } else {
      setDataSrc([]);
    }
  }, [dataTable]);
  useEffect(() => {
    if (page != false)
      pages(pageTb)
  }, [pageTb])
  const comma = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const SumTables = () => {
    return columnTable.filter(row => row.Footer === true).map(row => {
      return { accessor: row.accessor, sumData: sumFooterTotal(dataSrc, row.accessor) }
    })
  }
  const sumFooterTotal = (data, value) => {
    var sumVal = _.sumBy(data, value)

    if (sumVal === 0 || sumVal === null || sumVal === undefined || isNaN(sumVal)) {
      return '-'
    } else {
      return comma(sumVal.toFixed(2))
    }
  }
  const CreateDataWithFooter = (data) => {
    if (data && data.length > 0) {
      var tempdata = Clone(data)
      var objfoot = {};
      columnTable.filter(row => row.Footer === true).forEach(row => {
        objfoot[row.accessor] = sumFooterTotal(data, row.accessor);
        objfoot["norownum"] = true;
      });
      return tempdata.concat(objfoot);
    }
    return null;
  }
  const checkStatus = (rowInfo) => {
    let classStatus = ""
    if (rowInfo && rowInfo.row) {
      classStatus = rowInfo.original.StyleStatus;
    }
    if (classStatus)
      return { className: classStatus }
    else
      return {}
  }
  const doneWorkQueue = () => {
    Axios.post(window.apipath + "/v2/ManualDoneQueueAPI", {
      waveID: 0
    }).then(res => {


      console.log(res)
    })
    return null
  }
  const onHandleDeleteConfirm = (status) => {
    if (status) {
      doneWorkQueue()
    }
    setDialogConfirm(false);
  };
  return (
    <div>
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      ></AmDialogs>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>
      <AmDialogs
        typePopup={"warning"}
        onAccept={e => {
          setOpenWarning(e);
        }}
        open={openWarning}
        content={"Please select data"}
      ></AmDialogs>
      <AmEditorTable
        open={dialogConfirm}
        onAccept={status => onHandleDeleteConfirm(status)}
        titleText={"Confirm DoneQueue"}
        columns={[]}
      />
      <div style={{ marginBottom: '10px' }}>
        {bodyHeadReport}
      </div>
      {filterTable === true ?
        <div>
          <AmFilterTable
            defaultCondition={{ "f": "status", "c": "!=", "v": "2" }}
            primarySearch={primarySearch}
            extensionSearch={extensionSearch}
            onAccept={(status, obj) => onHandleFilterConfirm(status, obj)} />
          <br />
        </div>
        : null}
      <Table
        primaryKey="ID"
        getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
        onRowClick={() => null}
        data={dataSrc}
        columns={columnTable}
        sumFooter={SumTables()}
        pageSize={pageSize}
        sort={(sorts) => sort({ field: sorts.id, order: sorts.sortDirection })}
        sortable={sortable}
        currentPage={page ? pageTb : 0}
        exportData={exportData !== undefined ? exportData : true}
        excelData={dataExport}
        onExcelFooter={excelFooter !== undefined && true ? CreateDataWithFooter : null}
        excelQueryAPI={exportApi}
        fileNameTable={fileNameTable}
        renderCustomButtonB4={renderCustomButton}
        selection={true}
        selectionType="checkbox"
        getSelection={data => {
          setSelection(data)
        }}
        renderCustomButtonBTMLeft={<AmButton
          style={{ marginRight: "5px" }}
          styleType="confirm"
          onClick={() => {
            console.log(selection)
            if (selection.length === 0) {
              setOpenWarning(true)
            } else {
              setDialogConfirm(true)
            }

          }}
        >
          DONE QUEUE
        </AmButton>}
      ></Table>
      {page ? <Pagination
        totalSize={totalSize}
        pageSize={pageSize}
        onPageChange={(pageTbs) => setPageTb(pageTbs)} /> : null}

      <div>
        {bodyFooterReport}
      </div>


    </div>

  )
}


AmDoneWorkQueue.propTypes = {
  dataTable: PropTypes.array.isRequired,
  columnTable: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  pages: PropTypes.func,
  totalSize: PropTypes.number,
  renderCustomButton: PropTypes.object,
  page: PropTypes.bool,
  bodyHeadReport: PropTypes.object,
  bodyFooterReport: PropTypes.object,
  exportData: PropTypes.bool,
  excelFooter: PropTypes.bool,
  sortable: PropTypes.bool,
  sort: PropTypes.func,
  exportApi: PropTypes.string,
  fileNameTable: PropTypes.string
}
export default AmDoneWorkQueue;