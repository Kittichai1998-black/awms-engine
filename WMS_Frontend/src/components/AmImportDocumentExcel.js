import React, { useState, useEffect } from 'react';
import AmButton from '../components/AmButton'
import XLSX from 'xlsx';
import { apicall, createQueryString } from "../components/function/CoreFunction2";
import AmDialogs from '../components/AmDialogs'
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import "moment/locale/pt-br";

const Axios = new apicall()
const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: "none"
    }
}));

const AmImportDocumentExcel = (props) => {

    const classes = useStyles();
    const [filesname, setfilesname] = useState("Chose File")
    const [filesRead, setfilesRead] = useState();
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);


    useEffect(() => {
        if (filesname !== undefined) {
            ConvertJsoon();
        }

    }, [filesname])

    const readFile = (e) => {
        const files = e.target.files;
        setfilesRead(files[0])
        setfilesname(files[0].name)     
    }

    const ConvertJsoon = () => {
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
            /* Parse data */
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
            /* Get first worksheet */

            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            const headerDatas = XLSX.utils.sheet_to_json(ws, { header: 1 })
            let dataJson = JSON.stringify(data, null, 2)
            if (headerDatas !== undefined) {
                getHeaderdata(headerDatas)
            }
        };

        console.log(filesRead)
        if (filesRead !== undefined) {
            if (rABS) {
                reader.readAsBinaryString(filesRead);
            } else {

                reader.readAsArrayBuffer(filesRead);
            };
        } else {
            //setMsgDialog("File not Found");
            //setStateDialogErr(true);

        }
    }
    const getHeaderdata = (datas) => {
        let datsobj = datas.slice(0, 5)
        let datsobjItem = datas.slice(10)
        let datsobjItemCheck = datas.slice(5, 9)
        let dataItems = [];
        let dataHdr = [];
        var DocumentProcessType;
        if (datsobj !== undefined) {
            let datH = datsobj.forEach((x, i) => {

                var datedoc = datsobj[0][3];
                var actionT = datsobj[1][3]
                var docdate = datedoc.split('-')
                var DocumentDate = docdate[2].concat('-').concat(docdate[1]).concat('-').concat(docdate[0]);
                var actime = actionT.split('-')
                var ActionTime = actime[2].concat('-').concat(actime[1]).concat('-').concat(actime[0]);
                DocumentProcessType = datsobj[0][1];
                let datas;

                if (props.docTypename === "receive") {
                    datas = {
                        "documentProcessTypeCode": datsobj[0][1],
                        "documentDate": DocumentDate,
                        "souCustomerCode": datsobj[1][1],
                        "actionTime": ActionTime,
                        "souSupplierCode": datsobj[2][1],
                        "souWarehouseCode": datsobj[3][1],
                        "desWarehouseCode": datsobj[3][3],
                        "forCustomerCode": datsobj[4][1],
                        "remark": datsobj[4][3],

                    }
                } else if (props.docTypename === "issue") {
                    datas = {
                        "documentProcessTypeCode": datsobj[0][1],
                        "documentDate": DocumentDate,
                        "souCustomerCode": datsobj[1][1],
                        "actionTime": ActionTime,
                        "souSupplierCode": datsobj[2][1],
                        "desCustomerCode": datsobj[2][3],
                        "souWarehouseCode": datsobj[3][1],
                        "desSupplierCode": datsobj[3][3],
                        "deswarehouseCode": datsobj[4][3],
                        "forCustomerCode": datsobj[5][1],
                        "remark": datsobj[5][3],
                    }



                }
                dataHdr.push(datas)
            })

        }

        let dataChexck;
        datsobjItemCheck.forEach((x, i) => {
            dataChexck = datsobjItemCheck[i][i]
        })
        if (dataChexck != undefined) {
            setMsgDialog(" Format Data Not Correct");
            setStateDialogErr(true);
        } else {
            if (datsobjItem !== undefined) {
                datsobjItem.forEach((x, i) => {
                    if (x[13] !== undefined && x[14] !== undefined || x[15] !== undefined && x[16] !== undefined) {
                        let Incubate = props.docTypename === "receive"  ?  x[13] :x[14]
                        let Producdate = props.docTypename === "receive" ? x[14] : x[15]
                        let Expire = props.docTypename === "receive" ? x[15] :x[16]
                        let Shelf = props.docTypename === "receive" ? x[16]: x[17]
                        let DayIn = Incubate.split("-");
                        let DayPro = Producdate.split("-");
                        let DayExp = Expire.split("-");
                        let DayShelf = Shelf.split("-");
                        var IntDayIn = parseInt(DayIn[0])
                        var IntDayPro = parseInt(DayPro[0])
                        var IntDayExp = parseInt(DayExp[0])
                        var IntDayShelf = parseInt(DayShelf[0])
                        let Incubatedays = (IntDayIn - IntDayPro)
                        let Shelfdays = (IntDayShelf - IntDayExp)
                        var AuditStatus = x[7];
                        var VandorLot = x[8];
                        let datsItem;
                        if (i > 0) {
                            var ProducDatess = DayPro[2].concat('-').concat(DayPro[1]).concat('-').concat(DayPro[0]);
                            var Expiredatess = DayShelf[2].concat('-').concat(DayShelf[1]).concat('-').concat(DayShelf[0]);

                            if (props.docTypename === "receive") {
                                datsItem = {
                                    "itemNo": x[0],
                                    "skuCode": x[1],
                                    "orderNo": x[2],
                                    "batch": x[3],
                                    "lot": x[4],
                                    "quantity": x[5],
                                    "unitType": x[6],
                                    "auditStatus": x[7],
                                    "ref1": x[8],
                                    "ref2": x[9],
                                    "ref3": x[10],
                                    "ref4": x[11],
                                    "cartonNo": x[12],
                                    "incubationDay": Incubatedays,
                                    "productionDate": ProducDatess,
                                    "expireDate": Expiredatess,
                                    "shelfLifeDay": Shelfdays,


                                }
                            } else if (props.docTypename === "issue") {
                                datsItem = {
                                    "itemNo": x[0],
                                    "palletcode" :x[1],
                                    "skuCode": x[2],
                                    "orderNo": x[3],
                                    "batch": x[4],
                                    "lot": x[5],
                                    "quantity": x[6],
                                    "unitType": x[7],
                                    "auditStatus": x[8],
                                    "ref1": x[9],
                                    "ref2": x[10],
                                    "ref3": x[11],
                                    "ref4": x[12],
                                    "cartonNo": x[13],
                                    "incubationDay": Incubatedays,
                                    "productionDate": ProducDatess,
                                    "expireDate": Expiredatess,
                                    "shelfLifeDay": Shelfdays,

                                }
                            }


                            dataItems.push(datsItem)

                        }

                        var DocumentProcessTypeS = DocumentProcessType.split(" ")
                        if (DocumentProcessTypeS[0] = "PM:การรับเข้า/รับคืน") {
                            if (DocumentProcessTypeS[1] = "จากไลน์ผลิต") {
                                if (AuditStatus = "QUARANTINE") {
                                    dataItems = dataItems
                                } else {
                                    dataItems = [{
                                        "Check": false
                                    }]
                                    setMsgDialog("Audit Status Not Correct");
                                    setStateDialogErr(true);
                                }

                            }
                        } else if (DocumentProcessTypeS[0] = "PM:การรับเข้าจาก") {

                            if (DocumentProcessTypeS[1] = "Supplier") {
                                console.log(VandorLot)
                                if (VandorLot = null) {
                                    dataItems = [{
                                        "Check": false
                                    }]
                                    setMsgDialog("Vandor Lot Not Correct");
                                    setStateDialogErr(true);
                                }
                            }
                        } else {
                            if (VandorLot != null) {
                                dataItems = [{
                                    "Check": false
                                }]
                                setMsgDialog("Vandor Lot Not Correct");
                                setStateDialogErr(true);
                            }

                        }


                        if (Incubatedays !== undefined || Shelfdays !== undefined) {
                            if (Incubatedays < 1) {
                                dataItems = [{
                                    "Check": false
                                }]
                                setMsgDialog("Incubateday Not Correct");
                                setStateDialogErr(true);
                            } else if (Shelfdays < 1) {
                                dataItems = [{
                                    "Check": false
                                }]
                                setMsgDialog("ShelfLifeDate Not Correct");
                                setStateDialogErr(true);
                            } else {

                            }

                        } else {
                        
                        }
                    }


                })
            
                dataHdr[0]['receivedOrderItem'] = dataItems
                CreateDocuments(dataHdr[0])

            }

        }


    }


    const CreateDocuments = (CreateData) => {
        CreateData.receivedOrderItem.forEach((x, i) => {
            if (x.Check === false) {
                CreateData.receivedOrderItem = []
            }

        })

        if (CreateData.receivedOrderItem !== [] || CreateData.receivedOrderItem !== undefined) {
            Axios.post(window.apipath + props.apicreate, CreateData).then((res) => {
                if (res.data._result.status) {
                    setMsgDialog("Create Document success Document ID = " + res.data.ID);
                    setStateDialog(true);
                    if (props.apiRes !== undefined)
                        props.history.push(props.apiRes + res.data.ID)
                } else {
                    setMsgDialog(res.data._result.message);
                    setStateDialogErr(true);
                }
            })
        }
    }

    return (
        <div>
            {/*<AmButton styleType="add"
                onClick={() => ConvertJsoon()}
            >  CreateDocument
        </AmButton>*/}

            <input
                accept="/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={(e) => readFile(e)}
            />
            <label htmlFor="contained-button-file">
                <AmButton variant="contained" styleType="info" component="span"
                >  Create Docment 
        </AmButton>

            </label>
         
            <AmDialogs typePopup={"success"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
        </div>
    );
};


export default (AmImportDocumentExcel);
