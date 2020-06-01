import React, { useContext,useEffect,useState } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider, AmTableContext  } from "./AmTableContext";
import {  } from "./AmPagination";
import PropTypes from "prop-types"
import AmPagination from "../table/AmPagination";

const AmTable = (props) => {
    return <AmTableProvider>
        <AmTableSetup 
            dataSource={props.dataSource} 
            columns={props.columns} 
            cellStyle={props.cellStyle} 
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
            height={props.height}
            tableStyle={props.tableStyle}
            footerStyle={props.footerStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
            selection={props.selection}
            filterable={props.filterable}
            filterData={props.filterData}
            pageSize={props.pageSize}
            minRow={props.minRow}
            pagination={props.pagination}
            onPageChange={props.onPageChange}
        />
    </AmTableProvider>
}

const AmTableSetup = (props) => {
    const {pagination, filter} = useContext(AmTableContext);
    const [page, setPage] = useState(1)
    const [dataSource, setDataSource] = useState([])
    
    useEffect(() => {
        if(props.pageSize)
            pagination.setPageSize(props.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.pageSize])

    useEffect(() => {
        if(props.filterable)
            props.filterData(filter.filterValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.filterValue])

    useEffect(()=>{
        if(props.onPageChange === undefined){
            let dataSlice = props.dataSource.slice(((page - 1) * (props.pageSize)), ((page - 1) * (props.pageSize)) + props.pageSize);
            setDataSource(dataSlice);
        }else{
            setDataSource(props.dataSource);
        }
    }, [page, props.dataSource, props.onPageChange])

    return <>
        <div id="topbar"></div>
        <AmTableComponent 
            dataSource={dataSource} 
            columns={props.columns} 
            cellStyle={props.cellStyle} 
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
            height={props.height}
            footerStyle={props.footerStyle}
            tableStyle={props.tableStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
            selection={props.selection}
            filterable={props.filterable}
            minRow={props.minRow}
            page={page}
        />
        <div id="btmbar">
            <div id="pagination">
                {props.pagination ? <AmPagination 
                    totalSize={props.totalSize ? props.totalSize : props.dataSource.length} 
                    pageSize={props.pageSize}
                    resetPage={props.resetPage}
                    onPageChange={page => {
                        if(props.onPageChange !== undefined){
                            props.onPageChange(page+1)
                        }
                        setPage(page+1)
                    }}
                /> : null}
            </div>
        </div>
    </>
}

export default AmTable;

AmTable.propTypes = {
    /**
    * ข้อมูลในตาราง
    * ** value : Array Object [{"a":"1", "b":"2", "c":"3"}]
    */
   dataSource : PropTypes.array.isRequired,
    /**
     * รูปแบบของหัวตารางเลือกเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
   columns : PropTypes.array.isRequired,
    /**
        * Primary Key
        ** value? : "ID"
    */
    dataKey:PropTypes.string.isRequired,
     /**
      * return style object ตามเงื่อนไขข้อมูล
      ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
     */
    cellStyle:PropTypes.func,
    /**
     * เลือกรูปแบบ selection
     ** value? : "radio" | "checkbox"
    */
    selection:PropTypes.string,
    /**
     * เลือกรูปแบบ filterable
     ** value? : true | false
    */
    filterable:PropTypes.bool,
    /**
        * function รับค่า Filter
        ** value? : (filterData) => {}
    */
    filterData:PropTypes.func,
     /**
      * เปิดปิด row number
      ** value? : true | false
     */
    rowNumber:PropTypes.bool,
     /**
      * ความสูง grid
      ** value? : 500
     */
    height:PropTypes.number,
     /**
      * return style object
      ** value? : {color:"red"}
     */
    tableStyle:PropTypes.object,
     /**
      * return style object
      ** value? : {color:"red"}
     */
    headerStyle:PropTypes.object,
    /**
     * return style object ตามเงื่อนไขข้อมูล footer
     ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
    */
    footerStyle:PropTypes.func,
    /**
     * return Array [Field]
     ** value? : ["ID", "Code"]
    */
    groupByData:PropTypes.array,
    /**
     * return Object ข้อมูลสำหรับ group ตาม row
     ** value? : {"field":["ID"], "sumField":["Quantity"]}
    */
    groupBy:PropTypes.object,
    /**
     * จำนวน row ขั้นต่ำ
     ** value? : 5
    */
    minRow:PropTypes.number,
    /**
     * เปิดปิดการใช้งาน pagination
     ** value? : true | false
    */
    pagination:PropTypes.bool,
    /**
     * ใช้ส่งข้อมูลเลขหนาปัจจุบัน
     ** value? : (page) => {}
    */
    onPageChange:PropTypes.func,
  }

AmTable.defaultProps = {
    minRow:5,
    height:500
}
