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
            tableStyle={props.tableStyle}
            footerStyle={props.footerStyle}
            headerStyle={props.headerStyle}
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
    * รูปแบบของหัวตารางเลือกเอกสารสำหรับแสดงข้อมูลเอกสาร
    * ** value : {
      columns:2, //จำนวน grid ต่อบรรทัด
      field:[
        {"accessor":"Code", "label":"Code"}
      ]
    */
    documentDetail:PropTypes.object.isRequired,
    /**
     * เลือกรูปแบบการโปรเสทแบบ 1 เอกสารหรือหลายเอกสาร
     ** value? : true || false
    */
    processSingle:PropTypes.bool,
    /**
     * รูปแบบของหัวตารางของรายละเอียดเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    documentItemDetail : PropTypes.array.isRequired,
    /**
      * กำหนดค่าเริ่มต้นสำหรับสร้าง Wave
      * ** value : "1"
      */
     modeDefault : PropTypes.string,
     /**
      * ใช้เปิดปิดการเบิกแบบเป็น percent
      ** value : true || false
     */
     percentRandom : PropTypes.bool,
     /**
     * รูปแบบของหัวตารางสำหรับข้อมูลก่อน comfirm wave งานเบิก
     * ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
     */
     columnsConfirm:PropTypes.array.isRequired,
     /**
      * query string สำหรับดึงข้อมูล Area
      ** value? : string
     */
     areaQuery:PropTypes.array.isRequired,
     /**
      * รายการ Area โดยใช้เงื่อนไขผ่าน {arealist:[],document:{document:{}, docItem:[]}} โดยส่ง Area List กลับ
      ** value? : (arealist,doc)=> {return arealist}
     */
     customDesArea:PropTypes.func,
     /**
      * ข้อมูล Area เริ่มต้น โดยใช้เงื่อนไขผ่าน {document:{}, docItem:[]}
      ** value? : (doc)=> {return value}
     */
     areaDefault:PropTypes.func,
     /**
      * Url สำหรับ process queue
      ** value? : process_wq
     */
     processUrl:PropTypes.string,
     /**
      * Url สำหรับ confirm process queue
      ** value? : confirm_process_wq
     */
     confirmProcessUrl:PropTypes.string,
     /**
      * ใช้เปิดปิดการเบิกแบบเป็นเก่าหรือแบบ wave
      ** value? : true | false
     */
     waveProcess:PropTypes.bool,
  }

AmTable.defaultProps = {
}
