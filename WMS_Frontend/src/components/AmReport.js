import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Table from '../components/table/AmTable'
import Pagination from '../components/table/AmPagination';
import Clone from '../components/function/Clone'
import _ from 'lodash';
// import { useTranslation } from 'react-i18next'
import { apicall } from '../components/function/CoreFunction2'
const Axios = new apicall();

const AmReport = (props) => {
    const {
        bodyHeadReport,
        bodyFooterReport,
        columnTable,
        dataTable,
        pageSize,
        sort,
        sortable,
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
    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                {bodyHeadReport}
            </div>
            <Table
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


AmReport.propTypes = {
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
export default AmReport;