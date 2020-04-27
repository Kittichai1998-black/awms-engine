import React, { useContext,useEffect } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider, AmTableContext  } from "./AmTableContext";
import PropTypes from "prop-types"

const AmTable = (props) => {
    return <AmTableProvider>
        <AmTableSetup 
            dataSource={props.dataSource} 
            columns={props.columns} 
            cellStyle={props.cellStyle} 
            key={props.key}
            rowNumber={true}
            height={props.height}
            tableStyle={props.tableStyle}
            footerStyle={props.footerStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
        />
    </AmTableProvider>
}

const AmTableSetup = (props) => {
    const {pagination} = useContext(AmTableContext);
    
    useEffect(() => {
        if(props.pageSize)
            pagination.setPageSize(props.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.pageSize])

    return <>
        <div id="topbar"></div>
        <AmTableComponent 
            dataSource={props.dataSource} 
            columns={props.columns} 
            cellStyle={props.cellStyle} 
            key={props.key}
            rowNumber={true}
            height={props.height}
            footerStyle={props.footerStyle}
            tableStyle={props.tableStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
        />
        <div id="btmbar">
            <div id="pageination"></div>
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
    key:PropTypes.string.isRequired,
     /**
      * return style object ตามเงื่อนไขข้อมูล
      ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
     */
    cellStyle:PropTypes.func,
     /**
      * เปิดปิด row number
      ** value? : true || false
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
  }

AmTable.defaultProps = {
}
