import React, { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types"
import {
  apicall,
  createQueryString,
} from "../../../components/function/CoreFunction";
import AmButton from "../../../components/AmButton";
import AmDropdown from "../../../components/AmDropdown";
import AmFindPopup from "../../../components/AmFindPopup";
import styled from 'styled-components';
import {ProcessQueueContext} from './ProcessQueueContext';
import { CardBody } from "reactstrap";
import { Card, Grid } from "@material-ui/core";
import queryString from "query-string";
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

const useDocumentQuery = (warehouseID, docQuery, addDocList) => {
    const [documentQuery, setDocumentQuery] = useState(docQuery);

    useEffect(() => {
        if(warehouseID != null ){
            let objQuery = {...docQuery};
            if(objQuery !== null){
              let getWarehouse = JSON.parse(objQuery.q);
              if(getWarehouse.find(x=> x.f === "Sou_Warehouse_ID") === undefined){
                getWarehouse.push({ 'f': 'Sou_Warehouse_ID', 'c':'=', 'v': warehouseID})
              }
              else{
                let setWarehouse = getWarehouse.find(x=> x.f === "Sou_Warehouse_ID")
                setWarehouse.v = warehouseID;
              }
              objQuery.q = JSON.stringify(getWarehouse);
              setDocumentQuery(objQuery)
            }
        }
    }, [warehouseID, docQuery]);
    
    useEffect(() => {
      let whereCondition = JSON.parse(documentQuery.q);
      if(addDocList.length > 0){
        let findOld = whereCondition.find(x => x.f === "ID")
        let getDocID = addDocList.map(x=> x.ID);
        if(findOld === undefined || findOld === null){
          if(getDocID.length > 0){
            whereCondition.push({ 'f': 'ID', 'c':'not in', 'v': getDocID.join(",")})
          }
          else{
            whereCondition = whereCondition.filter(x=> x.f !== "ID");
          }
        }
        else{
          if(getDocID.length > 0){
            findOld.v = getDocID.join(",");
          }
          else{
            whereCondition = whereCondition.filter(x=> x.f !== "ID");
          }
        }
      }else{
        whereCondition = whereCondition.filter(x=> x.f !== "ID");
      }
      documentQuery.q = JSON.stringify(whereCondition);
      setDocumentQuery(documentQuery)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addDocList]);
  
    return documentQuery;
}
const FindPopup = React.memo(({valueData, queryApi, columns, clearText, onHandleSelectDocument}) => {
  console.log(columns)
  return <AmFindPopup
  id={"DocumentSelection"}
  placeholder={"Document"}
  fieldDataKey={"ID"}
  fieldLabel={["Code"]}
  labelPattern=" : "
  valueData={valueData}
  labelTitle={"Document"}
  queryApi={queryApi}
  columns={columns}
  width={300}
  clearText={clearText}
  onChange={(value, dataObject) => onHandleSelectDocument(value, dataObject)}
/>
})

const ProcessQueueHeader = (props) => {
    const { documents, documentDetail, warehouse } = useContext(ProcessQueueContext);
    const [documentSelection, setDocumentSelection] = useState({});
    const [warehouseID, setWarehouseID] = useState("");
    const [headerHide, setHeaderHide] = useState(true);
    const documentData = useDocumentQuery(warehouseID, props.documentQuery, documents.documentsValue)
    const [clearText, setClearText] = useState(false);

    useEffect(()=>{
      if(props.warehouseDefault === undefined && props.warehouseDefault === ""){
        setWarehouseID(props.warehouseDefault.ID);
        warehouse.setWarehouse(props.warehouseDefault)
      }
      documentDetail.setDocumentDetail(props.documentDetail)

      var qrObj =  queryString.parse(window.location.search)
      if(qrObj.docID !== undefined){
        let docQry = {...props.documentQuery};
        let getWarehouse = JSON.parse(docQry.q);
        getWarehouse.push({ 'f': 'ID', 'c':'=', 'v': qrObj.docID})
        docQry.q = JSON.stringify(getWarehouse);

        Axios.get(createQueryString(docQry)).then(res => {
          if(res.data.datas.length > 0){
            documents.setDocuments(res.data.datas[0])
            setWarehouseID(res.data.datas[0].Sou_Warehouse_ID);
          }
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onHandleSelectDocument = (value, dataObject) => {
      if(props.processSingle === true){
        if(dataObject !== null){
          documents.addSingleDocument(dataObject);
        }
        setHeaderHide(true)
      }else{
        setHeaderHide(false)
      }
      setDocumentSelection(dataObject === null ? {} : dataObject)
    }
    
    useEffect(() => {
      if(clearText)
        setClearText(!clearText)
    }, [clearText])

    const genDocumentHeader = () => {
      const renderColumns = [];
      const columnSize = documentDetail.documentDetailValue.columns;
      const columnsField = [...documentDetail.documentDetailValue.field]
      const calColumns = Math.ceil(12 / columnSize);
      const row = Math.ceil(columnsField.length / columnSize);
      for(let i = 0; i < row; i++){
        for(let j = 0; j < calColumns; j++){
          const field = columnsField.splice(i*columnSize, ((i*columnSize) + columnSize));
          if(field.length === 0)
            break;
          field.forEach((z, idx) => renderColumns.push(<Grid key={idx} item  xs={calColumns}>{z.label} : {documentSelection[z.accessor]}</Grid>))
        }
      }
      return renderColumns
    }
  
    return <div>
    {props.warehouseDefault === undefined || props.warehouseDefault === "" ? <FormInline>
        <label style={{"width":100}}>Warehouse : </label>
        <AmDropdown
          disabled={documents.documentListValue.length > 0 ? true : false}
          id={"Warehouse"}
          placeholder={"Warehouse"}
          fieldDataKey={"ID"}
          fieldLabel={["Name"]} 
          labelPattern=" : "
          width={200}
          value={warehouseID}
          defaultValue={warehouseID}
          ddlMinWidth={200} 
          queryApi={props.warehouseQuery}
          zIndex={1000}
          onChange={(value, dataObject, inputID, fieldDataKey) => {
            setWarehouseID(value);
            warehouse.setWarehouse(dataObject)
          }}
          returnDefaultValue={true}
        />
      </FormInline> : null }
      
      <FormInline>
        <label style={{"width":100}}>Document : </label>
        <FindPopup 
          columns={props.documentPopup}
          valueData={documentSelection["ID"]} 
          queryApi={documentData} 
          clearText={clearText} 
          onHandleSelectDocument={onHandleSelectDocument}
        />

        {props.processSingle ? null : <AmButton 
          style={{marginLeft:"10px"}}
          styleType="add" 
          disabled={documentSelection["ID"] === null || documentSelection["ID"] === undefined} 
          onClick={() => {
            documents.setDocuments(documentSelection);
            document.getElementById("DocumentSelection").value = "";
            setDocumentSelection({})
            setHeaderHide(true);
            setClearText(true);
          }}>Add</AmButton>}
      </FormInline>
      
      {
        props.documentDetail !== undefined && documentSelection["ID"] !== undefined && !headerHide ? 
        <Card>
          <CardBody>
            <Grid container>
              {genDocumentHeader()}
            </Grid>
          </CardBody>
        </Card>
        : null
      }
      
    </div>
}

ProcessQueueHeader.propTypes = {
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
    * Default ID ของ Warehosue
    * ** value : 1
    */
    warehouse:PropTypes.number,
    /**
    * QueryString สำหรับแสดงข้อมูลเอกสาร
    * ** value : queryString: window.apipath + "/v2/SelectDataTrxAPI/" ...
    */
    documentQuery:PropTypes.object,
    /**
    * QueryString สำหรับแสดงข้อมูลเอกสาร
    * ** value : queryString: window.apipath + "/v2/SelectDataMstAPI/" ...
    */
    warehouseQuery:PropTypes.object,
    /**
    * รูปแบบของหัวตารางเลือกเอกสารสำหรับแสดงข้อมูลเอกสาร
    * ** value : {
      columns:2, //จำนวน grid ต่อบรรทัด
      field:[
        {"accessor":"Code", "label":"Code"}
      ]
    */
    documentDetail:PropTypes.object
}

ProcessQueueHeader.defaultProps = {
    processSingle:false
}

export default React.memo(ProcessQueueHeader);