import React, { useContext, useEffect, useState } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider, AmTableContext } from "./AmTableContext";
import PropTypes from "prop-types"
import AmPagination from "../table/AmPagination";
import Grid from "@material-ui/core/Grid";

const Topbar = React.memo((propsTopbar) => {
    if(propsTopbar.customTopControl){
        return <>
            <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customAllTopControl}</div>
            <div id="pagination" style={{display:"inline-block", verticalAlign: "middle"}}>
                {propsTopbar.pagination ? <AmPagination
                    totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                    pageSize={propsTopbar.pageSize}
                    resetPage={propsTopbar.resetPage}
                    onPageChange={page => {
                        if (propsTopbar.onPageChange !== undefined) {
                            propsTopbar.onPageChange(page + 1)
                        }
                        propsTopbar.page(page + 1)
                    }}
                /> : null}
            </div>
        </>
    }
    else{
        if(propsTopbar.customTopLeftControl && propsTopbar.customTopRightControl){
            return <Grid container direction="row" justify="space-between" alignItems="flex-end" style={{marginBottom:5}}>
                <Grid item xs={6}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customTopLeftControl ? propsTopbar.customTopLeftControl : null}</div>
                </Grid>
                <Grid item xs={6} style={{textAlign:"right"}}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customTopRightControl ? propsTopbar.customTopRightControl : null}</div>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>
                        {propsTopbar.pagination ? <AmPagination
                            totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                            pageSize={propsTopbar.pageSize}
                            resetPage={propsTopbar.resetPage}
                            onPageChange={page => {
                                if (propsTopbar.onPageChange !== undefined) {
                                    propsTopbar.onPageChange(page + 1)
                                }
                                propsTopbar.page(page + 1)
                            }}
                        /> : null}
                    </div>
                </Grid>
            </Grid>
        }
    }
});

const Bottombar = React.memo((propsBtmbar) => {
    if(propsBtmbar.customBtmControl){
        return <>
            <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customAllBtmControl}</div>
        </>
    }
    else{
        if(propsBtmbar.customBtmLeftControl && propsBtmbar.customBtmRightControl){
            return <Grid container direction="row" justify="space-between" alignItems="flex-end" style={{marginBottom:5}}>
                <Grid item xs={6}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customBtmLeftControl ? propsBtmbar.customBtmLeftControl : null}</div>
                </Grid>
                <Grid item xs={6} style={{textAlign:"right"}}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customBtmRightControl ? propsBtmbar.customBtmRightControl : null}</div>
                </Grid>
            </Grid>
        }
        else
            return null;
    }
});

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
            customTopControl={props.customTopControl}
            customTopLeftControl={props.customTopLeftControl}
            customTopRightControl={props.customTopRightControl}
            customBtmControl={props.customBtmControl}
            customBtmLeftControl={props.customBtmLeftControl}
            customBtmRightControl={props.customBtmRightControl}
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

    return <div style={{maxHeight:props.height}}>
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
            page={(e) => setPage(e)}
            />
        <AmTableComponent
            dataSource={dataSource}
            width={props.width}
            columns={props.columns}
            cellStyle={props.cellStyle}
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
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
    </div>
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
    /**
     * ตั้งค่าความรูปแบบหัวตาราง
     ** value? : "100%" | 100
    */
    customTopControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customTopLeftControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customTopRightControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmLeftControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmRightControl:PropTypes.element,
}

AmTable.defaultProps = {
    minRow: 5,
    height: 500,
    pageSize: 25,
    clearSelectionChangePage: true,
    width: "100%",
}
