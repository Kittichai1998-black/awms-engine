import React, { useContext, useEffect, useState } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider, AmTableContext } from "./AmTableContext";
import { } from "./AmPagination";
import PropTypes from "prop-types"
import AmPagination from "../table/AmPagination";
import Grid from "@material-ui/core/Grid";

const AmTable = (props) => {
    return <AmTableProvider>
        <AmTableSetup
            dataSource={props.dataSource}
            width={props.width}
            columns={props.columns}
            cellStyle={props.cellStyle}
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
            height={props.height}
            tableStyle={props.tableStyle}
            footerStyle={props.footerStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
            filterable={props.filterable}
            filterData={props.filterData}
            pageSize={props.pageSize}
            minRow={props.minRow}
            pagination={props.pagination}
            onPageChange={props.onPageChange}
            totalSize={props.totalSize}
            selection={props.selection}
            selectionData={props.selectionData}
            selectionDefault={props.selectionDefault}
            clearSelectionChangePage={props.clearSelectionChangePage}
            customAllTopControl={props.customAllTopControl}
            customTopLeftControl={props.customTopLeftControl}
            customTopRightControl={props.customTopRightControl}
        />
    </AmTableProvider>
}

const AmTableSetup = (props) => {
    const { pagination, filter, selection } = useContext(AmTableContext);
    const [page, setPage] = useState(1)
    const [dataSource, setDataSource] = useState([])

    const { selectionData } = props;

    useEffect(() => {
        if (props.pageSize)
            pagination.setPageSize(props.pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.pageSize])

    useEffect(() => {
        if (props.filterable)
            props.filterData(filter.filterValue)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.filterValue])

    useEffect(() => {
        if (selectionData !== undefined) {
            selectionData(selection.selectionValue)
        }
    }, [selection.selectionValue, selectionData])

    useEffect(() => {
        if (props.selectionDefault)
            selection.addAll(props.selectionDefault)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.selectionDefault])

    useEffect(() => {
        if (props.onPageChange === undefined) {
            let dataSlice = props.dataSource.slice(((page - 1) * (props.pageSize)), ((page - 1) * (props.pageSize)) + props.pageSize);
            setDataSource(dataSlice);
        } else {
            setDataSource(props.dataSource);
        }
    }, [page, props.dataSource, props.onPageChange])

    const Topbar = (propsTopbar) => {
        if(propsTopbar.customAllTopControl){
            return <>
                <div style={{display:"inline-block"}}>{propsTopbar.customAllTopControl}</div>
                <div id="pagination">
                    {propsTopbar.pagination ? <AmPagination
                        totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                        pageSize={propsTopbar.pageSize}
                        resetPage={propsTopbar.resetPage}
                        onPageChange={page => {
                            if (propsTopbar.onPageChange !== undefined) {
                                propsTopbar.onPageChange(page + 1)
                            }
                            setPage(page + 1)
                        }}
                    /> : null}
                </div>
            </>
        }
        else{
            return <Grid container direction="row" justify="space-between" alignItems="flex-end">
            <Grid item xs={6}>
                {propsTopbar.customTopLeftControl ? propsTopbar.customTopLeftControl : null}
            </Grid>
            <Grid item xs={6} style={{textAlign:"right"}}>
                <div style={{display:"inline-block"}}>
                    {propsTopbar.pagination ? <AmPagination
                        totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                        pageSize={propsTopbar.pageSize}
                        resetPage={propsTopbar.resetPage}
                        onPageChange={page => {
                            if (propsTopbar.onPageChange !== undefined) {
                                propsTopbar.onPageChange(page + 1)
                            }
                            setPage(page + 1)
                        }}
                    /> : null}
                </div>
                <div style={{display:"inline-block"}}>{propsTopbar.customTopRightControl ? propsTopbar.customTopRightControl : null}</div>
            
            </Grid>
        </Grid>
        }
    };

    return <>
        <Topbar 
            customAllTopControl={props.customAllTopControl} 
            customTopLeftControl={props.customTopLeftControl} 
            customTopRightControl={props.customTopRightControl}
            totalSize={props.totalSize}
            onPageChange={props.onPageChange}
            resetPage={props.resetPage}
            pageSize={props.pageSize}
            dataSource={dataSource}
            pagination={props.pagination}
            />
        <AmTableComponent
            dataSource={dataSource}
            width={props.width}
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
            clearSelectionChangePage={props.clearSelectionChangePage}
        />
        <div id="btmbar">
            {/* <div id="pagination">
                {props.pagination ? <AmPagination
                    totalSize={props.totalSize ? props.totalSize : props.dataSource.length}
                    pageSize={props.pageSize}
                    resetPage={props.resetPage}
                    onPageChange={page => {
                        if (props.onPageChange !== undefined) {
                            props.onPageChange(page + 1)
                        }
                        setPage(page + 1)
                    }}
                /> : null}
            </div> */}
            <div style={{ clear: "both" }}></div>
        </div>
    </>
}

export default AmTable;

AmTable.propTypes = {
    /**
    * ข้อมูลในตาราง
    * ** value : Array Object [{"a":"1", "b":"2", "c":"3"}]
    */
    dataSource: PropTypes.array.isRequired,
    /**
     * รูปแบบของหัวตารางเลือกเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    columns: PropTypes.array.isRequired,
    /**
        * Primary Key
        ** value? : "ID"
    */
    dataKey: PropTypes.string.isRequired,
    /**
     * return style object ตามเงื่อนไขข้อมูล
     ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
    */
    cellStyle: PropTypes.func,
    /**
     * เลือกรูปแบบ selection
     ** value? : "radio" | "checkbox"
    */
    selection: PropTypes.string,
    /**
     * เลือกรูปแบบ filterable
     ** value? : true | false
    */
    filterable: PropTypes.bool,
    /**
        * function รับค่า Filter
        ** value? : (filterData) => {}
    */
    filterData: PropTypes.func,
    /**
     * เปิดปิด row number
     ** value? : true | false
    */
    rowNumber: PropTypes.bool,
    /**
     * ความสูง grid
     ** value? : 500
    */
    height: PropTypes.number,
    /**
     * return style object
     ** value? : {color:"red"}
    */
    tableStyle: PropTypes.object,
    /**
     * return style object
     ** value? : {color:"red"}
    */
    headerStyle: PropTypes.object,
    /**
     * return style object ตามเงื่อนไขข้อมูล footer
     ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
    */
    footerStyle: PropTypes.func,
    /**
     * return Array [Field]
     ** value? : ["ID", "Code"]
    */
    groupByData: PropTypes.array,
    /**
     * return Object ข้อมูลสำหรับ group ตาม row
     ** value? : {"field":["ID"], "sumField":["Quantity"]}
    */
    groupBy: PropTypes.object,
    /**
     * จำนวน row ขั้นต่ำ
     ** value? : 5
    */
    minRow: PropTypes.number,
    /**
     * เปิดปิดการใช้งาน pagination
     ** value? : true | false
    */
    pagination: PropTypes.bool,
    /**
     * return ข้อมูลเลขหน้าปัจจุบัน
     ** value? : (page) => {}
    */
    onPageChange: PropTypes.func,
    /**
     * ข้อมูลจำนวน row ทั้งหมด
     ** value? : 500
    */
    totalSize: PropTypes.number,
    /**
     * return ข้อมูลที่ถูกเลือก
     ** value? : (selectionValue) => {}
    */
    selectionData: PropTypes.func,
    /**
     * ข้อมูล selection เริ่มต้น
     ** value? : [{ID:1},{ID:2},...]
    */
    selectionDefault: PropTypes.array,
    /**
     * ใช้เปิดปิดเงื่อนไขเคลียข้อมูบที่เลือกเมื่อเปลี่ยนหน้า
     ** value? : true | false
    */
    clearSelectionChangePage: PropTypes.bool,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

AmTable.defaultProps = {
    minRow: 5,
    height: 500,
    pageSize: 25,
    clearSelectionChangePage: true,
    width: "100%"
}
