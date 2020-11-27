import React, {useState} from "react";
import PropTypes from "prop-types"
import {ProcessQueueProvider} from './ProcessQueueContext';
import AmProcessQueueHeader from './AmProcessQueueHeader';
import AmProcessQueueDetail from './AmProcessQueueDetail';

const ProcessQueue = (props) => {
  let content = props.contentHeight - (props.warehouseDefault !== undefined ? 120 : 140);
  return <ProcessQueueProvider>
      <AmProcessQueueHeader
          documentPopup={props.documentPopup}
          documentQuery={props.documentQuery}
          warehouseQuery={props.warehouseQuery}
          warehouseDefault={props.warehouseDefault}
          processSingle={props.processSingle}
          documentDetail={props.documentDetail}
        />
      <hr style={{ marginTop: "10px", marginBottom: "10px" }} />
      <AmProcessQueueDetail documentItemDetail={props.documentItemDetail}
          contentHeight={content}
          processCondition={props.processCondition}
          percentRandom={props.percentRandom}
          areaQuery={props.areaQuery}
          customDesArea={props.customDesArea}
          areaDefault={props.areaDefault}
          columnsConfirm={props.columnsConfirm}
          processUrl={props.processUrl}
          confirmProcessUrl={props.confirmProcessUrl}
          modeDefault={props.modeDefault}
          waveProcess={props.waveProcess}
          customAfterProcess={props.customAfterProcess}
          confirmErrorClear={props.confirmErrorClear}
          processErrorClear={props.processErrorClear}
        />
    </ProcessQueueProvider>
}

ProcessQueue.propTypes = {
  /**
  * QueryString สำหรับแสดงข้อมูลเอกสาร
  * ** value : queryString: window.apipath + "/v2/SelectDataTrxAPI/" ...
  */
  documentQuery : PropTypes.object.isRequired,
  /**
  * QueryString สำหรับแสดงข้อมูล Warehouse
  * ** value : queryString: window.apipath + "/v2/SelectDataMstAPI/" ...
  */
  warehouseQuery : PropTypes.object.isRequired,
  /**
    * กำหนดค่าเริ่มต้นสำหรับสร้าง Warehouse
    * ** value : "1"
    */
  warehouseDefault : PropTypes.string,
  /**
   * รูปแบบของหัวตารางเลือกเอกสาร
   ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
  */
  documentPopup : PropTypes.array.isRequired,
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
   /**
    * ฟังก์ชั่นหลัง Process Queue เสร็จ
    ** value? : (processResponse) => { }
   */
  customAfterProcess:PropTypes.func,
}
ProcessQueue.defaultProps = {
  processSingle:false,
  processUrl:"process_wq",
  confirmProcessUrl:"confirm_process_wq",
  waveProcess:true
}

export default ProcessQueue;