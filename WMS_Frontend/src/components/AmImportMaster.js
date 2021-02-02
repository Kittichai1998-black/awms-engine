import React, { useState, useEffect } from 'react';
import AmButton from './AmButton'
import XLSX from 'xlsx';
import { apicall, createQueryString } from "./function/CoreFunction2";
import AmDialogs from './AmDialogs'
import { makeStyles } from "@material-ui/core/styles";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
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

const AmImportMaster = (props) => {
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

        if (filesRead !== undefined) {
            if (rABS) {
                reader.readAsBinaryString(filesRead);
            } else {
                reader.readAsArrayBuffer(filesRead);
            };
        }

        reader.onload = (e) => {
            /* Parse data */
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
            /* Get first worksheet */

            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            // console.log(data)
            if (data.length === 0) {
                setMsgDialog("File Not Found");
                setStateDialogErr(true);
            } else {
                data.forEach(x => {
                    x["ID"] = null
                    x["Status"] = 1
                })
                let updjson = {
                    "t": props.table,
                    "pk": "ID",
                    "datas": data,
                    "nr": false,
                    "_token": localStorage.getItem("Token")
                }
                dataSandApi(updjson)
            }
        };



    }



    const dataSandApi = (data) => {
        Axios.put(window.apipath + "/v2/InsUpdDataAPI", data).then(res => {
            if (res.data._result !== undefined) {
                if (res.data._result.status === 1) {
                    setMsgDialog("Success");
                    setStateDialog(true);
                    props.onSuccess(true);
                } else {
                    setMsgDialog(res.data._result.message);
                    setStateDialogErr(true);
                }
            }
        });
    }

    return (
        <div style={{ float: "right" }}>
            <input
                accept="/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={(e) => readFile(e)}
            />

            <AmDialogs typePopup={"success"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
        </div>
    );
};


export default (AmImportMaster);
