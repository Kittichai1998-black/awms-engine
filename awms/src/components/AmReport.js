import React, { useState, useEffect } from "react";
// import PropTypes from 'prop-types';
import Table from '../components/table/AmTable'
import Pagination from '../components/table/AmPagination';
import _ from 'lodash';
// import { useTranslation } from 'react-i18next'

const AmReport = (props) => {
    // const { t } = useTranslation()
    // const [sort, setSort] = useState(0);

    //const [value, setvalue] = useState("Total");
    const [data, setData] = useState(props.dataTable);
    const [pageTb, setPageTb] = useState(0);
    const [footerSum, setfooterSum] = useState(props.columnTable);
    const [sumwhere, setsumwhere] = useState(props.sumwhere);
    // const [sumCol, setSumcol] = useState();

    // const calWidth = (columsList) => {
    //     let tableWidth = 0;
    //     columsList.forEach((row) => tableWidth = tableWidth + row.width);
    //     return tableWidth
    // }

    const sumFooterTotal = (value) => {
        var sumVal = _.sumBy(data,
            x => _.every(data, [sumwhere, x[sumwhere]]) == true ?
                parseFloat(x[value] === null ? 0 : x[value]) : null)
        if (sumVal === 0 || sumVal === null || sumVal === undefined || isNaN(sumVal)) {
            return '-'
        } else {
            console.log(sumVal.toFixed(3))
            //setSum(sumVal.toFixed(3))
            return sumVal.toFixed(3)
        }
    }


    const SumTables = () => {
        return footerSum.filter(row => row.Footer === true).map(row => {
            return { accessor: row.accessor, sumData: sumFooterTotal(row.accessor) }
        })

    }

    // console.log(SumTables())

    useEffect(() => { setData(props.dataTable) }, [props.dataTable])


    useEffect(() => {
        if (props.page != false)
            props.pages(pageTb)
    }, [pageTb])

    useEffect(() => { sumFooterTotal() }, [sumFooterTotal])

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                {props.bodyHeadReport}
            </div>

            <Table
                onRowClick={() => null}
                data={data}
                columns={props.columnTable}
                sumFooter={SumTables()}
                pageSize={props.pageSize}
                sort={(sort) => props.sort({ field: sort.id, order: sort.sortDirection })}
                sortable={props.sortable}
                currentPage={props.page ? pageTb : 0}
                exportData={props.exportData !== undefined ? props.exportData : true}
                excelData={data}
                renderCustomButtonB4={props.renderCustomButton}
            ></Table>

            {props.page ? <Pagination
                //�ӹǹ�����ŷ�����
                totalSize={props.totalSize}
                //�ӹǹ�����ŵ��˹��
                pageSize={props.pageSize}
                //return ˹�ҷ��١�� : function
                onPageChange={(pageTb) => setPageTb(pageTb)} /> : null}

            <div>
                {props.bodyFooterReport}
            </div>

            {/*footerSum ? <div>SUM : <label>{
                    footerSum.map(row => {
                        if (row.Footer == true) 
                        return <div style={{ display: "inline-block" }}><div style={{ display: "inline-block" }}>
                            <pre class="tab">   </pre>
                            {row.Header} </div> : 
                            {sumFooterTotal(row.accessor)}
                            </div>

                    })}</label> <pre class="tab"> </pre> </div>  : null*/}

        </div>

    )
}


export default AmReport;