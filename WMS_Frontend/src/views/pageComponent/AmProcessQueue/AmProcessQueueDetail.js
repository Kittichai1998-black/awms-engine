import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  IsEmptyObject
} from "../../../components/function/CoreFunction2";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import queryString from "query-string";
import AmDropdown from "../../../components/AmDropdown";
import Checkbox from "@material-ui/core/Checkbox";
import styled from 'styled-components';
import AmTable from '../../../components/table/AmTable';
import {ProcessQueueContext} from './ProcessQueueContext';
import { Grid } from "@material-ui/core";
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import ListIcon from '@material-ui/icons/List';
import SortIcon from '@material-ui/icons/Sort';
import DeleteIcon from '@material-ui/icons/Delete';
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmDialogConfirm from '../../../components/AmDialogConfirm';
import AmDatePicker from '../../../components/AmDate';
import moment from 'moment';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import { FaPallet, FaPercentage } from 'react-icons/fa';


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
const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const DefaultProcessCondition = (doc, con) => {
    if(doc !== null){
        doc.docItems.forEach(x => {
            x.conditions = [{
                batch:x.Batch,
                lot:x.Lot,
                orderNo:x.OrderNo,
                options:x.Options,
                baseQty:x.BaseQuantity
            }]
            x.priority = "2";
            if(con.conditions !== undefined){
                con.conditions.forEach(y => {
                    if(y.custom !== undefined){
                        let getCustom = y.custom({document:doc.document, docItem:x})
                        if(getCustom.enable)
                            x[y.key] = getCustom.defaultValue;
                    }
                    else{
                        if(x.enable)
                            x[y.key] = y.defaultValue;
                        else
                            x[y.key] = false;
                    }
                })
            }
            else{
                x.useFullPick = true;
                x.useIncubateDate = false;
                x.useExpireDate = false;
            }

            if(con.eventStatuses !== undefined){
                let arrEvenstatus = [];
                con.eventStatuses.forEach(y => {
                    if(y.custom !== undefined){
                        let getCustom = y.custom({document:doc.document, docItem:x})
                        if(getCustom.enable && getCustom.defaultValue)
                            arrEvenstatus.push(y.value);
                    }
                    else{
                        if(y.enable && y.defaultValue)
                            arrEvenstatus.push(y.value);
                        else
                            arrEvenstatus.push(12);
                    }
                })
                x.eventStatuses = [...new Set(arrEvenstatus)];
            }
            else{
                x.eventStatuses = [12];
            }

            if(con.orderBys !== undefined){
                let arrOrderBys = [];
                con.orderBys.forEach(y => {
                    if(y.custom !== undefined){
                        let getCustom = y.custom({document:doc.document, docItem:x})
                        if(getCustom.enable)
                            arrOrderBys.push({
                                "fieldName": getCustom.sortField,
                                "orderByType": getCustom.sortBy
                            });
                    }
                    else{
                        if(y.enable)
                            arrOrderBys.push({
                                "fieldName": y.sortField,
                                "orderByType": y.sortBy
                            });
                    }
                })
                if(arrOrderBys.length === 0){
                    arrOrderBys.push({
                        "fieldName": "psto.createtime",
                        "orderByType": 0
                    });
                }
                x.orderBys = arrOrderBys;
            }
            else{
                x.orderBys = [{
                    "fieldName": "psto.createtime",
                    "orderByType": 0
                }];
            }
        });
    }
}


const useDocumentData = (doc, conditions) => {
    const [docData, setDocData] = useState(null);

    useEffect(()=>{
    if(doc.documentsValue !== undefined){
        var newDoc = doc.documentsValue.find(x=> !doc.documentListValue.map(y => y.document.ID).includes(x.ID))
        if(newDoc !== undefined){
          const documentItemQuery = {
            queryString: window.apipath + "/v2/SelectDataViwAPI/",
            t: "DocumentItem",
            q:'[{ "f": "Status", "c":"<", "v": 2},{ "f": "Document_ID", "c":"=", "v": ' + newDoc.ID + '}]',
            //q:'[{ "f": "Status", "c":"<", "v": 2},{ "f": "Document_ID", "c":"=", "v": 11}]',
            f: "*",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            l: 100,
            all: ""
          };
          Axios.get(createQueryString(documentItemQuery)).then(res => {
            setDocData({document:newDoc, docItems:res.data.datas, flag:true});
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doc.documentsValue])
    
    useEffect(()=>{
        if(docData !== null && docData !== undefined){
            DefaultProcessCondition(docData, conditions)
            doc.setDocumentList(docData)
        } return () => setDocData(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docData])

    return doc;
}

const useArea = (areaQuery, doc, customArea) => {
    const [area, setArea] = useState([])
    
    useEffect(()=> {
        Axios.get(createQueryString(areaQuery)).then(res => {
            setArea(res.data.datas);
        });
    },[areaQuery])

    useEffect(()=> {
        if(customArea !== undefined && doc !== null && doc.length > 0){
            var areaRes = customArea(area, doc[0]);
            setArea(areaRes);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[customArea, doc])

    return area;
}

const ProcessQueueDetail = (props) => {
    const { processCondition } = props;
    const { documents, documentDetail, warehouse } = useContext(ProcessQueueContext);
    useDocumentData(documents, processCondition);
    const [columns, setColumns] = useState()
    const [expanded, setExpanded] = useState([])
    const [dialog, setDialog] = useState({"state":false, data:{}})
    const area = useArea(props.areaQuery, documents.documentListValue, props.customDesArea)
    const [areaDefault, setAreaDefault] = useState()
    const [areaSelection, setAreaSelection] = useState({})
    const [processQueueData, setProcessQueueData] = useState({})

    const [dialogType, setDialogType] = useState("")
    const [dialogState, setDialogState] = useState(false)
    const [dialogText, setDialogText] = useState("")

    const [confirmState, setConfirmState] = useState(false)
    const [areaEnable, setAreaEnable] = useState(false);

    useEffect(()=> {
        if(props.areaDefault !== undefined)
            if(documents.documentListValue.length > 0){
                setAreaDefault(props.areaDefault(documents.documentListValue[0]))
                setAreaEnable(true)
            }else{
                setAreaDefault("0")
            }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, documents.documentListValue])

    useEffect(() => {
        const onClickDialog = (key, cell) => {
            const doc =  documents.documentListValue.find(x => x.document.ID === cell.original.Document_ID);
            doc.docItem = {...doc.docItems.find(x => cell.original.ID === x.ID)};
            dialog["state"] = true;
            dialog["key"] = key;
            dialog["data"] = doc
            setDialog({...dialog});
        }

        const createCustomDialog = (event) => {
            var btnObj = [];
            if(processCondition.conditions !== undefined)
                btnObj.push(<EditIcon onClick={() => {onClickDialog("conditions", event)}} fontSize="small"/>)
            if(processCondition.orderBys !== undefined)
                btnObj.push(<SortIcon onClick={() => {onClickDialog("orderBys", event)}} fontSize="small"/>)
            if(processCondition.eventStatuses !== undefined)
                btnObj.push(<ListIcon onClick={() => {onClickDialog("eventStatuses", event)}} fontSize="small"/>)
            if(props.percentRandom)
                btnObj.push(<FaPercentage onClick={() => {onClickDialog("percentRandom", event)}}/>)
            return btnObj;
        }

        var createCustomColumns = {"Header":"Configs", "sortable":false, "width":100, Cell:(x)=> createCustomDialog(x)};
        setColumns([createCustomColumns, ...props.documentItemDetail])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processCondition, documents]);

    const genDocumentHeader = (doc) => {
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
            field.forEach(z => renderColumns.push(<Grid item  xs={calColumns}>{z.label} : {doc.document[z.accessor]}</Grid>))
          }
        }

        renderColumns.push(<Grid>
                <FormInline>
                    <label style={{marginRight:"10px"}}>Priority : </label>
                    <AmDropdown
                    id={"priority"}
                    placeholder={"Priority"}
                    fieldDataKey={"value"}
                    fieldLabel={["label"]} 
                    labelPattern=" : "
                    width={200}
                    value={2}
                    ddlMinWidth={200} 
                    data={[{label:"VERY LOW", value:"0"},
                        {label:"LOW", value:"1"},
                        {label:"NORMAL", value:"2"},
                        {label:"HIGH", value:"3"},
                        {label:"CRITICAL", value:"4"}
                    ]}
                    zIndex={9999}
                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                        doc.docItems.forEach(x => x.priority = value);
                    }}/>
                </FormInline>
            </Grid>
        )
        return renderColumns
    }

    const DocumentExpansion = ({doc,children}) => {
        var fieldHeader = documentDetail.documentDetailValue.fieldHeader;
        var setFieldHeader = fieldHeader.map((x,idx)=> {
            return <span key={idx} style={{marginRight:"20px"}}>{x.label} : {doc.document[x.accessor]}</span>
        });

        const onChangeExpansion = docID => (event, isExpanded) => {
            var newExp = expanded.filter(x=> x !== docID)
            if(isExpanded){
                newExp.push(docID)
                setExpanded([...newExp])
            }else{
                setExpanded([...newExp])
            }
        }

        const checkExpansion = () => {
            var exp = expanded.find(x=> x === doc.document["ID"]);
            if(exp !== undefined){
                return true
            }
            else{
                return false;
            }
        }

        const RemoveDocument = (docID) => {
            documents.removeDocument(docID);
            documents.removeDocumentList(docID);
        };

        return <><ExpansionPanel
            onChange={onChangeExpansion(doc.document["ID"])}
            expanded={checkExpansion()}
            style={{marginBottom:"5px"}}
        >
            <ExpansionPanelSummary 
                expandIcon={<ExpandMoreIcon/>}>
                <CheckboxCustom onClick={event => {
                    event.stopPropagation();
                    doc.flag = !doc.flag;
                }}
                defaultChecked={doc.flag}/>
                <Delete onClick={() => RemoveDocument(doc.document["ID"])}/>
                <Typography>{setFieldHeader}</Typography>
            </ExpansionPanelSummary>
                {children}
            </ExpansionPanel></>
    };

    const RenderDialog = () => {
        if(dialog.key === "conditions"){
            var con = processCondition["conditions"];
            if(con !== undefined && con !== null){
                let cols = con.reduce((obj, x) => {
                    if(x.custom !== undefined){
                        obj.push({ "field":x.field,"component":(data, cols, key)=> {
                            const condition = x.custom(data);
                            if(condition.enable){
                                return <FormInline>
                                <LabelH>{x.field} : </LabelH>
                                <CheckboxCustom disabled={!x.editable} onClick={event => {
                                    data.docItem[x.key] = event.target.checked;
                                }} defaultChecked={data.docItem[x.key]}/>
                                </FormInline>
                            }
                            else{
                                return null;
                            }
                        }
                        })
                    }else{
                        if(x.enable){
                            obj.push({ "field":x.field,"component":(data, cols, key)=> {
                                return <FormInline>
                                <LabelH>{x.field} : </LabelH>
                                <CheckboxCustom disabled={!x.editable} onClick={event => {
                                    data.docItem[x.key] = event.target.checked;
                                }} defaultChecked={data.docItem[x.key]}/>
                                </FormInline>}
                            })
                        }
                    }
                    return obj;
                }, []);
                return cols
            }else{
                return [];
            }
        }else if(dialog.key === "orderBys"){
            var orderBys = processCondition["orderBys"];
            if(orderBys !== undefined && orderBys !== null){
                var cols = orderBys.reduce((obj, x) => {
                    if(x.custom !== undefined){
                        obj.push({ 
                            "field":x.field,"component":(data, cols, key)=> {
                                const condition = x.custom(data);
                                if(condition.enable){
                                    var orb = [...data.docItem.orderBys]
                                    var findOrb = {...orb.find(y => y.fieldName === x.sortField)}
                                    return <FormInline>
                                    <LabelH>{x.field} : </LabelH>
                                    <AmDropdown
                                    disabled={!condition.editable}
                                    id={x.sortField}
                                    placeholder={x.field}
                                    fieldDataKey={"value"}
                                    fieldLabel={["label"]} 
                                    labelPattern=" : "
                                    width={200}
                                    value={findOrb.orderByType}
                                    ddlMinWidth={200} 
                                    data={[{label:"FIFO", value:"0"},{label:"LIFO", value:"1"}]}
                                    zIndex={9999}
                                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                                        findOrb.orderByType = value;
                                        let findEdit = orb.findIndex(y => y.fieldName === findOrb.fieldName);
                                        orb[findEdit] = findOrb
                                        data.docItem.orderBys = orb;
                                    }}
                                  /></FormInline>
                                }
                                else return null;                            
                            }
                        });
                        return obj;
                    }
                    else{
                        obj.push({ 
                            "field":x.field,"component":(data, cols, key)=> {
                                if(x.enable){
                                    var orb = [...data.docItem.orderBys]
                                    var findOrb = {...orb.find(y => y.fieldName === x.sortField)}
                                    return <FormInline>
                                    <LabelH>{x.field} : </LabelH>
                                    <AmDropdown
                                    disabled={!x.editable}
                                    id={x.sortField}
                                    placeholder={x.field}
                                    fieldDataKey={"value"}
                                    fieldLabel={["label"]} 
                                    labelPattern=" : "
                                    width={200}
                                    value={findOrb.orderByType}
                                    ddlMinWidth={200} 
                                    data={[{label:"FIFO", value:"0"},{label:"LIFO", value:"1"}]}
                                    zIndex={9999}
                                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                                        findOrb.orderByType = value;
                                        let findEdit = orb.findIndex(y => y.fieldName === findOrb.fieldName);
                                        orb[findEdit] = findOrb
                                        data.docItem.orderBys = orb;
                                    }}
                                  /></FormInline>
                                }
                                else return null;                            
                            }
                        });
                        return obj;
                    }
                    
                }, []);
                return cols;
            }
            else{
                return [];
            }
        }else if(dialog.key === "eventStatuses"){
            var eventS = processCondition["eventStatuses"];
            if(eventS !== undefined && eventS !== null){
                let cols = eventS.reduce((obj, x) => {
                    if(x.custom !== undefined){
                        obj.push({ "field":x.field,"component":(data, cols, key)=> {
                            const condition = x.custom(data);
                            if(condition.enable){
                                return <FormInline>
                                <LabelH>{x.field} : </LabelH>
                                <CheckboxCustom disabled={!x.editable} onClick={event => {
                                    if(event.target.checked){
                                        if(!data.docItem["eventStatuses"].includes(x.value)){
                                            data.docItem["eventStatuses"].push(x.value)
                                        }
                                    }else{
                                        data.docItem["eventStatuses"] = data.docItem["eventStatuses"].filter(y => y !== x.value);
                                    }
                                }} defaultChecked={data.docItem["eventStatuses"].includes(x.value)}/>
                                </FormInline>
                            }
                            else{
                                return null;
                            }
                        }
                        })
                    }else{
                        if(x.enable){
                            obj.push({ "field":x.field,"component":(data, cols, key)=> {
                                return <FormInline>
                                <LabelH>{x.field} : </LabelH>
                                <CheckboxCustom disabled={!x.editable} onClick={event => {
                                    data.docItem[x.key] = event.target.checked;
                                }} defaultChecked={data.docItem["eventStatuses"].includes(x.value)}/>
                                </FormInline>}
                            })
                        }
                    }
                    return obj;
                }, []);
                return cols
            }else{
                return [];
            }
        }
        else if(props.percentRandom){
            return [{ "field":"Percent","component":(data, cols, key)=> {
                return <FormInline>
                <label style={{marginRight:"10px"}}>Percent : </label>
                <AmInput
                        id={"percent"}
                        required={true}
                        placeholder={"Percent"}
                        type="input"
                        style={{ width: "330px" }}
                        // validate={validate}
                        // regExp={regExp}
                        // msgError={"Error"}
                        // styleValidate={{display: 'block'}}
                        value={data.docItem["percentRandom"]}
                        defaultValue={100}
                        onChangeV2={(value, obj, element, event) => {
                            data.docItem["percentRandom"] = value;
                        }}
                    />
            </FormInline>}
            }];
        }
        else{
            return [];
        }
        
    };

    const onClickProcessQueue = () => {
        let processQueueArr = [];
        documents.documentListValue.filter(x=> x.flag).forEach(doc => {
            doc.docItems.forEach(docItem => {
                const getOptions = queryString.parse(docItem.Options)
                let processQueue = {
                    docID: docItem.Document_ID,
                    docItemID: docItem.ID,
                    locationCode: null,
                    baseCode: getOptions.palletcode ? getOptions.palletcode : null,
                    skuCode: getOptions.palletcode ? null : docItem.Code ? docItem.Code : null,
                    priority: docItem.priority ? docItem.priority : 2,
                    useShelfLifeDate: docItem.useShelfLifeDate ? docItem.useShelfLifeDate : false,
                    useExpireDate: docItem.useExpireDate ? docItem.useExpireDate : false,
                    useIncubateDate: docItem.useIncubateDate ? docItem.useIncubateDate : false,
                    useFullPick: docItem.useFullPick ? docItem.useFullPick : false,
                    baseQty: docItem.BaseQuantity ? docItem.BaseQuantity : null,
                    percentRandom: props.percentRandom ? docItem.percentRandom !== undefined ? docItem.percentRandom : 100 : null,
                    eventStatuses: docItem.eventStatuses,
                    conditions: docItem.conditions,
                    orderBys: docItem.orderBys
                };
                processQueueArr.push(processQueue)
            })
        })

        if(areaEnable && IsEmptyObject(areaSelection)){
            setDialogState(!dialogState)
            setDialogText("กรุณากรอก Area ปลายทาง")
            setDialogType("error")
        }
        else{
            let processQueueData = {}
            processQueueData["desASRSWarehouseCode"] = areaEnable ? warehouse.warehouseValue.Code : null;
            processQueueData["desASRSLocationCode"] = null;
            processQueueData["desASRSAreaCode"] = areaEnable && !IsEmptyObject(areaSelection) ? areaSelection.Code : null;
            processQueueData["processQueues"] = processQueueArr;

            Axios.post(window.apipath + "/v2/" + props.processUrl, processQueueData).then(res => {
                if(res.data._result.status !== 1){
                    setDialogState(!dialogState)
                    setDialogText(res.data._result.message)
                    setDialogType("error")
                }else{
                    var process = res.data.processResults.filter(proRes => {
                        return proRes.processResultItems.find(item => {
                            return item.pickStos.length > 0
                        })
                    })

                    if(process.length === 0){
                        setDialogState(!dialogState)
                        setDialogText("ไม่พบสินค้าในเอกสารตามเงื่อนไขการเบิก")
                        setDialogType("error")
                    }else{
                        let createResData = {}
                        createResData["desASRSWarehouseCode"] = areaEnable ? warehouse.warehouseValue.Code : null;
                        createResData["desASRSLocationCode"] = null;
                        createResData["desASRSAreaCode"] = areaEnable && !IsEmptyObject(areaSelection) ? areaSelection.Code : null;
                        createResData["processResults"] = process;
                        setProcessQueueData(res.data)
                        if(!confirmState)
                            setConfirmState(true)
                    }
                }
            });
        }
    };

    const Memo = React.memo(({documentData, cols})=> {
        return documentData.map((doc, idx) => {
            return <>
            <DocumentExpansion key={idx} doc={doc}>
                <>
                    <Grid style={{"padding": "10px"}} container>
                        {genDocumentHeader(doc)}
                    </Grid>
                    <AmTable width={"100%"}
                        loading ={false}
                        columns={cols}
                        data={doc.docItems}
                        sortable={false}
                        primaryKey="ID"
                        pageSize={1000}
                        minRows={3}/>
                </>
            </DocumentExpansion>
        </>
        }, )
    });
    
    return <>
            <AmDialogs
                typePopup={dialogType}
                onAccept={e => {
                    setDialogState(e);
                }}
                open={dialogState}
                content={dialogText}
            />
            
            <ConfirmDialog
                waveProcess={props.waveProcess}
                confirmProcessUrl={props.confirmProcessUrl}
                mode={props.modeDefault} 
                data={processQueueData} 
                open={confirmState} 
                columnsConfirm={props.columnsConfirm}
                onClose={(confirmState, dialogState)=>
                    {
                        if(confirmState !== null){
                            if(confirmState._result === 0){
                                setDialogState(!dialogState)
                                setDialogText(confirmState._result.message)
                                setDialogType("error")
                            }
                            else{
                                documents.clearDocument();
                                warehouse.clearWarehouse();
                            }
                        }
                        setConfirmState(dialogState)
                    }
                }/>

            <AmEditorTable 
                open={dialog.state} 
                onAccept={(status, rowdata)=>{
                    setDialog({"state":false, data:{}});
                    if(rowdata.docItems !== undefined){
                        let findEdit = rowdata.docItems.findIndex(x => x.ID === rowdata.docItem.ID);
                        if(status){
                            rowdata.docItems[findEdit] = rowdata.docItem;
                        }
                        else{
                            rowdata.docItems.findIndex(x => x.ID === rowdata.docItem.ID);
                            rowdata["docItem"] = rowdata.docItems[findEdit];
                        }
                    }
                }} 
                titleText={'Edit'} 
                data={dialog.data}
                columns={RenderDialog()}
            />
        <hr style={{marginTop:"10px",marginBottom:"10px"}}/>
        {
            <Memo documentData={documents.documentListValue} cols={columns}/>
        }
        <Grid container>
            <Grid item xs="6">
                <AmButton
                    style={{marginTop:20, float:"left"}}
                    styleType="delete" 
                    disabled={documents.documentListValue === undefined || documents.documentListValue.length === 0} 
                    onClick={() => {documents.clearDocument()}
                    }>Clear</AmButton>
            </Grid>
            <Grid item xs="6">
                <FormInline style={{marginTop:20, float:"right", clear:"both"}}>
                    <label style={{marginRight:"10px"}}>Auto Run : </label>
                    <CheckboxCustom onClick={event => {
                        event.stopPropagation();
                        setAreaEnable(event.target.checked)
                    }} checked={areaEnable}/>
                    <label style={{marginRight:"10px"}}>Area : </label>
                    <AmDropdown
                        disabled={!areaEnable ? true : documents.documentListValue.length === 0 ? true : false}
                        id={"Area"}
                        placeholder={"Area"}
                        fieldDataKey={"ID"}
                        fieldLabel={["Name"]} 
                        labelPattern=" : "
                        width={200}
                        defaultValue={areaDefault}
                        value={areaDefault}
                        ddlMinWidth={200} 
                        data={area}
                        zIndex={9999}
                        onChange={(value, dataObject, inputID, fieldDataKey) => {
                            setAreaSelection(dataObject === null ? {} : dataObject)
                            setAreaDefault(value)
                        }}
                        returnDefaultValue={true}
                    />
                    <AmButton
                        style={{marginLeft:10}}
                        styleType="info" 
                        disabled={documents.documentListValue === undefined || documents.documentListValue.length === 0} 
                        onClick={onClickProcessQueue}>Process Queue</AmButton>
                </FormInline>
            </Grid>
        </Grid>
    </>
}

const useColumnsConfirm = (cols) => {
    const [columns, setColumns] = useState(cols);

    useEffect(() => {
        let findCode = cols.find(x=> x.accessor === "bstoCode");
        if(findCode === null || findCode === undefined){
            findCode = {"accessor":"bstoCode", "Header":"Code", "sortable":false, "width":200};
            findCode.Cell = function(row){
                if(row.original.lvl > 0){
                    let calPadding = row.original.lvl *20
                    let calPadding2 = (row.original.lvl - 1) *20
                    return <div style={{display:"inline-block", paddingLeft:calPadding2}}><SubdirectoryArrowRightIcon style={{display:"inline-block"}} fontSize={"small"}/><div style={{paddingLeft:calPadding, display:"inline-block"}}><FaPallet/>{row.original.bstoCode}</div></div>
                }
                else{
                    return <div><InsertDriveFileIcon fontSize={"small"}/>{row.original.bstoCode}</div>
                }
            }
            setColumns([findCode, ...cols])
        }
        else{
            findCode.Cell = function(row){
                if(row.original.lvl > 0){ 
                    let calPadding = row.original.lvl *20
                    let calPadding2 = (row.original.lvl - 1) *20
                    return <div style={{display:"inline-block",paddingLeft:calPadding2}}><SubdirectoryArrowRightIcon style={{display:"inline-block"}} fontSize={"small"}/><div style={{paddingLeft:calPadding, display:"inline-block"}}><FaPallet/>{row.original.bstoCode}</div></div>
                }
                else{
                    return <div><InsertDriveFileIcon fontSize={"small"}/>{row.original.bstoCode}</div>
                }
            }
            setColumns([...cols])
        }            
    }, [cols])

    return columns;
}


const ConfirmDialog = (props) => {
    const [open, setOpen] = useState(props.open);
    const [data, setData] = useState(props.data);
    const [itemProcess, setItemProcess] = useState([]);
    const [mode, setMode] = useState(props.mode);
    const [datetime, setDatetime] = useState(null);
    const columns = useColumnsConfirm(props.columnsConfirm);

    useEffect(()=>{
        setOpen(props.open)
    }, [props.open]);

    useEffect(()=>{
        if(!IsEmptyObject(data)){
            let process = {...props.data}.processResults.map(x=> {
                let objData = {"docCode": x.docCode}
                let arrPallet = [];
                x.processResultItems.forEach(processRes=> {
                    let itemHeader = {}
                    for(let obj in processRes){
                        if(obj !== "pickStos"){
                            if(obj === "docItemCode")
                                itemHeader["bstoCode"] = processRes[obj]
                            else if(obj === "baseQty")
                                itemHeader["pickQty"] = processRes[obj]
                            else
                                itemHeader[obj] = processRes[obj]

                            itemHeader.lvl = 0
                        }
                    }
                    arrPallet.push(itemHeader)
                    
                    arrPallet = arrPallet.concat(processRes.pickStos.map(y => {return {...y, "lvl":1}}))
                })
                objData.processResult = arrPallet;
                return objData;
            });
            setItemProcess(process)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        setData({...props.data})
    }, [props.data])

    const onClickConfirm = () => {
        let confirmData = {};
        confirmData["desASRSWarehouseCode"] = data["desASRSWarehouseCode"];
        confirmData["desASRSLocationCode"] = data["desASRSLocationCode"];
        confirmData["desASRSAreaCode"] = data["desASRSAreaCode"];
        if(props.waveProcess){
            confirmData["waveRunMode"] = mode;
            confirmData["scheduleTime"] = datetime;
        }
        confirmData["processResults"] = data.processResults;

        Axios.post(window.apipath + "/v2/" + props.confirmProcessUrl, confirmData).then(res => {
            props.onClose(res.data, false);
        });
    }

    const res = () => itemProcess.length > 0 ? itemProcess.map(x => {
        return <><ExpansionPanel style={{marginBottom:"5px"}}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>{x.docCode}</Typography>
        </ExpansionPanelSummary>
            <div style={{width:"100%"}}>
                <AmTable 
                    columns={columns} 
                    data={x.processResult}
                    loading ={false}
                    sortable={false}
                    primaryKey="pstoID"
                    pageSize={1000}
                    minRows={3}
                />
            </div>
        </ExpansionPanel></>
    }) : null;

    const renderProcess = () => {
        return <>
            {props.waveProcess ? <FormInline>
                <label>Mode : </label>
                <AmDropdown
                        disabled={props.modeDisabled}
                        id={"mode"}
                        placeholder={"Mode"}
                        fieldDataKey={"value"}
                        fieldLabel={["label"]} 
                        labelPattern=" : "
                        width={200}
                        value={mode}
                        ddlMinWidth={200} 
                        data={[{"value":"0", "label":"Manual"},{"value":"1", "label":"Schedule"},{"value":"2", "label":"Sequent"}]}
                        zIndex={9999}
                        onChange={(value, dataObject, inputID, fieldDataKey) => {
                            setMode(value)
                        }}
                    />
                    {mode === "1" ? <>
                    <label>Schedule Time : </label>
                    <AmDatePicker
                        FieldID={"datetime"}
                        width="200px"
                        TypeDate={"datetime-local"}
                        onChange={value =>
                            setDatetime(value.fieldDataKey)
                        }
                        defaultValue={moment().format("YYYY-MM-DDT00:00")}
                    />
                </> : null}
            </FormInline> : null}
            {res()}
        </>
    }

    return <AmDialogConfirm
        styleDialog={{maxWidth:"800px"}}
        open={open}
        close={a => {setOpen(!open); props.onClose(null, false);}}
        bodyDialog={!IsEmptyObject(data) ? renderProcess() : []}
        customAcceptBtn={
            <AmButton
                styleType="confirm_clear"
                onClick={() => {
                    
                    onClickConfirm();
            }}>OK</AmButton>
        }
        customCancelBtn={
            <AmButton
                styleType="delete_clear"
                onClick={() => {
                    setOpen(!open)
                    props.onClose(null, false)
                }}>Cancel</AmButton>
        }
    />;
}

const ExpansionPanel = withStyles({
    root: {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none',
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    expanded: {},
  })(MuiExpansionPanel);
  
  const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight:"30px !important",
        '&$expanded': {
            minHeight:"30px !important",
        }
    },
    content: {
        margin:"0 !important",
        '&$expanded': {
            margin:"0 !important",
        }
    },
    expandIcon: {
        padding:0,
        '&$expanded': {
            padding:0,
        }
    },
  })(MuiExpansionPanelSummary);

  const CheckboxCustom = withStyles({
    root: {
        padding:"0 !important",
        marginRight:"5px"
    },
    
  })(Checkbox);

  const Delete = withStyles({
    root: {
        marginRight:"15px"
    },
    
  })(DeleteIcon);

  ProcessQueueDetail.propTypes = {
    /**
    * กำหนดค่าเริ่มต้นสำหรับสร้าง Wave
    * ** value : "1"
    */
    modeDefault : PropTypes.string,
    /**
     * ใช้เปิดปิดการเบิกแบบเป็น percent
     ** value : true || false
    */
    percentRandom : PropTypes.bool,
    /**
     * รูปแบบของหัวตารางของรายละเอียดเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    documentItemDetail : PropTypes.array.isRequired,
    /**
    * รูปแบบของหัวตารางสำหรับข้อมูลก่อน comfirm wave งานเบิก
    * ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    columnsConfirm:PropTypes.array.isRequired,
    /**
     * query string สำหรับดึงข้อมูล Area
     ** value? : string
    */
    areaQuery:PropTypes.array.isRequired,
    /**
     * รายการ Area โดยใช้เงื่อนไขผ่าน {arealist:[],document:{document:{}, docItem:[]}} โดยส่ง Area List กลับ
     ** value? : (arealist,doc)=> {return arealist}
    */
    customDesArea:PropTypes.func,
    /**
     * ข้อมูล Area เริ่มต้น โดยใช้เงื่อนไขผ่าน {document:{}, docItem:[]}
     ** value? : (doc)=> {return value}
    */
    areaDefault:PropTypes.func,
    /**
     * Url สำหรับ process queue
     ** value? : process_wq
    */
    processUrl:PropTypes.string,
    /**
     * Url สำหรับ confirm process queue
     ** value? : confirm_process_wq
    */
    confirmProcessUrl:PropTypes.string,
  }
export default ProcessQueueDetail;