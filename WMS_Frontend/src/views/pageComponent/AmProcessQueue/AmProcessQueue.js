import React, { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../components/function/CoreFunction2";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import queryString from "query-string";
import Table from "../../../components/table/AmTable";
import AmDropdown from "../../../components/AmDropdown";
import AmFindPopup from "../../../components/AmFindPopup";
import styled from 'styled-components';
import AmTableV2 from '../../../components/table/AmTableV2';
import {ProcessQueueContext, ProcessQueueProvider} from './ProcessQueueContext';

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


const ProcessQueueHeader = (props) => {
  const { documents, warehouse } = useContext(ProcessQueueContext);
  const [document, setDocument] = useState([]);
  const [documentSelection, setDocumentSelection] = useState({});
  
  useEffect(()=>{
    warehouse.setWarehouse(props.warehouse === undefined || props.warehouse === "" ? null : props.warehouse);
  }, [])

  const onHandleSelectDocument = (value, dataObject) => {
    if(props.processSingle === true){
      let docData = [...document];
      docData.push(value);
      setDocument([...new Set(docData)])
    }
    else{
      setDocumentSelection(dataObject)
    }
  }

  return <div>
    {console.log(warehouse)}
    {console.log(documents)}
  {props.warehouse === undefined || props.warehouse === "" ? <FormInline>
      <label style={{"width":100}}>Warehouse : </label>
      <AmDropdown
        id={"Warehouse"}
        placeholder={"Warehouse"}
        fieldDataKey={"ID"}
        fieldLabel={["Name"]} 
        labelPattern=" : "
        width={200}
        value={warehouse.warehouseValue}
        ddlMinWidth={200} 
        data={[{Name:"1", ID:1},{Name:"2", ID:2}]}
        zIndex={1000}
        onChange={(value, dataObject, inputID, fieldDataKey) => warehouse.setWarehouse(value)}
      />
    </FormInline> : null }
    
    <FormInline>
      <label style={{"width":100}}>Document : </label>
      <AmFindPopup
        id={"Document"}
        placeholder={"Document"}
        fieldDataKey={"ID"}
        fieldLabel={["Code"]}
        labelPattern=" : "
        valueData={documentSelection["ID"]}
        labelTitle={"Document"}
        queryApi={props.documentQuery}
        columns={props.documentPopup}
        width={300}
        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleSelectDocument(value, dataObject)}
      />
      <AmButton 
        classes="addBtn" 
        styleType="add" 
        disabled={documentSelection["ID"] === null || documentSelection["ID"] === undefined} 
        onClick={() => documents.addDocument(documentSelection)}>Add</AmButton>
    </FormInline>
    
  </div>
}

ProcessQueueHeader.propTypes = {
  /**
   * ข้อมูลที่จะแสดง
   ** value : Array Object
  */
  dataSource:PropTypes.array.isRequired,
  /**
   * รูปแบบของหัวตารางเลือกเอกสาร
   ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
  */
  documentPopup:PropTypes.array.isRequired,
  /**
   * เลือกรูปแบบการโปรเสทแบบ 1 เอกสารหรือหลายเอกสาร
   ** value? : true || false
  */
  processSingle:PropTypes.bool,
  /**
  * ส่งข้อมูลเอกสารที่เลือกกลับให้ผู้เรียกใช้งาน
  * ** value : function()
  */
  selectionDocument:PropTypes.func.isRequired,
  /**
  * Default ID ของ Warehosue
  * ** value : 1
  */
  warehouse:PropTypes.number,
  /**
  * QueryString สำหรับแสดงข้อมูลเอกสาร
  * ** value : queryString: window.apipath + "/v2/SelectDataTrxAPI/" ...
  */
  documentQuery:PropTypes.string
}
ProcessQueueHeader.defaultProps = {
  processSingle:false
}

const ProcessQueueDetail = (props) => {
  const { documents, warehouse } = useContext(ProcessQueueContext);
  return <>
    <AmTableV2 
      columns={props.documentItemDetail}
      data={[]}
      sortable={false}
      rowNumber={false}
    />detail
  </>
}

const ProcessQueue = (props) => {

return <>
  <ProcessQueueProvider>
    <ProcessQueueHeader 
        documentPopup={props.documentPopup}
        documentQuery={props.documentQuery}
      />
    <ProcessQueueDetail documentItemDetail={props.documentItemDetail}/>
  </ProcessQueueProvider>
  </>
}

ProcessQueue.propTypes = {
  /**
  * QueryString สำหรับแสดงข้อมูลเอกสาร
  * ** value : queryString: window.apipath + "/v2/SelectDataTrxAPI/" ...
  */
  documentQuery : PropTypes.string.isRequired,
  /**
   * รูปแบบของหัวตารางเลือกเอกสาร
   ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
  */
  documentPopup : PropTypes.array.isRequired,
  /**
   * รูปแบบของหัวตารางของรายละเอียดเอกสาร
   ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
  */
  documentItemDetail : PropTypes.array.isRequired,
}
ProcessQueue.defaultProps = {
}
  
export default ProcessQueue;