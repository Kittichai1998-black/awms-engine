import React, { useContext, useState } from "react";
import AmButton from '../../../components/AmButton';
import { PutandPickContext } from './PutandPickContext';
import Grid from '@material-ui/core/Grid';
import { apicall } from "../../../components/function/CoreFunction";
import AmDialogs from '../../../components/AmDialogs'
import moment from "moment";
import "moment/locale/pt-br";
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
            ref4: null,
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
            productOwnerID: null,
            souWarehouseID: null,
            transportID: null
        }


        const countDoc = Object.keys(docs).length
        for (let [key, value] of Object.entries(doc.dataCreate)) {
            if (key in docs)
                docs[key] = value
        }

        var qtyrandom = 'qtyrandom='
        var remark = 'remark='
        var pallet = 'palletcode='
        var optn;
        doc.dataSourceItemTB.map(x => {
            if (x.PalletCode != null && x.remark != null && x.Options != null) {
                optn = x.Options + '&' +
                    pallet.concat(x.PalletCode) + '&' +
                    remark.concat(x.remark)
            } else if (x.PalletCode && x.remark && x.Options === null) {
                optn = pallet.concat(x.PalletCode) + '&' +
                    remark.concat(x.remark)
            } else if (x.remark === null && x.PalletCode && x.Options) {
                optn = x.Options + '&' +
                    pallet.concat(x.PalletCode)
            } else if (x.PalletCode === null && x.remark && x.Options) {
                optn = x.Options + '&' +
                    remark.concat(x.remark)
            } else if (x.PalletCode && x.remark === null && x.Options === null) {
                optn = pallet.concat(x.PalletCode)
            } else if (x.PalletCode === null && x.remark && x.Options === null) {
                optn = remark.concat(x.remark)
            } else if (x.PalletCode === null && x.remark === null && x.Options) {
                optn = x.Options
            }
        })


        if (props.doccreateDocType === "putAway") {
            docs.receiveItems = doc.dataSourceItemTB.map(x => {
                x.unitType = x.UnitType_Code
                x.skuCode = x.Code
                x.quantity = x.DiffQty
                x.baseQuantity = x.BaseQuantity
                x.baseunitType = x.BaseUnitType_Code
                x.baseCode = x.BaseCode
                x.batch = x.Batch
                x.lot = x.Lot
                x.orderNo = x.OrderNo
                x.cartonNo = x.CartonNo
                x.itemNo = x.ItemNo
                x.auditStatus = x.AuditStatus
                x.refID = x.RefID
                x.ref1 = x.Ref1
                x.ref2 = x.Ref2
                x.ref3 = x.Ref3
                x.ref4 = x.Ref4
                x.options = optn
                x.parentDocumentItem_ID = x.ID
                x.incubationDay = x.IncubationDay
                x.ExpireDate = x.ExpireDates
                x.ProductionDate = x.ProductionDates
                x.expireDate = x.ExpireDates
                x.productionDate = x.ProductionDates
                x.shelfLifeDay = x.ShelfLifeDay

                return x
            })

        } else if (props.doccreateDocType === "picking") {
            docs.issueItems = doc.dataSourceItemTB.map(x => {
                x.unitType = x.UnitType_Code
                x.skuCode = x.Code
                x.quantity = x.DiffQty
                x.baseQuantity = x.BaseQuantity
                x.baseCode = x.BaseCode
                x.baseunitType = x.BaseUnitType_Code
                x.batch = x.Batch
                x.lot = x.Lot
                x.orderNo = x.OrderNo
                x.cartonNo = x.CartonNo
                x.itemNo = x.ItemNo
                x.auditStatus = x.AuditStatus
                x.refID = x.RefID
                x.ref1 = x.Ref1
                x.ref2 = x.Ref2
                x.ref3 = x.Ref3
                x.ref4 = x.Ref4
                x.options = optn
                x.parentDocumentItem_ID = x.ID
                x.incubationDay = x.IncubationDay
                x.ExpireDate = x.ExpireDates
                x.ProductionDate = x.ProductionDates
                x.expireDate = x.ExpireDates
                x.productionDate = x.ProductionDates
                x.shelfLifeDay = x.ShelfLifeDay
                return x
            })
        }


        if (Object.keys(docs).length > countDoc) {
           console.log(docs) 
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
                    {doc.dataSourceItemTB.length > 0 ? < AmButton
                        styleType="info"
                        onClick={() => {
                            OnCreateDocument();
                        }}
                    >CREATE</AmButton> : null}

                </div>
            </Grid>
        </Grid>

        <div>
            <AmDialogs
                typePopup={"success"}
                content={dia.dailogMsg ? dia.dailogMsg : ""}
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