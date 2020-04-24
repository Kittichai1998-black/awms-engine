import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Table from '../../components/table/AmTable'
import Pagination from '../../components/table/AmPagination';
import Clone from '../../components/function/Clone'
import _ from 'lodash';
// import { useTranslation } from 'react-i18next'
import { apicall } from '../../components/function/CoreFunction2'
import AmFilterTable from '../../components/table/AmFilterTable';

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

  return (
    <div>
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
        //sumFooter={SumTables()}
        pageSize={pageSize}
        sort={(sorts) => sort({ field: sorts.id, order: sorts.sortDirection })}
        sortable={sortable}
        currentPage={page ? pageTb : 0}
        exportData={exportData !== undefined ? exportData : true}
        excelData={dataExport}
        //onExcelFooter={excelFooter !== undefined && true ? CreateDataWithFooter : null}
        excelQueryAPI={exportApi}
        fileNameTable={fileNameTable}
        renderCustomButtonB4={renderCustomButton}
        selection={true}
        selectionType="checkbox"
        getSelection={data => {
          setSelection(data)
          props.onSelection(data)
        }}
        renderCustomButtonBTMLeft={props.renderCustomButtonBTMLeft}
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