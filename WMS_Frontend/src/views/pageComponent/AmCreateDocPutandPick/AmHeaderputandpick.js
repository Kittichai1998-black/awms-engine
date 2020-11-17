import PropTypes from "prop-types";
import React, { useState, useRef, createRef, useEffect, useContext } from "react";
import styled from 'styled-components'
import { withStyles } from "@material-ui/core/styles";
import { PutandPickContext } from './PutandPickContext';
import Grid from '@material-ui/core/Grid';
import LabelT from '../../../components/AmLabelMultiLanguage'
import AmDatepicker from '../../../components/AmDatePicker'
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
import AmButton from '../../../components/AmButton'
import queryString from "query-string";
import { apicall, createQueryString } from "../../../components/function/CoreFunction";
import moment from "moment";
import "moment/locale/pt-br";
import _ from "lodash";
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
    const { children, classes, onClose } = props;
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
    useEffect(() => {
        if (docItemQuery != null && docID != undefined && docID != 0) {
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
    const { doc, dia } = useContext(PutandPickContext)

    //const Dataheades = usedataHeader(props.docheaderCreate)
    const [createDocumentData, setcreateDocumentData] = useState({});
    const [dataDDLHead, setdataDDLHead] = useState({});
    const [valueFindPopup, setvalueFindPopup] = useState({});
    const DocItemsquery = useDocumentItemQuery(doc.docID, props.docItemQuery)
    const [dataSelect, setDataSelect] = useState([]);
    const [dataSelectSet, setDataSelectSet] = useState([]);
    const [valueQtyDocItems, setValueQtyDocItems] = useState([]);
    const [valueQtys, setvalueQtys] = useState([]);
    const [dataFromView, setdataFromView] = useState([]);
    const [dataFromSto, setdataFromSto] = useState([]);
    const [columnSet, setcolumnSet] = useState([]);
    const [columns, setcolumns] = useState();
    const [docCanCreate, setdocCanCreate] = useState();
    const [ChkCol, setChkCol] = useState(false)
    const [dataCheck, setdataCheck] = useState([]);



    useEffect(() => {
        if (doc.docID != 0 && doc.docID !== undefined) {
            doc.setdataSourceItemTB([])
            doc.setdatadocItem([])
            doc.setdataSet([])
            setdataCheck([])
            getData();
            GetdataItem(doc.docID) //getdataHeader
        }
    }, [doc.docID])


    useEffect(() => {
        if (doc.datadocItem > 0) {
            doc.setdialogItem(true)
        }
    }, [doc.datadocItem])

    useEffect(() => {
        if (props.docIDCreate !== undefined) {
            doc.setdocID(props.docIDCreate)
        }
    }, [props.docIDCreate])


    useEffect(() => {
        getDocCodedata();
    }, [])

    useEffect(() => {
        setdataCheck(dataCheck)
    }, [dataCheck])


    useEffect(() => {
        let dataHead = props.docheaderCreate.reduce((arr, el) => arr.concat(el), []).filter(x => x.valueTexts || x.defaultValue).reduce((arr, el) => {
            arr[el.key] = el.valueTexts || el.defaultValue
            createDocumentData[el.key] = el.valueTexts || el.defaultValue
            return arr
        }, {})
        //setcreateDocumentData(createDocumentData)
    }, [props.docheaderCreate])

    useEffect(() => {
        if (doc.datadocItem) {
            let newItems = _.filter(doc.datadocItem, function (o) { return o._balanceQty > 0; });
            saveDefaultInputQTY(newItems)
        }
    }, [doc.datadocItem]);

    useEffect(() => {
        if (doc.dataSet) {
            let newItems = _.filter(doc.dataSet, function (o) { return o._balanceQty > 0; });
            saveDefaultInputQTY(newItems)
        }
    }, [doc.dataSet]);

    useEffect(() => {
        doc.setdataCreate(createDocumentData)
    }, [createDocumentData])

    useEffect(() => {
        createDocumentData["parentDocumentID"] = doc.docID
    }, [doc.docID])


    useEffect(() => {
        console.log(columns)
    }, [columns])


    //const DocumentItemQueryss = (docID, docItemQuery) => {
    //    let ObQry;
    //        if (docItemQuery != null && docID != undefined && docID != 0) {
    //            let objQuery = docItemQuery;
    //            if (objQuery !== null) {
    //                let Itemsqry = JSON.parse(objQuery.q);
    //                Itemsqry.push({ 'f': 'Document_ID', 'c': '=', 'v': docID })
    //                objQuery.q = JSON.stringify(Itemsqry);

    //            }
    //            ObQry = objQuery
    //            //setDocItemsQuery(objQuery)
    //        }

    //    return ObQry
    //}



    const GetdataItem = (value) => {
        Axios.get(window.apipath + "/v2/GetDocAPI/?docTypeID=" + props.doctypeDocNo + "&docID=" +
            value + "&getMapSto=true").then((res => props.onChangeDoument(res.data.document)))
    }



    const setColums = () => {
        let datas
        setChkCol(true)
        props.doccolumnEditItem.forEach((x, i) => {

            if (x.accessor === "Quantity") {
                datas = {
                    width: 160, Header: x.Header, accessor: "Quantity", Cell: e => genInputQty(e.original)
                }    

            } else {
                datas = x
        
            }
            columnSet.push(datas)          
        })
        setcolumns(columnSet)
    }

    const getDocItem = () => {
        return window.apipath + "/v2/GetSPSearchAPI?"
            + "&docID=" + doc.docID
            + "&spname=DOCITEM_LISTDRANDDI";
    }


    const getDocCode = () => {
        return window.apipath + "/v2/GetSPSearchAPI?"
            + "&@docTypeID=" + props.doctypeDocNo
            + "&spname=DOC_CAN_CREATE";

    }

    const getData = () => {
        Axios.get(getDocItem()).then(res => {
            if (res.data.datas.length != 0) {
                //setdataFromSto(res.data.datas);
                setDataformStonandView(res.data.datas)
            }
        })
    }



    //const getDocItemQuery = (DocItemsquerys) => {
    //    Axios.get(createQueryString(DocItemsquerys)).then(res => {
    //        if (res.data.datas.length != 0 && res.data.datas != []) {
    //            setdataFromView(res.data.datas);

    //        } else {

    //        }

    //    })
    //}

    const getDocCodedata = () => {
        if (getDocItem != undefined) {
            Axios.get(getDocCode()).then(res => {
                if (res.data.datas != undefined && res.data.datas.length != 0) {
                    setdocCanCreate(res.data.datas)
                } else {
                    //getDocItemQuery(DocItemsquery)
                }
            })
        } else {

        }
    }
    //const FormatDataTB = () => {
    //    let datRes = [];
    //    if (dataFromSto && dataFromView) {
    //        let datasSto = [...dataFromSto]
    //        datasSto.forEach((dat, i) => {
    //            let findID = dataFromView.find(x => x.ID === dat.ID)
    //            if (findID !== undefined)
    //                datRes.push(dat)

    //        })
    //        let datasVie = [...dataFromView]
    //        datasVie.forEach((das, is) => {
    //            let findIDs = datRes.find(x => x.ID === das.ID)
    //            if (findIDs === undefined) {
    //                datRes.push(das)
    //            }

    //        })

    //        setDataformStonandView(datRes)
    //    } else {
    //        if (dataFromView) {
    //            setDataformStonandView(dataFromView)
    //        } else if (dataFromSto) {
    //            setDataformStonandView(dataFromSto)
    //        }
    //    }

    //}


    const setDataformStonandView = (res) => {
        let datasCheck = [];
        res.forEach((x, i) => {
            var QryOp = queryString.parse(x.Options)
            var datas = {
                ...x,
                ExpireDates: x.ExpireDate ? x.ExpireDate : null,
                ProductionDates: x.ProductionDate ? x.ProductionDate : null,
                ExpireDate: x.ExpireDate ? moment(x.ExpireDate).format("DD/MM/YYYY") : null,
                ProductionDate: x.ProductionDate ? moment(x.ProductionDate).format("DD/MM/YYYY") : null,
                AuditStatus: getAuditStatus(x.AuditStatus),
                //AuditStatus: x.AuditStatus ? x.AuditStatus : null,
                AuditStatuss: x.AuditStatus,
                Remark: QryOp.remark ? QryOp.remark : null,
                QtyMax: x.Quantity,
                PalletCode: QryOp.palletcode ? QryOp.palletcode : null
            }

            if (datas.DiffQty > 0) {
                datasCheck.push(datas)
            }
        })
        if (datasCheck.length > 0) {
            if (!ChkCol) {
                setColums();
            }
            doc.setdatadocItem(datasCheck);
            doc.setdataSet(datasCheck)
            doc.setdialogItem(true)

        } else {
            dia.setdailogMsg('Quantity document is Empty')
            dia.setdailogErr(true)
            doc.setdialogItem(false)
            doc.setdialogItemSet(false)

        }

    }

    const getAuditStatus = (status) => {
        if (status === 0) {
            return 'QUARANTINE'
        } else if (status === 1) {
            return 'PASSED'
        } else if (status === 2) {
            return 'REJECTED'
        } else if (status === 9) {
            return 'HOLD'
        } else if (status) {
            return status
        }
    }



    const saveDefaultInputQTY = (docitems) => {
        let valueQTY = {};
        docitems.forEach(datarow => {
            let field = "item-" + datarow.ID;
            valueQTY = {
                ...valueQTY, [field]: {
                    recQty: datarow._balanceQty,
                    docItemID: datarow.ID
                }
            }
        });
        setValueQtyDocItems(valueQTY);
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
        if (value) {
            if (key === 'documentProcessTypeID') {
                props.onChangeProcessType(value);
                createDocumentData[key] = value
                setcreateDocumentData(createDocumentData)

            }
            createDocumentData[key] = value
            setcreateDocumentData(createDocumentData)
        } else {
        }
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

    const onHandleChangeFindpopupDoc = (value) => {
        if (value != undefined) {
            doc.setdocID(value)
        }
    }

    const onChangeEditor = (value, obj, element, event, datarow) => {
        if (doc.dataSourceItemTB.length === 0) {
            let qtys = datarow.DiffQty

            //if (value > qtys) {
            //    dia.setdailogMsg('Quantity Max')
            //    dia.setdailogErr(true)

            //} else if (value <= qtys) {
            let datas = {

                recQty: parseFloat(value),
                docItemID: datarow.ID
            }


            valueQtys.push(datas)
            setDataSelect([]);
            //}
        } else {
            //if (value > datarow.DiffQty) {
            //dia.setdailogMsg('Quantity Max')
            //dia.setdailogErr(true)


            //} else if (value <= datarow.DiffQty) {
            let datas = {
                recQty: parseFloat(value),
                docItemID: datarow.ID

            }
            valueQtys.push(datas)
            setDataSelect([]);
            //}

        }
        setValueQtyDocItems(valueQtys)

    }

    const onSubmitAddItem = () => {
        if (!valueQtyDocItems.length) {
            let checks;
            dataSelect.forEach((xs, i) => {
                checks = doc.dataSourceItemTB.find(x => x.ID === dataSelect[i].ID);
                if (checks === undefined) {
                    doc.dataSourceItemTB.push(
                        {
                            ...xs,
                            AuditStatus: getAuditStatus(xs.AuditStatus)
                        })
                }
                else {
                    //dia.setdailogMsg("SKUItem dupicate")
                    //dia.setdailogErr(true)

                }

            })
            doc.seteditdata([]);
            setDataSelect([]);
            doc.setdialogItem(false)
            doc.setdialogItemSet(false)

        } else {
            let dataSelect2 = [];
            let datavlue = [];
            let Checkdataselect = 0;
            if (dataSelect) {
                if (valueQtyDocItems.length > 0) {
                    dataSelect2 = dataSelect.map((x, idx) => {
                        const found = doc.dataSourceItemTB.find(x => x.ID === dataSelect[idx].ID);
                        const CheckID = valueQtyDocItems.find(xy => xy.docItemID === x.ID)
                        //console.log(found)
                        if (CheckID && !found) {
                            if (CheckID.recQty <= x.Quantity) {
                                x.DiffQty = CheckID.recQty

                            } else {
                                dia.setdailogMsg("Quantity is Max");
                                dia.setdailogErr(true)
                            }
                            return x;
                        } else if (!found) {
                            return x
                        } else {
                            //dia.setdailogMsg("Item Dupicate");
                            //dia.setdailogErr(true)
                        }
                    })
                    //if (Checkdataselect === 1) {
                    //    dia.setdailogMsg("SKUItem dupicate")
                    //    dia.setdailogErr(true)
                    //    Checkdataselect = 0

                    //} else {   
                    if (doc.dataSourceItemTB.length === 0) {
                        dataCheck.push(dataSelect2);
                        doc.setdataSourceItemTB(dataSelect2);
                        doc.setdialogItem(false)
                    } else {
                        dataSelect2.forEach((x, i) => {
                            if (x) {
                                doc.dataSourceItemTB.push(dataSelect2[i])
                                dataCheck.push(dataSelect2);
                            }
                        })
                        doc.setdialogItem(false)
                    }
                    //}

                    //} else {
                    //    dia.setdailogMsg("Quantity Max");
                    //    dia.setdailogErr(true)
                    //    //doc.setdataSourceItemTB(dataSelect);
                }

            } else {
                if (doc.editdata.length != 0) {
                    let idx = doc.dataSourceItemTB.findIndex(x => x.ID === doc.editdata.ID);
                    doc.dataSourceItemTB.splice(idx, 1);
                    doc.setdataSourceItemTB([...doc.dataSourceItemTB])
                    doc.setdialogItem(false)
                } else {
                    dia.setdailogMsg("Select SKU Pls");
                    dia.setdailogErr(true)
                }
            }


        }
        doc.seteditdata([]);
        setDataSelect([]);
        doc.setdialogItem(false)
        doc.setdialogItemSet(false)
    }

    const genInputQty = (datarow) => {
        console.log(datarow)
        console.log(dataCheck)
        let defaultQty = datarow.DiffQty;
        return <AmInput id={datarow.ID}
            style={{ width: "100px" }}
            type="input"
            defaultValue={defaultQty}
            onChange={(value, obj, element, event) => onChangeEditor(value, obj, element, event, datarow)}
        />

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
                <AmDatepicker
                    TypeDate={"date"}
                    defaultValue
                    style={{ width: width ? width : '300px' }}
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
                <AmDatepicker
                    TypeDate={"datetime-local"}
                    defaultValue
                    value={createDocumentData[key]}
                    style={{ width: width ? width : '300px' }}
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
                    style={{ width: width ? width : "300px" }}
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
        } else if (type === "labeltext" && valueTexts !== undefined) {
            let docData = createDocumentData
            docData[key] = valueTexts
            return setcreateDocumentData(docData)
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
                    returnDefaultValue={true}
                    defaultValue={defaultValue ? defaultValue : ""}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeHeaderDDL(value, dataObject, inputID, fieldDataKey, key)}
                    ddlType={"search"} //รูปแบบ Dropdown 
                />
            )
        } else if (type === "datepicker") {
            return (
                <AmDatepicker
                    value={createDocumentData[key]}
                    style={{ width: width ? width : '300px' }}
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
                    // returnDefaultValue={true}
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
                    disabled={doc.dataSourceItemTB.length > 0 ? true : false}
                    defaultValue={doc.docID ? doc.docID : null}
                    onChange={(value) => onHandleChangeFindpopupDoc(value)}
                />
            )
        } else if (type === "findPopUpDoccan") {
            return (
                <AmDropdown
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb              
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                    valueData={valueFindPopup[idddls]} //ค่า value ที่เลือก
                    labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                    //queryApi={queryApi} //object query string
                    data={docCanCreate ? docCanCreate : null}
                    columns={cols} //array column สำหรับแสดง table
                    width={width ? width : 300}
                    ddlType={"search"}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของช่อง input
                    disabled={doc.dataSourceItemTB.length > 0 ? true : false}
                    defaultValue={doc.docID ? doc.docID : null}
                    onChange={(value) => onHandleChangeFindpopupDoc(value)}
                />
            )
        }
    }


    const onHandleClear = () => {
        doc.setdatadocItem([])
        //doc.setdocID(0)
        doc.setdialogItem(false);
        doc.setdialogItem(false);
    }

    const selectionDisabledCustoms = (data) => {
        let check = doc.dataSourceItemTB.find(x => x.ID === data.ID);
        if (check === undefined)
            return false
        else
            return true
    }


    return <div>
        {getHeaderCreate()}
        <Dialog
            aria-labelledby="addpallet-dialog-title"
            onClose={() => { onHandleClear(); doc.setdialogItem(false); }}
            open={doc.dialogItem}
            maxWidth="xl">

            <DialogTitle
                id="addpallet-dialog-title"
                onClose={() => { onHandleClear(); doc.setdialogItem(false); }}>
                {"ITEM"}
            </DialogTitle>
            <DialogContent>
                    <AmTable
                        columns={columns}
                        dataKey={"ID"}
                        tableConfig={false}
                        dataSource={doc.datadocItem.length != 0 ? doc.datadocItem : []}
                        selectionDefault={doc.datadocItem}
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={false}
                        //  totalize={count}
                    pageSize={100}
                    minRows={ 20}
                    height='200px'
                    />
            </DialogContent>
            <DialogActions>
                <AmButton
                    styleType="add"
                    onClick={() => {
                        onSubmitAddItem();
                    }}
                >Add</AmButton>
            </DialogActions>
        </Dialog>

        <Dialog
            aria-labelledby="addpallet-dialog-title"
            onClose={() => { onHandleClear(); doc.setdialogItemSet(false); }}
            open={doc.dialogItemSet}
            maxWidth="xl">

            <DialogTitle
                id="addpallet-dialog-title"
                onClose={() => { onHandleClear(); doc.setdialogItemSet(false); }}>
                {"ITEM"}
            </DialogTitle>
            <DialogContent>
                    <AmTable
                        columns={columns}
                        dataKey={"ID"}
                        dataSource={doc.dataSet}
                        selectionDefault={doc.dataSourceItemTB}
                        tableConfig={false}
                        selection="checkbox"
                        selectionData={(data) => { setDataSelect(data) }}
                        selectionDisabledCustom={(e) => { return selectionDisabledCustoms(e) }}
                        //selectionDisabledCustom={doc.dataSourceItemTB ? doc.dataSourceItemTB : false}
                        rowNumber={false}
                        //  totalize={count}
                        pageSize={100}
                    height="500px"
                    />
          
            </DialogContent>
            <DialogActions>
                <AmButton
                    styleType="add"
                    onClick={() => {
                        onSubmitAddItem();
                    }}
                >Add</AmButton>
            </DialogActions>
        </Dialog>


    </div>



}

AmHeaderputandpick.propTypes = {

}

AmHeaderputandpick.defaultProps = {

}

export default AmHeaderputandpick;