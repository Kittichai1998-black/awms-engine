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
import AmButton from '../../../components/AmButton'
import { apicall, createQueryString } from "../../../components/function/CoreFunction";
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
                //onClick={onClose}
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
    const dataHeader = props.docheaderCreate.reduce((arr, el) => arr.concat(el), []).filter(x => x.valueTexts || x.defaultValue).reduce((arr, el) => {
        arr[el.key] = el.valueTexts || el.defaultValue
        return arr
    }, {})
    const [createDocumentData, setcreateDocumentData] = useState(dataHeader);
    const [dataDDLHead, setdataDDLHead] = useState({});
    const [valueFindPopup, setvalueFindPopup] = useState({});
    const DocItemsquery = useDocumentItemQuery(doc.docID, props.docItemQuery)
    const [defaultSelect, setDefaultSelect] = useState();
    const [dataSelect, setDataSelect] = useState([]);
    const [valueQtyDocItems, setValueQtyDocItems] = useState([]);

    const columns = [
        ...props.doccolumnEditItem,
        {
            width: 160, Header: "Quantity", accessor: "Quantity", Cell: e =>
                genInputQty(e.original)
        },
        { Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" },

    ];

    useEffect(() => {
        if (doc.docID != 0) {
            getData();

        }
    }, [doc.docID])

    useEffect(() => {
        if (createDocumentData !== undefined) {
            setDataHeader(createDocumentData);
        }
    }, [createDocumentData])

    useEffect(() => {
        if (doc.datadocItem && doc.dialogItem) {
            let newItems = _.filter(doc.datadocItem, function (o) { return o._balanceQty > 0; });
            //setListDocItems(newItems)
            //setDefaultSelect([...newItems]);
            saveDefaultInputQTY(newItems)

        }
    }, [doc.datadocItem, doc.dialogItem]);




    const getDocItem = () => {
        return window.apipath + "/v2/GetSPSearchAPI?"
            + "&docID=" + doc.docID
            + "&spname=DOCITEM_LISTDRANDDI";
    }

    const setDataHeader = (datas) => {
        doc.setdataCreate(datas)

    }

    const getData = () => {

        if (getDocItem != undefined) {
            Axios.get(getDocItem()).then(res => {
                if (res.data.datas != undefined && res.data.datas.length != 0) {
                    doc.setdatadocItem(res.data.datas);
                    doc.setdialogItem(true)
                } else {

                    getDocItemQuery(DocItemsquery)
                }

            })
        } else {
            getDocItemQuery(DocItemsquery)
        }
    }

    const getDocItemQuery = (DocItemsquerys) => {
        Axios.get(createQueryString(DocItemsquerys)).then(res => {
            if (res.data.datas.length != 0 && res.data.datas != []) {
                doc.setdatadocItem(res.data.datas);
                doc.setdialogItem(true)
            } else {


            }
        })
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

    const onChangeEditor = (value, obj, element, event, datarow) => {
        if (datarow.Qty && doc.dataSourceItemTB.length === 0) {
            let qtys = datarow.Quantity - datarow.Qty
            if (value > qtys) {
                dia.setdailogMsg('Quantity Max')
                dia.setdailogErr(true)
               
            } else if (value <= qtys) {
                setValueQtyDocItems({
                    ...valueQtyDocItems, [element.id]: {
                        recQty: parseFloat(value),
                        docItemID: datarow.ID
                    }
                });
            }
        } else {
            if (value > datarow.Quantity) {
                dia.setdailogMsg('Quantity Max')
                dia.setdailogErr(true)
             

            } else if (value <= datarow.Quantity) {
                setValueQtyDocItems({
                    ...valueQtyDocItems, [element.id]: {
                        recQty: parseFloat(value),
                        docItemID: datarow.ID
                    }
                });
            }
        }
        //doc.setdialogItem(false)
    }

    const onSubmitAddItem = () => {
        if (dataSelect.length != 0) {
            if (valueQtyDocItems.length != 0) {
                dataSelect.map((x, idx) => {
                    if (valueQtyDocItems[x.ID] !== undefined) {
                        return x.Quantity = valueQtyDocItems[x.ID].recQty
                    } else {

                        if (x.Qty && doc.dataSourceItemTB.length === 0) {
                            let Quantitys = x.Quantity - x.Qty
                            if (Quantitys > 0) {
                                return x.Quantity = Quantitys
                            } else {
                                return x.Quantity = x.Quantity
                            }
                        }
                        else if (x.Qty === undefined) {

                            return x.Quantity = x.Quantity
                        } else if (x.Quantity === 0) {
                            dia.setdailogMsg("Document dupicate")
                            dia.setdailogErr(true)
                        }
                    }

                })
                if (doc.dataSourceItemTB.length === 0) {
                    doc.setdataSourceItemTB(dataSelect);
                    doc.setdialogItem(false)
                } else {
                    dataSelect.forEach((x, i) => {
                        doc.dataSourceItemTB.push(dataSelect[i])
                    })
                  
                    doc.setdialogItem(false)
                    

                }
                
            } else {
                dia.setdailogMsg("Quantity Max");
                dia.setdailogErr(true)
                //doc.setdataSourceItemTB(dataSelect);

            }

        } else {
            if (doc.editdata.length != 0) {
                let idx = doc.dataSourceItemTB.findIndex(x => x.ID === doc.editdata.ID);
                doc.dataSourceItemTB.splice(idx, 1);
                doc.setdataSourceItemTB([...doc.dataSourceItemTB])
                doc.setdialogItem(false)
            } else {
                dia.setdailogMsg("Seelct SKU Pls");
                dia.setdailogErr(true)
            }
        }
        doc.seteditdata([]);
    }

    const genInputQty = (datarow) => {
        let defaultQty;
        if (datarow.Qty != undefined && doc.dataSourceItemTB.length == 0 && datarow.Quantity - datarow.Qty > 0) {
            defaultQty = datarow.Quantity - datarow.Qty
        } else if (datarow.Quantity - datarow.Qty > 0) {
            defaultQty =  datarow.Quantity - datarow.Qty 
        } else {
            defaultQty = datarow.Quantity
        }

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
                    fieldDataKey="ID" //���촴Column ���ç�Ѻtable �db 
                    fieldLabel={fieldLabel} //���촷���ͧ�����ʴ���� optionList ��� ��ͧ input
                    labelPattern=" : " //�ѭ�ѡɳ����ͧ��â�������ҧ����
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//��˹��������ҧ�ͧ���ͧ dropdown
                    valueData={dataDDLHead[idddls]} //��� value ������͡
                    queryApi={queryApi}
                    //returnDefaultValue={true}
                    defaultValue={defaultValue ? defaultValue : ""}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeHeaderDDL(value, dataObject, inputID, fieldDataKey, key)}
                    ddlType={"search"} //�ٻẺ Dropdown 
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
                    fieldDataKey="ID" //���촴Column ���ç�Ѻtable �db 
                    labelPattern=" : " //�ѭ�ѡɳ����ͧ��â�������ҧ����
                    fieldLabel={fieldLabel} //���촷���ͧ�����ʴ���� ��ͧ input
                    valueData={valueFindPopup[idddls]} //��� value ������͡
                    labelTitle="Search of Code" //��ͤ����ʴ��˹��popup
                    queryApi={queryApi} //object query string
                    columns={cols} //array column ����Ѻ�ʴ� table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//��˹��������ҧ�ͧ��ͧ input
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopup(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        } else if (type === "findPopUpDoc") {
            return (
                <AmFindPopup
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //���촴Column ���ç�Ѻtable �db 
                    labelPattern=" : " //�ѭ�ѡɳ����ͧ��â�������ҧ����
                    fieldLabel={fieldLabel} //���촷���ͧ�����ʴ���� ��ͧ input
                    valueData={ valueFindPopup[idddls]} //��� value ������͡
                    labelTitle="Search of Code" //��ͤ����ʴ��˹��popup
                    queryApi={queryApi} //object query string
                    columns={cols} //array column ����Ѻ�ʴ� table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//��˹��������ҧ�ͧ��ͧ input
                    disabled={doc.docID ? true : false}
                    defaultValue={doc.docID ? doc.docID : ""}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopupDoc(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        }
    }


    const onHandleClear = () => {
        //doc.setdatadocItem([])
        doc.setdocID(0)
        doc.setdialogItem(false)
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
                onClose={() => { onHandleClear(); doc.setdocID(0) }}>
                {"SKU ITEM"}
            </DialogTitle>
            <DialogContent>
                <div>
                    <AmTable
                        columns={columns}
                        dataKey={"ID"}
                        dataSource={doc.datadocItem.length != 0 ? doc.datadocItem : []}
                        selectionDefault={doc.dataSourceItemTB}         
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={true}
                        //  totalize={count}
                        pageSize={100}
                    //height={500}
                    />
                </div>
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