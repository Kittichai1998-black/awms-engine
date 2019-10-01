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
        exportApi
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
        if (exportApi) {
            GetDataExport(exportApi)
        } else {
            setDataExport(dataSrc)
        }
    }, [exportApi])
    useEffect(() => {
        if (page != false)
            pages(pageTb)
    }, [pageTb])

    const SumTables = () => {
        return columnTable.filter(row => row.Footer === true).map(row => {
            return { accessor: row.accessor, sumData: sumFooterTotal(row.accessor) }
        })
    }
    const sumFooterTotal = (value) => {
        var sumVal = _.sumBy(dataSrc, value)
        /*var sumVal = _.sumBy(dataSrc,
            x => _.every(dataSrc, value) == true ?
                parseFloat(x[value] === null ? 0 : x[value]) : 0)
       */
        if (sumVal === 0 || sumVal === null || sumVal === undefined || isNaN(sumVal)) {
            return '-'
        } else {
            return sumVal.toFixed(3)
        }
    }
    const CreateDataWithFooter = () => {
        if (dataExport && dataExport.length > 0) {
            var tempdata = Clone(dataExport)
            var objfoot = {};
            columnTable.filter(row => row.Footer === true).forEach(row => {
                objfoot[row.accessor] = sumFooterTotal(row.accessor);
                objfoot["norownum"] = true;
            });
            return tempdata.concat(objfoot);
        }
        return null;
    }
    async function GetDataExport() {
        if (exportApi) {
            await Axios.get(window.apipath + exportApi).then((rowselect1) => {
                if (rowselect1) {
                    if (rowselect1.data._result.status !== 0) {
                        setDataExport(rowselect1.data.datas);
                    }
                }
            })
        }
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
                excelData={excelFooter !== undefined && true ? CreateDataWithFooter() : dataExport}
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
    sort: PropTypes.func
}
export default AmReport;