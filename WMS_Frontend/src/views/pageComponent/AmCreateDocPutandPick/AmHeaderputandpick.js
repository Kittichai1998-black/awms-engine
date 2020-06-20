import PropTypes from "prop-types";
import React, { useState, useRef, createRef, useEffect, useContext } from "react";
import styled from 'styled-components'
import { withStyles } from "@material-ui/core/styles";
import { PutandPickContext } from './PutandPickContext';
import Grid from '@material-ui/core/Grid';
import LabelT from '../../../components/AmLabelMultiLanguage'
import AmDate from '../../../components/AmDate'
import AmDatepicker from '../../../components/AmDate'
import AmDropdown from '../../../components/AmDropdown'
import AmFindPopup from '../../../components/AmFindPopup'
import AmInput from '../../../components/AmInput'
import MuiDialogActions from "@material-ui/core/DialogActions"
import MuiDialogContent from "@material-ui/core/DialogContent"
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import AmTable from '../../../components/AmTable/AmTable'
import Dialog from "@material-ui/core/Dialog"
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Divider from '@material-ui/core/Divider';
import Typography from "@material-ui/core/Typography";
import { apicall, createQueryString } from "../../../components/function/CoreFunction";
const Axios = new apicall()


const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;

const LabelTStyle = {
    "font-weight": "bold",
    width: "200px"
}


const InputDiv = styled.div`
margin: 5px;
@media(max - width: 800px) {
    margin: 0;
}
`;


const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(0.5)
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.7),
        color: theme.palette.grey[500],
        padding: "3px"
    }
}))(props => {
    const { children, classes, onClose} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
           
                <IconButton
                    aria-label="Close"
                    size="small"
                    className={classes.closeButton}
                onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            
        </MuiDialogTitle>
    );
});
const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: "0 5px 0 5px",
    }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0
    }
}))(MuiDialogActions);

const useDocumentItemQuery = (docID, docItemQuery) => {
    const [docItemsQuery, setDocItemsQuery] = useState(docItemQuery)
    console.log(docID)
    useEffect(() => {
        if (docItemQuery != null && docID != undefined) {
            let objQuery = docItemQuery;
            if (objQuery !== null) {
                let Itemsqry = JSON.parse(objQuery.q);
                Itemsqry.push({ 'f': 'Document_ID', 'c': '=', 'v': docID })
                objQuery.q = JSON.stringify(Itemsqry);

            }

            setDocItemsQuery(objQuery)
        }
    }, [docID])
    return docItemsQuery
}





const AmHeaderputandpick = (props) => {
    const { doc } = useContext(PutandPickContext)
    const [createDocumentData, setcreateDocumentData] = useState({});
    const [dataDDLHead, setdataDDLHead] = useState({});
    const [valueFindPopup, setvalueFindPopup] = useState({});
    const DocItemsquery = useDocumentItemQuery(doc.docID, props.docItemQuery)
    const [defaultSelect, setDefaultSelect] = useState();
    const [dataSelect, setDataSelect] = useState([]);




    useEffect(() => {
        if (doc.docID != 0) {
            getData()
            
        }
    }, [doc.docID, DocItemsquery])

    const getDocItem = () => {
        return window.apipath + "/v2/GetSPSearchAPI?"
            + "&docID=" + doc.docID
            + "&spname=DOCITEM_LISTDRANDDI";
    }

    const getData = () => {
        if (getDocItem != undefined) {
            Axios.get(getDocItem()).then(res => {
                console.log(res.data.datas)
                if (res.data.datas != undefined && res.data.datas.length != 0) {
                    doc.setdatadocItem(res.data.datas);
                    doc.setdialogItem(true)
                } else {

                    getDocItemQuery(DocItemsquery)
                }

            })
        }
    }

    const getDocItemQuery = (DocItemsquerys) => {
        console.log(DocItemsquerys)
        Axios.get(createQueryString(DocItemsquerys)).then(res => {
            if (res.data.datas.length != 0) {
                console.log(res.data.datas)
                doc.setdatadocItem(res.data.datas);
                doc.setdialogItem(true)
            } else {


            }
        })
    }



    const onHandleChangeHeaderDDL = (value, dataObject, inputID, fieldDataKey, key) => {
        setdataDDLHead({
            [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
                key: key,
            }
        });
        createDocumentData[key] = value
        setcreateDocumentData(createDocumentData)
    }

    const onHandleChangeFindpopup = (value, dataObject, inputID, fieldDataKey, pair, key) => {
        setvalueFindPopup({
            [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
                key: key,
            }
        })
        createDocumentData[key] = value
        setcreateDocumentData(createDocumentData)
    }

    const onHandleChangeFindpopupDoc = (value, dataObject, inputID, fieldDataKey, pair, key) => {
        if (value != undefined) {
            doc.setdocID(value)

        }
    }

    const getHeaderCreate = () => {
        return props.docheaderCreate.map((x, xindex) => {
            return (
                <Grid key={xindex} container>
                    {x.map((y, yindex) => {
                        let syn = y.label ? " : " : "";
                        return (
                            <Grid item key={yindex} xs={12} sm={6} style={{ paddingLeft: "20px", paddingTop: "10px" }}>
                                <div style={{ marginTop: "5px" }}> <FormInline>
                                    <LabelT style={LabelTStyle}>{y.label + syn}</LabelT>
                                    {getDataHead(y, y)}
                                </FormInline></div>
                            </Grid>
                        )
                    })}
                </Grid>
            )
        })
    }

    const getDataHead = ({ type, key, idddls, pair, queryApi, columsddl, fieldLabel, texts, style, width, validate, valueTexts, placeholder, defaultValue, cols }, obj) => {
        if (type === "date") {
            return (
                <AmDate
                    TypeDate={"date"}
                    defaultValue
                    value={createDocumentData[key]}
                    onChange={(e) => {
                        if (e !== null) {
                            let docData = createDocumentData
                            docData[key] = e.fieldDataObject
                            setcreateDocumentData(docData)
                        } else { }
                    }}
                />
            )
        } else if (type === "dateTime") {
            return (
                <AmDate
                    TypeDate={"datetime-local"}
                    defaultValue
                    value={createDocumentData[key]}
                    onChange={(e) => {
                        if (e !== null) {
                            let docData = createDocumentData
                            docData[key] = e.fieldDataObject
                            setcreateDocumentData(docData)
                        } else { }
                    }}
                />
            )
        } else if (type === "input") {
            return (
                <AmInput
                    validate={true}
                    msgError="Error"
                    regExp={validate ? validate : ""}
                    //value={createDocumentData[key]}              
                    //style={style ? style : { width: "300px" }}

                    onChange={(e) => {
                        if (obj.search)
                            props.addList.search.find(x => x.accessor === key).defaultValue = e

                        let docData = createDocumentData
                        docData[key] = e
                        setcreateDocumentData(docData)
                    }}
                />
            )
        } else if (type === "labeltext") {
            //getTextsValue(key, valueTexts)
            return <label>{texts}</label>
        } else if (type === "dropdown") {
            return (
                <AmDropdown
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของกล่อง dropdown
                    valueData={dataDDLHead[idddls]} //ค่า value ที่เลือก
                    queryApi={queryApi}
                    //returnDefaultValue={true}
                    defaultValue={defaultValue ? defaultValue : ""}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeHeaderDDL(value, dataObject, inputID, fieldDataKey, key)}
                    ddlType={"search"} //รูปแบบ Dropdown 
                />
            )
        } else if (type === "datepicker") {
            return (
                <AmDatepicker
                    value={createDocumentData[key]}
                    TypeDate={"datetime-local"}
                    onChange={(e) => {
                        let docData = createDocumentData
                        docData[key] = e
                        setcreateDocumentData(docData)
                    }}
                />
            )
        } else if (type === "findPopUp") {
            return (
                <AmFindPopup
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                    valueData={valueFindPopup[idddls]} //ค่า value ที่เลือก
                    labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                    queryApi={queryApi} //object query string
                    columns={cols} //array column สำหรับแสดง table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของช่อง input
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopup(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        } else if (type === "findPopUpDoc") {
            return (
                <AmFindPopup
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                    valueData={valueFindPopup[idddls]} //ค่า value ที่เลือก
                    labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                    queryApi={queryApi} //object query string
                    columns={cols} //array column สำหรับแสดง table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของช่อง input
                    disabled={doc.docID ? true : false}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopupDoc(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        }
    }


    const onHandleClear = () => {
        doc.setdatadocItem()
        doc.setdialogItem(false)
        console.log(doc.dialogItem)
    }
    return <div>
        {getHeaderCreate()}
        <Dialog
            aria-labelledby="addpallet-dialog-title"
            onClose={() => { onHandleClear(); doc.setdialogItem(false); }}
            open={doc.dialogItem}
            maxWidth="xl"

        >

            <DialogTitle
                id="addpallet-dialog-title"
                onClose={() => { onHandleClear();}}>
                {"SKU ITEM"}
            </DialogTitle>
            <DialogContent>
                <AmTable
                    columns={props.doccolumnEditItem}
                    dataKey={"ID"}
                    dataSource={doc.dataDocItem ? doc.dataDocItem : []}
                    selectionDefault={defaultSelect}
                    selection="checkbox"
                    selectionData={data => setDataSelect(data)}
                    rowNumber={true}
                    //  totalSize={count}
                    pageSize={100}
                //height={500}
                />
            </DialogContent>
        </Dialog>
    </div>



}

AmHeaderputandpick.propTypes = {

}

AmHeaderputandpick.defaultProps = {

}

export default AmHeaderputandpick;