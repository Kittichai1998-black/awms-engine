import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../components/function/CoreFunction2";
import styled from 'styled-components';
import {ProcessQueueContext, ProcessQueueProvider} from './ProcessQueueContext';
import AmProcessQueueHeader from './AmProcessQueueHeader';
import AmProcessQueueDetail from './AmProcessQueueDetail';
import { CardBody } from "reactstrap";
import { Card, Grid } from "@material-ui/core";
var Axios = new apicall();

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
  margin: 5px 0 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;

const ProcessQueue = (props) => {
  return <>
    <ProcessQueueProvider>
      <AmProcessQueueHeader 
          documentPopup={props.documentPopup}
          documentQuery={props.documentQuery}
          warehouseQuery={props.warehouseQuery}
          warehouseDefault={props.warehouseDefault}
          processSingle={props.processSingle}
          documentDetail={props.documentDetail}
        />
      <AmProcessQueueDetail documentItemDetail={props.documentItemDetail} 
      processCondition={props.processCondition}
      percentRandom={props.percentRandom}
      areaQuery={props.areaQuery}
      customDesArea={props.customDesArea}
      areaDefault={props.areaDefault}
      columnsConfirm={props.columnsConfirm}/>
    </ProcessQueueProvider>
  </>
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
}
ProcessQueue.defaultProps = {
  processSingle:false
}

export default ProcessQueue;