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

            getHeaderdata(headerDatas, dataJson)

        };
        if (rABS) {
            reader.readAsBinaryString(filesRead);
        } else {
            reader.readAsArrayBuffer(filesRead);
        };
    }
    const getHeaderdata = (datas, dataJsonItem) => {
        let datsobj = datas.slice(0, 5)
        let datsobjItem = datas.slice(10)
        let datsobjItemCheck = datas.slice(5, 9)
        let dataItems = [];
        let dataHdr = [];
        let dataCreate = [];
        if (datsobj !== undefined) {
            let datH = datsobj.forEach((x, i) => {
                let datas = {
                    "documentProcessTypeName": datsobj[0][1],
                    "documentDate": datsobj[0][3],
                    "souCustomerCode": datsobj[1][1],
                    "actionTime": datsobj[1][3],
                    "souSupplierCode": datsobj[2][1],
                    "souWarehouseCode": datsobj[3][1],
                    "desWarehouseCode": datsobj[3][3],
                    "forCustomerCode": datsobj[4][1],
                    "remark": datsobj[4][3],

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
                    if (x[13] !== undefined && x[14] !== undefined) {
                        let Incubate = x[13]
                        let Producdate = x[14]
                        var DateProduct = moment(Producdate).format('DD-MM-YYYYTHH: mm: ss');     
                        console.log(DateProduct)
                        let DayIn = Incubate.split("-");
                        let DayPro = Producdate.split("-");
                        if (DayIn !== undefined || DayPro !== undefined)
                        var IntDayIn = parseInt(DayIn[0])
                        var IntDayPro = parseInt(DayPro[0])
                        let Incubatedays = (IntDayIn - IntDayPro)
                        if (Incubatedays < 1) {
                            setMsgDialog("Incubateday Not Correct");
                            setStateDialogErr(true);

                        } else {
                            console.log(Incubatedays)
                            if (i > 0) {
                                let datsItem = {
                                    "itemNo": x[0],
                                    "skuCode": x[1],
                                    "orderNo": x[2],
                                    "batch": x[3],
                                    "lot": x[4],
                                    "quantity": x[5],
                                    "unitType": x[6],
                                    "auditStatus": x[7] === "PASS" ? 1 : 0,
                                    "ref1": x[8],
                                    "ref2": x[9],
                                    "ref3": x[10],
                                    "ref4": x[11],
                                    "cartonNo": x[12],
                                    "incubationDay": Incubatedays,
                                    "productionDate": Producdate,
                                    "expireDate": x[15],
                                    "shelfLifeDate": x[16],


                                }
                                dataItems.push(datsItem)
                            } else {

                            }

                        }
                    } else {

                        if (i > 0) {
                            let datsItem = {
                                "itemNo": x[0],
                                "skuCode": x[1],
                                "orderNo": x[2],
                                "batch": x[3],
                                "lot": x[4],
                                "quantity": x[5],
                                "unitType": x[6],
                                "auditStatus": x[7] === "PASS" ? 1 : 0,
                                "ref1": x[8],
                                "ref2": x[9],
                                "ref3": x[10],
                                "ref4": x[11],
                                "cartonNo": x[12],
                                "incubationDay": x[13],
                                "productionDate": x[14],
                                "expireDate": x[15],
                                "shelfLifeDate": x[16],


                            }
                            dataItems.push(datsItem)
                        } else {

                        }
                    }
                })
                dataHdr[0]['receivedOrderItem'] = dataItems
                //console.log(dataHdr[0])
                CreateDocuments(dataHdr[0])

            
        }

    }


}


const CreateDocuments = (CreateData) => {
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

return (
    <div>
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
            >  Chose Files
        </AmButton>
            <label>{filesname}</label>
        </label>
        <AmButton styleType="add"
            onClick={() => ConvertJsoon()}
        >  CreateDocument
        </AmButton>
        <AmDialogs typePopup={"success"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
        <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
    </div>
);
};


export default (AmImportDocumentExcel);
