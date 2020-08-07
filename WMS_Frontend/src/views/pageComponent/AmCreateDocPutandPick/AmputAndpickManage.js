import React, { useContext, useState } from "react";
import AmButton from '../../../components/AmButton';
import { PutandPickContext } from './PutandPickContext';
import Grid from '@material-ui/core/Grid';
import { apicall } from "../../../components/function/CoreFunction";
import AmDialogs from '../../../components/AmDialogs'
const Axios = new apicall()

const AmputAndpickManage = (props) => {

    const { doc, dia } = useContext(PutandPickContext);


    const OnCreateDocument = () => {
        const docs = {
            actionTime: null,
            batch: null,
            desAreaMasterCode: null,
            desAreaMasterID: null,
            desBranchCode: null,
            desBranchID: null,
            desCustomerCode: null,
            desCustomerID: null,
            desSupplierCode: null,
            desSupplierID: null,
            desWarehouseCode: null,
            desWarehouseID: null,
            documentDate: null,
            documentProcessTypeID: null,
            forCustomerCode: null,
            forCustomerID: null,
            lot: null,    
            options: null,
            orderNo: null,
            parentDocumentID: null,
            ref1: null,
            ref2: null,
            refID: null,
            remark: null,
            souAreaMasterCode: null,
            souAreaMasterID: null,
            souBranchCode: null,
            souBranchID: null,
            souCustomerCode: null,
            souCustomerID: null,
            souSupplierCode: null,
            souSupplierID: null,
            souWarehouseCode: null,
            souWarehouseID: null,
            transportID: null
        }
        const docItem = {
            packCode: null,
            packID: null,
            skuCode: null,
            quantity: null,
            unitType: null,
            batch: null,
            lot: null,
            orderNo: null,
            refID: null,
            ref1: null,
            ref2: null,
            options: null,
            expireDate: null,
            productionDate: null,
            docItemStos: [],
            baseStos: []
        }
        
        const countDoc = Object.keys(docs).length
        for (let [key, value] of Object.entries(doc.dataCreate)) {
            if (key in docs)
                docs[key] = value
        }
      
        if (props.doccreateDocType === "putAway") {
            docs.receiveItems = doc.dataSourceItemTB.map(x => {
                x.unitType = x.UnitType_Code
                x.parentDocumentItem_ID = x.ID
                x.Options = null
                x.skuCode = x.Code
                return x
            })

        } else if (props.doccreateDocType === "picking") {
            docs.issueItems = doc.dataSourceItemTB.map(x => {
                x.unitType = x.UnitType_Code
                x.parentDocumentItem_ID = x.ID
                x.Options = null
                x.skuCode = x.Code
                return x
            })
        }


        if (Object.keys(docs).length > countDoc) {
           CreateDocuments(docs)
        }

    }

    const CreateDocuments = (CreateData) => {
        Axios.post(window.apipath + props.docapicreate, CreateData).then((res) => { 
            if (res.data._result.status) {
                dia.setdailogMsg("Create Document success Document ID = " + res.data.ID);
                dia.setdailogSuc(true)
                if (props.docapiRes !== undefined)
                    props.dochistory.push(props.docapiRes + res.data.ID)
            } else {
                dia.setdailogMsg(res.data._result.message);
                dia.setdailogErr(true)
            }
        })
    }
    
    return <div>
        <Grid container>
            <Grid item xs container direction="column">
            </Grid>
            <Grid item>
                <div style={{ marginTop: "20px" }}>
                    <AmButton
                        styleType="info"
                        onClick={() => {
                            OnCreateDocument();
                        }}
                    >CREATE</AmButton>

                </div>
            </Grid>
        </Grid>
     
            <div>
                <AmDialogs
                    typePopup={"success"}
                    content={dia.dailogMsg  ? dia.dailogMsg : ""}
                    onAccept={e => {
                        dia.setdailogSuc(e);
                    }}
                    open={dia.dailogSuc}
                ></AmDialogs>
                <AmDialogs
                    typePopup={"error"}
                    content={dia.dailogMsg ? dia.dailogMsg : ""}
                    onAccept={e => {
                        dia.setdailogErr(e);
                    }}
                    open={dia.dailogErr}
                ></AmDialogs>

            </div>

    </div>

}

AmputAndpickManage.propTypes = {

}

AmputAndpickManage.defaultProps = {

}

export default AmputAndpickManage;