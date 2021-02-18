import React, { useContext, useState } from "react";
import AmButton from '../../../components/AmButton';
import { PutandPickContext } from './PutandPickContext';
import Grid from '@material-ui/core/Grid';
import { apicall } from "../../../components/function/CoreFunction";
import AmDialogs from '../../../components/AmDialogs'
import queryString from "query-string";
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


        const countDoc = Object.keys(docs).length
        for (let [key, value] of Object.entries(doc.dataCreate)) {
            if (key in docs)
                docs[key] = value
        }

        var qtyrandom = 'qtyrandom='
        var remark = 'remark='
        var pallet = 'palletcode='
        var optn;

        let dataOptions = doc.dataSourceItemTB.map(x => {
            let Options = x.options ? x.options : x.Options ? x.Options : null
            let qryStrOption = Options ? queryString.parse(Options) : {}
            let palletcode = x.palletcode ? x.palletcode : null
            let remarks = x.remark ? x.remark : null
            let qtyrd = x.qtyrandom ? x.qtyrandom : null

            //if (qryStrOption) {
            //    if (qryStrOption.remark && remarks) {
            //        Options = Options
            //        remarks = null
            //    } else {
            //        Options = Options
            //    }
            //}

            if (palletcode && remarks && Options && qtyrd) {
                qryStrOption["palletcode"] = palletcode
                qryStrOption["qtyrandom"] = qtyrd
                qryStrOption["remark"] = remarks

                //optn = Options + '&' +
                //    pallet.concat(palletcode) + '&' + qtyrandom.concat(qtyrd) + '&' +
                //    remark.concat(remarks)
            } else if (palletcode && remarks && Options) {
                qryStrOption["palletcode"] = palletcode
                qryStrOption["remark"] = remarks
            } else if (palletcode && Options && qtyrd) {
                qryStrOption["palletcode"] = palletcode
                qryStrOption["qtyrandom"] = qtyrd
            } else if (palletcode && remarks && qtyrd) {
                qryStrOption["palletcode"] = palletcode
                qryStrOption["qtyrandom"] = qtyrd
                qryStrOption["remark"] = remarks
            } else if (remarks && Options && qtyrd) {
                qryStrOption["qtyrandom"] = qtyrd
                qryStrOption["remark"] = remarks
            } else if (palletcode && Options) {
                qryStrOption["palletcode"] = palletcode
            } else if (palletcode && remarks) {
                qryStrOption["remark"] = remarks
            } else if (palletcode && qtyrd) {
                qryStrOption["palletcode"] = palletcode
                qryStrOption["qtyrandom"] = qtyrd
            } else if (remarks && qtyrd) {
                qryStrOption["qtyrandom"] = qtyrd
                qryStrOption["remark"] = remarks
            } else if (Options && qtyrd) {
                qryStrOption["qtyrandom"] = qtyrd
            } else if (remarks) {
                qryStrOption["remark"] = remarks
            } else if (palletcode) {
                qryStrOption["palletcode"] = palletcode
            } else if (Options) {
                optn = Options
            } else if (qtyrd) {
                qryStrOption["qtyrandom"] = qtyrd
            }

            return optn = queryString.stringify(qryStrOption)

        })

        if (props.doccreateDocType === "putAway") {
            docs.receiveItems = doc.dataSourceItemTB.map((x,i) => {
                x.unitType = x.UnitType_Code
                x.skuCode = x.Code
                x.quantity = x.DiffQty
                x.baseQuantity = x.BaseQuantity
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
                x.options = dataOptions[i]
                x.parentDocumentItem_ID = x.ID
                x.incubationDay = x.IncubationDay
                x.ExpireDate = x.ExpireDates
                x.ProductionDate = x.ProductionDates
                x.expireDate = x.ExpireDates
                x.productionDate = x.ProductionDates
                x.shelfLifeDay = x.ShelfLifeDay
                x.eventStatus = 10

                return x
            })

        } else if (props.doccreateDocType === "picking") {
            docs.issueItems = doc.dataSourceItemTB.map((x,i) => {
                x.unitType = x.UnitType_Code
                x.skuCode = x.Code
                x.quantity = x.DiffQty
                x.baseQuantity = x.BaseQuantity
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
                x.options = dataOptions[i]
                x.parentDocumentItem_ID = x.ID
                x.incubationDay = x.IncubationDay
                x.ExpireDate = x.ExpireDates
                x.ProductionDate = x.ProductionDates
                x.expireDate = x.ExpireDates
                x.productionDate = x.ProductionDates
                x.shelfLifeDay = x.ShelfLifeDay
                x.eventStatus = 10
                return x
            })
        }


        if (Object.keys(docs).length > countDoc) {
            //console.log(docs)
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
                    >CREATE</AmButton>: null}

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