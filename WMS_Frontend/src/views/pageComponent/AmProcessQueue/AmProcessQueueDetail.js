import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
    apicall,
    createQueryString,
    IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import queryString from "query-string";
import AmDropdown from "../../../components/AmDropdown";
import Checkbox from "@material-ui/core/Checkbox";
import styled from 'styled-components';
import AmTable from '../../../components/AmTable';
import { ProcessQueueContext } from './ProcessQueueContext';
import { Grid, IconButton } from "@material-ui/core";
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmDialogConfirm from '../../../components/AmDialogConfirm';
import AmDatePicker from '../../../components/AmDate';
import moment from 'moment';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import { FaPallet, FaPercentage } from 'react-icons/fa';
import AmToolTip from "../../../components/AmToolTip";
import { StorageObjectEvenStatusAll } from "../../../components/Models/StorageObjectEvenstatus";
import { AuditStatus } from "../../../components/Models/AuditStatus";

import EditIcon from '@material-ui/icons/Edit';

var Axios = new apicall();

const orderObj = [{ label: "Ascending", value: "0" }, { label: "Descending", value: "1" }];

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
const SelectionItem = styled.div`
  display:inline;
  padding: 2px;
  background:#B8ECF5;
  margin-right:3px;
  border-radius: 5px;
  border:1px solid #37DCF9;
`;

const DefaultProcessCondition = (doc, con) => {
    if (doc !== null) {
        doc.docItems.forEach(x => {
            x.conditions = [{
                batch: x.Batch,
                lot: x.Lot,
                orderNo: x.OrderNo,
                options: null,
                baseQty: x.BaseQuantity,
                ref1: x.Ref1,
                ref2: x.Ref2,
                ref3: x.Ref3,
                ref4: x.Ref4
            }]
            x.priority = "2";
            if (con.conditions !== undefined) {
                con.conditions.forEach(y => {
                    if (y.custom !== undefined) {
                        let getCustom = y.custom({ document: doc.document, docItem: doc.docItems[0] })
                        if (getCustom.enable)
                            x[y.key] = getCustom.defaultValue;
                    }
                    else {
                        if (y.enable) {
                            x[y.key] = y.defaultValue;
                        }
                        else
                            x[y.key] = false;
                    }
                })
            }
            else {
                x.useFullPick = false;
                x.useIncubateDate = false;
                x.useExpireDate = false;
                x.useShelfLifeDate = false;
            }

            if (con.eventStatuses !== undefined) {
                let arrEvenstatus = [];
                con.eventStatuses.forEach(y => {
                    if (y.custom !== undefined) {
                        let getCustom = y.custom({ document: doc.document, docItem: doc.docItems[0] })
                        if (getCustom.enable && getCustom.defaultValue)
                            arrEvenstatus.push(y.value);
                    }
                    else {
                        if (y.enable && y.defaultValue)
                            arrEvenstatus.push(y.value);
                        else
                            arrEvenstatus.push(12);
                    }
                })
                x.eventStatuses = [...new Set(arrEvenstatus)];
            }
            else {
                x.eventStatuses = [12];
            }

            if (con.auditStatuses !== undefined) {
                let arrAuditstatus = [];
                con.auditStatuses.forEach(y => {
                    if (y.custom !== undefined) {
                        let getCustom = y.custom({ document: doc.document, docItem: doc.docItems[0] })
                        if (getCustom.enable && getCustom.defaultValue)
                            arrAuditstatus.push(y.value);
                    }
                    else {
                        if (y.enable && y.defaultValue)
                            arrAuditstatus.push(y.value);
                        // else
                        //     arrAuditstatus.push(0);
                    }
                })
                x.auditStatuses = [...new Set(arrAuditstatus)];
            }
            else {
                // x.auditStatuses = [0];
            }

            if (con.orderBys !== undefined) {
                let arrOrderBys = [];
                con.orderBys.sort((a, b) => a - b).forEach((y, idx) => {
                    if (y.custom !== undefined) {
                        let getCustom = y.custom({ document: doc.document, docItem: doc.docItems[0] })
                        if (getCustom.enable)
                            if (getCustom.defaultSortBy !== undefined)
                                arrOrderBys.push({
                                    "fieldName": getCustom.sortField,
                                    "orderByType": getCustom.defaultSortBy,
                                    "order": getCustom.order ? getCustom.order : idx + 1
                                });
                    }
                    else {
                        if (y.enable) {
                            if (y.defaultSortBy !== undefined) {
                                arrOrderBys.push({
                                    "fieldName": y.sortField,
                                    "orderByType": y.defaultSortBy,
                                    "order": y.order ? y.order : idx + 1
                                });
                            }
                        }
                    }
                })
                if (arrOrderBys.length === 0) {
                    arrOrderBys.push({
                        "fieldName": "psto.createtime",
                        "orderByType": "0",
                        "order": 0
                    });
                }
                x.orderBys = arrOrderBys;
            }
            else {
                x.orderBys = [{
                    "fieldName": "psto.createtime",
                    "orderByType": "0",
                    "order": 0
                }];
            }
        });
    }
}


const useDocumentData = (doc, conditions) => {
    const [docData, setDocData] = useState(null);

    useEffect(() => {
        if (doc.documentsValue !== undefined) {
            var newDoc = doc.documentsValue.find(x => !doc.documentListValue.map(y => y.document.ID).includes(x.ID))
            if (newDoc !== undefined) {
                const documentItemQuery = {
                    queryString: window.apipath + "/v2/SelectDataViwAPI/",
                    t: "DocumentItem",
                    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "Document_ID", "c":"=", "v": ' + newDoc.ID + '}]',
                    //q:'[{ "f": "Status", "c":"<", "v": 2},{ "f": "Document_ID", "c":"=", "v": 11}]',
                    f: "*",
                    g: "",
                    s: "[{'f':'ID','od':'asc'}]",
                    sk: 0,
                    l: 100,
                    all: ""
                };
                Axios.get(createQueryString(documentItemQuery)).then(res => {
                    setDocData({ document: newDoc, docItems: res.data.datas, flag: true });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doc.documentsValue])

    useEffect(() => {
        if (docData !== null && docData !== undefined) {
            DefaultProcessCondition(docData, conditions)
            doc.setDocumentList(docData)
        } return () => setDocData(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docData])

    return doc;
}

const useArea = (areaQuery, doc, customArea, warehouse) => {
    const [allArea, setAllArea] = useState([])
    const [area, setArea] = useState([])

    useEffect(() => {
        Axios.get(createQueryString(areaQuery)).then(res => {
            setArea(res.data.datas);
            setAllArea(res.data.datas);
        });
    }, [areaQuery])

    useEffect(() => {
        if (customArea !== undefined && doc !== null && doc.length > 0) {
            var areaRes = customArea(allArea, doc[0], warehouse);
            setArea(areaRes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customArea, doc, warehouse])

    return area;
}

const ProcessQueueDetail = (props) => {
    const { processCondition } = props;
    const { documents, documentDetail, warehouse } = useContext(ProcessQueueContext);
    useDocumentData(documents, processCondition);
    const [expanded, setExpanded] = useState([])
    const [dialog, setDialog] = useState({ "state": false, data: {} })
    const area = useArea(props.areaQuery, documents.documentListValue, props.customDesArea, warehouse.warehouseValue)
    const [areaDefault, setAreaDefault] = useState()
    const [areaSelection, setAreaSelection] = useState({})
    const [processQueueData, setProcessQueueData] = useState({})

    const [dialogType, setDialogType] = useState("")
    const [dialogState, setDialogState] = useState(false)
    const [dialogText, setDialogText] = useState("")

    const [confirmState, setConfirmState] = useState(false)
    const [flagAuto, setFlagAuto] = useState(false);

    useEffect(() => {
        if (props.areaDefault !== undefined)
            if (documents.documentListValue.length > 0) {
                setAreaDefault(props.areaDefault(documents.documentListValue[0]))
                setFlagAuto(true)
            } else {
                setAreaDefault(null)
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, documents.documentListValue, area])

    const onClickDialog = (key, docData) => {
        dialog["state"] = true;
        dialog["key"] = key;
        dialog["data"] = { ...docData.docItems[0] }
        setDialog({ ...dialog });
    }

    const conditionDisplayItem = (event) => {
        let findCondition = processCondition.conditions.filter(x=> x.enable);
        return findCondition.filter(x => event.docItems[0][x.key] === true).map(x=> <SelectionItem>{x.field}</SelectionItem>);
    }

    const createCustomDialog = (event) => {
        var btnObj = [];
        if (processCondition.conditions !== undefined)
            btnObj.push(
                <FormInline style={{ display: "inline" }}>
                    <label style={{ marginRight: "10px" }}>Conditions : </label>
                    {conditionDisplayItem(event)}
                    <AmToolTip title={"Conditions"} placement={"top"}>
                        <IconButtonCustom><EditIcon onClick={() => { onClickDialog("conditions", event) }} fontSize="small" /></IconButtonCustom>
                    </AmToolTip>
                </FormInline>
            )
        if (processCondition.orderBys !== undefined)
            btnObj.push(
                <FormInline style={{ display: "inline" }}>
                    <label style={{ marginRight: "10px" }}>Order By : </label>
                    {event.docItems[0]["orderBys"].map(odb => {
                        let field = props.processCondition.orderBys.find(y => odb.fieldName === y.sortField).field;
                        let order = orderObj.find(y => odb.orderByType === y.value).label;
                        return <SelectionItem>{`${field}(${order})`}</SelectionItem>
                    })}
                    <AmToolTip title={"Order By"} placement={"top"}>
                        <IconButtonCustom><EditIcon onClick={() => { onClickDialog("orderBys", event) }} fontSize="small" /></IconButtonCustom>
                    </AmToolTip>
                </FormInline>
            )
        if (processCondition.eventStatuses !== undefined)
            btnObj.push(
                <FormInline style={{ display: "inline" }}>
                    <label style={{ marginRight: "10px" }}>Event Status : </label>
                    {event.docItems[0]["eventStatuses"].map(st => {
                        return <SelectionItem>{StorageObjectEvenStatusAll.find(x => x.value === st).label}</SelectionItem>
                    })}
                    <AmToolTip title={"Event Status"} placement={"top"}>
                        <IconButtonCustom><EditIcon onClick={() => { onClickDialog("eventStatuses", event) }} fontSize="small" /></IconButtonCustom>
                    </AmToolTip>
                </FormInline>
            )
        if (processCondition.auditStatuses !== undefined)
            btnObj.push(
                <FormInline style={{ display: "inline" }}>
                    <label style={{ marginRight: "10px" }}>Audit Status : </label>
                    {event.docItems[0]["auditStatuses"].map(st => {
                        return <SelectionItem>{AuditStatus.find(x => x.value === st).label}</SelectionItem>
                    })}
                    <AmToolTip title={"Audit Status"} placement={"top"}>
                        <IconButtonCustom><EditIcon onClick={() => { onClickDialog("auditStatuses", event) }} fontSize="small" /></IconButtonCustom>
                    </AmToolTip>
                </FormInline>
            )
        if (props.percentRandom)
            btnObj.push(
                <FormInline style={{ display: "inline" }}>
                    <label style={{ marginRight: "10px" }}>Random : </label>
                    <SelectionItem>{event.docItems[0]["percentRandom"] ? event.docItems[0]["percentRandom"] : 100}</SelectionItem>
                    <AmToolTip title={"Percent Random"} placement={"top"}>
                        <FaPercentage onClick={() => { onClickDialog("percentRandom", event) }} />
                    </AmToolTip>
                </FormInline>
            )
        return btnObj;
    }

    const genDocumentHeader = (doc) => {
        const renderColumns = [];
        const columnSize = documentDetail.documentDetailValue.columns;
        const columnsField = [...documentDetail.documentDetailValue.field]
        const calColumns = Math.ceil(12 / columnSize);
        const row = Math.ceil(columnsField.length / columnSize);
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < calColumns; j++) {
                const field = columnsField.splice(i * columnSize, ((i * columnSize) + columnSize));
                if (field.length === 0)
                    break;
                field.forEach(z => renderColumns.push(<Grid item xs={calColumns}>{z.label} : {doc.document[z.accessor]}</Grid>))
            }
        }

        createCustomDialog(doc).forEach(i => {
            renderColumns.push(<Grid item xs={calColumns}>
                {i}
            </Grid>
            )
        })

        renderColumns.push(<Grid>
            <FormInline>
                <label style={{ marginRight: "10px" }}>Priority : </label>
                <AmDropdown
                    id={"priority"}
                    placeholder={"Priority"}
                    fieldDataKey={"value"}
                    fieldLabel={["label"]}
                    labelPattern=" : "
                    width={200}
                    value={2}
                    ddlMinWidth={200}
                    data={[{ label: "VERY LOW", value: "0" },
                    { label: "LOW", value: "1" },
                    { label: "NORMAL", value: "2" },
                    { label: "HIGH", value: "3" },
                    { label: "CRITICAL", value: "4" }
                    ]}
                    zIndex={9999}
                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                        doc.docItems.forEach(x => x.priority = value);
                    }} />
            </FormInline>
        </Grid>
        )

        return renderColumns
    }

    const DocumentExpansion = ({ doc, children }) => {
        var fieldHeader = documentDetail.documentDetailValue.fieldHeader;
        var setFieldHeader = fieldHeader.map((x, idx) => {
            return <span key={idx} style={{ marginRight: "20px" }}>{x.label} : {doc.document[x.accessor]}</span>
        });

        const onChangeExpansion = docID => (event, isExpanded) => {
            var newExp = expanded.filter(x => x !== docID)
            if (isExpanded) {
                newExp.push(docID)
                setExpanded([...newExp])
            } else {
                setExpanded([...newExp])
            }
        }

        const checkExpansion = () => {
            var exp = expanded.find(x => x === doc.document["ID"]);
            if (exp !== undefined) {
                return true
            }
            else {
                return false;
            }
        }

        const RemoveDocument = (docID) => {
            documents.removeDocument(docID);
            documents.removeDocumentList(docID);
        };

        return <Accordion
            onChange={onChangeExpansion(doc.document["ID"])}
            expanded={checkExpansion()}
            style={{ marginBottom: "5px" }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}>
                <CheckboxCustom onClick={event => {
                    event.stopPropagation();
                    doc.flag = !doc.flag;
                }}
                    defaultChecked={doc.flag} />
                <IconButtonCustom><Delete onClick={() => RemoveDocument(doc.document["ID"])} /></IconButtonCustom>
                <Typography>{setFieldHeader}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {children}
            </AccordionDetails>
        </Accordion>
    };

    const RenderDialog = () => {
        if (dialog.key === "conditions") {
            var con = processCondition["conditions"];
            if (con !== undefined && con !== null) {
                let cols = con.reduce((obj, x) => {
                    if (x.custom !== undefined) {
                        obj.push({
                            "field": x.field, "component": (data, cols, key) => {
                                const condition = x.custom({docItem:data});
                                if (condition.enable) {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            data[x.key] = event.target.checked;
                                        }} defaultChecked={data[x.key]} />
                                    </FormInline>
                                }
                                else {
                                    return null;
                                }
                            }
                        })
                    } else {
                        if (x.enable) {
                            obj.push({
                                "field": x.field, "component": (data, cols, key) => {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            data[x.key] = event.target.checked;
                                        }} defaultChecked={data[x.key]} />
                                    </FormInline>
                                }
                            })
                        }
                    }
                    return obj;
                }, []);
                return cols
            } else {
                return [];
            }
        } else if (dialog.key === "orderBys") {
            var orderBys = processCondition["orderBys"];
            if (orderBys !== undefined && orderBys !== null) {
                var cols = orderBys.reduce((obj, x) => {
                    if (x.custom !== undefined) {
                        obj.push({
                            "field": x.field, "component": (data, cols, key) => {
                                const condition = x.custom({docItem:data});
                                if (condition.enable) {
                                    var orb = [...data.orderBys]
                                    var findOrb = { ...orb.find(y => y.fieldName === x.sortField) }
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <AmDropdown
                                            disabled={!condition.editable}
                                            id={x.sortField}
                                            placeholder={x.field}
                                            fieldDataKey={"value"}
                                            fieldLabel={["label"]}
                                            labelPattern=" : "
                                            width={250}
                                            value={findOrb.orderByType}
                                            ddlMinWidth={250}
                                            data={orderObj}
                                            zIndex={9999}
                                            onChange={(value, dataObject, inputID, fieldDataKey) => {
                                                findOrb.orderByType = value;
                                                let findEdit = orb.findIndex(y => y.fieldName === findOrb.fieldName);
                                                orb[findEdit] = findOrb
                                                data.orderBys = orb;
                                            }}
                                        /></FormInline>
                                }
                                else return null;
                            }
                        });
                        return obj;
                    }
                    else {
                        obj.push({
                            "field": x.field, "component": (data, cols, key) => {
                                if (x.enable) {
                                    var orb = [...data.orderBys]
                                    var findOrb = { ...orb.find(y => y.fieldName === x.sortField) }
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
                                            data={[{ label: "FIFO", value: "0" }, { label: "LIFO", value: "1" }]}
                                            zIndex={9999}
                                            onChange={(value, dataObject, inputID, fieldDataKey) => {
                                                findOrb.orderByType = value;
                                                let findEdit = orb.findIndex(y => y.fieldName === findOrb.fieldName);
                                                orb[findEdit] = findOrb
                                                data.orderBys = orb;
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
            else {
                return [];
            }
        } else if (dialog.key === "eventStatuses") {
            let eventS = processCondition["eventStatuses"];
            if (eventS !== undefined && eventS !== null) {
                let cols = eventS.reduce((obj, x) => {
                    if (x.custom !== undefined) {
                        obj.push({
                            "field": x.field, "component": (data, cols, key) => {
                                const condition = x.custom({docItem:data});
                                if (condition.enable) {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            if (event.target.checked) {
                                                if (!data["eventStatuses"].includes(x.value)) {
                                                    data["eventStatuses"].push(x.value)
                                                }
                                            } else {
                                                data["eventStatuses"] = data["eventStatuses"].filter(y => y !== x.value);
                                            }
                                        }} defaultChecked={data["eventStatuses"].includes(x.value)} />
                                    </FormInline>
                                }
                                else {
                                    return null;
                                }
                            }
                        })
                    } else {
                        if (x.enable) {
                            obj.push({
                                "field": x.field, "component": (data, cols, key) => {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            if (event.target.checked) {
                                                if (!data["eventStatuses"].includes(x.value)) {
                                                    data["eventStatuses"].push(x.value)
                                                }
                                            } else {
                                                data["eventStatuses"] = data["eventStatuses"].filter(y => y !== x.value);
                                            }

                                        }} defaultChecked={data["eventStatuses"].includes(x.value)} />
                                    </FormInline>
                                }
                            })
                        }
                    }
                    return obj;
                }, []);
                return cols
            } else {
                return [];
            }
        } else if (dialog.key === "auditStatuses") {
            let eventS = processCondition["auditStatuses"];
            if (eventS !== undefined && eventS !== null) {
                let cols = eventS.reduce((obj, x) => {
                    if (x.custom !== undefined) {
                        obj.push({
                            "field": x.field, "component": (data, cols, key) => {
                                const condition = x.custom({docItem:data});
                                if (condition.enable) {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            if (event.target.checked) {
                                                if (!data["auditStatuses"].includes(x.value)) {
                                                    data["auditStatuses"].push(x.value)
                                                }
                                            } else {
                                                data["auditStatuses"] = data["auditStatuses"].filter(y => y !== x.value);
                                            }
                                        }} defaultChecked={data["auditStatuses"].includes(x.value)} />
                                    </FormInline>
                                }
                                else {
                                    return null;
                                }
                            }
                        })
                    } else {
                        if (x.enable) {
                            obj.push({
                                "field": x.field, "component": (data, cols, key) => {
                                    return <FormInline>
                                        <LabelH>{x.field} : </LabelH>
                                        <CheckboxCustom disabled={!x.editable} onClick={event => {
                                            if (event.target.checked) {
                                                if (!data["auditStatuses"].includes(x.value)) {
                                                    data["auditStatuses"].push(x.value)
                                                }
                                            } else {
                                                data["auditStatuses"] = data["auditStatuses"].filter(y => y !== x.value);
                                            }

                                        }} defaultChecked={data["auditStatuses"].includes(x.value)} />
                                    </FormInline>
                                }
                            })
                        }
                    }
                    return obj;
                }, []);
                return cols
            } else {
                return [];
            }
        }
        else if (props.percentRandom) {
            return [{
                "field": "Percent", "component": (data, cols, key) => {
                    return <FormInline>
                        {/* <label style={{ marginRight: "10px" }}>Percent : </label> */}
                        {/* <AmInput
                            id={"percent"}
                            required={true}
                            placeholder={"Percent"}
                            type="input"
                            style={{ width: "330px" }}
                            // validate={validate}
                            // regExp={regExp}
                            // msgError={"Error"}
                            // styleValidate={{display: 'block'}}
                            value={data["percentRandom"]}
                            defaultValue={100}
                            onChangeV2={(value, obj, element, event) => {
                                data["percentRandom"] = value;
                            }}
                        /> */}
                    </FormInline>
                }
            }];
        }
        else {
            return [];
        }

    };

    const onClickProcessQueue = () => {
        let processQueueArr = [];
        documents.documentListValue.filter(x => x.flag).forEach(doc => {
            doc.docItems.forEach(docItem => {
                const getOptions = queryString.parse(docItem.Options)
                let processQueue = {
                    docID: docItem.Document_ID,
                    docItemID: docItem.ID,
                    locationCode: null,
                    baseCode: docItem.BaseCode ? docItem.BaseCode : null,
                    skuCode: docItem.BaseCode ? null : docItem.Code ? docItem.Code : null,
                    priority: docItem.priority ? docItem.priority : 2,
                    useShelfLifeDate: docItem.useShelfLifeDate ? docItem.useShelfLifeDate : false,
                    useExpireDate: docItem.useExpireDate ? docItem.useExpireDate : false,
                    useIncubateDate: docItem.useIncubateDate ? docItem.useIncubateDate : false,
                    useFullPick: docItem.useFullPick ? docItem.useFullPick : false,
                    baseQty: docItem.BaseQuantity ? docItem.BaseQuantity : null,
                    percentRandom: getOptions.qtyrandom ? getOptions.qtyrandom !== undefined ? parseInt(getOptions.qtyrandom) : 100 : null,
                    eventStatuses: docItem.eventStatuses,
                    auditStatuses: docItem.auditStatuses,
                    conditions: docItem.conditions,
                    orderBys: docItem.orderBys
                };
                processQueueArr.push(processQueue)
            })
        })

        if (IsEmptyObject(areaSelection)) {
            setDialogState(!dialogState)
            setDialogText("กรุณากรอก Area ปลายทาง")
            setDialogType("error")
        }
        else {
            let processQueueData = {}
            processQueueData["desASRSWarehouseCode"] = warehouse.warehouseValue.Code;
            processQueueData["desASRSLocationCode"] = null;
            processQueueData["desASRSAreaCode"] = areaSelection.Code;
            processQueueData["processQueues"] = processQueueArr;

            Axios.post(window.apipath + "/v2/" + props.processUrl, processQueueData).then(res => {
                if(props.customAfterProcess !== undefined)
                    return props.customAfterProcess(res.data)
                else
                    return res.data;
            }).then(res => {
                if (res._result.status !== 1) {
                    if(props.processErrorClear)
                        documents.clearDocument();
                    setDialogState(!dialogState)
                    setDialogText(res._result.message)
                    setDialogType("error")
                } else {
                    var process = res.processResults.filter(proRes => {
                        return proRes.processResultItems.find(item => {
                            return item.pickStos.length > 0
                        })
                    })

                    if (process.length === 0) {
                        setDialogState(!dialogState)
                        setDialogText("ไม่พบสินค้าในเอกสารตามเงื่อนไขการเบิก")
                        setDialogType("error")
                    } else {
                        let createResData = {}
                        createResData["desASRSWarehouseCode"] = warehouse.warehouseValue.Code;
                        createResData["desASRSLocationCode"] = null;
                        createResData["desASRSAreaCode"] = areaSelection.Code;
                        createResData["processResults"] = process;
                        setProcessQueueData(res)
                        if (!confirmState)
                            setConfirmState(true)
                    }
                }
            });
        }
    };

    const Memo = React.memo(({ documentData, cols }) => {
        return documentData.map((doc, idx) => {
            return <DocumentExpansion key={idx} doc={doc}>
                    <Grid style={{ "padding": "10px" }} container>
                        {genDocumentHeader(doc)}
                    </Grid>
                    <AmTable width={"100%"}
                        height={295}
                        columns={cols}
                        dataSource={doc.docItems}
                        sortable={false}
                        filterable={false}
                        dataKey="ID"
                        pageSize={3000}
                        minRows={11} />
                </DocumentExpansion>
        })
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
            flagAuto={flagAuto}
            columnsConfirm={props.columnsConfirm}
            onClose={(confirmState, dialogState) => {
                if (confirmState !== null && confirmState !== undefined) {
                    if (confirmState._result.status === 0) {
                        setDialogState(!dialogState)
                        setDialogText(confirmState._result.message)
                        setDialogType("error")
                        if(props.confirmErrorClear)
                            documents.clearDocument();
                    }
                    else {
                        documents.clearDocument();
                        setDialogState(!dialogState)
                        setDialogText(confirmState._result.message)
                        setDialogType("success")
                    }
                }
                setConfirmState(dialogState)
            }
            } 
        />
        {
            dialog.key !== "orderBys" ? <AmEditorTable
                open={dialog.state}
                onAccept={(status, rowdata) => {
                    if (rowdata !== undefined && status) {
                        const doc = documents.documentListValue.find(x => x.document.ID === rowdata.Document_ID)
                        console.log(doc)
                        doc.docItems.forEach(item => {
                            if(dialog.key === "conditions"){
                                let findCondition = processCondition.conditions.filter(x=> x.enable);
                                findCondition.forEach(x => {
                                    item[x.key] = rowdata[x.key]
                                });
                            }
                            else
                            item[dialog.key] = rowdata[dialog.key]
                        })
                    }
                    setDialog({ "state": false, data: {} });
                }}
                titleText={'Edit'}
                data={dialog.data}
                columns={RenderDialog()}
            /> :
                <OrderbyCustom
                    confirmOrder={(docItem, data) => {
                        const doc = documents.documentListValue.find(x => x.document.ID === docItem.Document_ID)
                        doc.docItems.forEach(x => {
                            x["orderBys"] = data
                        });
                        setDialog({ "state": false, data: {} })
                    }
                    }
                    orderList={props.processCondition.orderBys}
                    open={dialog.state}
                    sortData={dialog.data}
                    onClose={() => { setDialog({ "state": false, data: {} }); }}
                />
        }
        <div style={{position:"relative",height:props.contentHeight + 36}}>
            <div style={{height:props.contentHeight, overflowY:"auto"}}>
                <Memo documentData={documents.documentListValue} cols={props.documentItemDetail} />
            </div>
            <div style={{width:"100%",position:"absolute", bottom:0, right:0,}}>
                <IconButtonCustom>
                    <DeleteIcon 
                    style={{ float: "left" }}
                    styleType="delete"
                    disabled={documents.documentListValue === undefined || documents.documentListValue.length === 0}
                    onClick={() => { documents.clearDocument() }}
                /></IconButtonCustom>
                <AmButton
                    style={{ marginLeft: 10, float: "right" }}
                    styleType="info"
                    disabled={documents.documentListValue === undefined || documents.documentListValue.length === 0}
                    onClick={onClickProcessQueue}>Process Queue</AmButton>
                <FormInline style={{ float: "right" }}>{props.waveProcess ? <><label style={{ marginRight: "10px" }}>Auto Run : </label>
                    <CheckboxCustom onClick={event => {
                        event.stopPropagation();
                        setFlagAuto(event.target.checked)
                    }} checked={flagAuto} /></> : null}

                    <label style={{ marginRight: "10px" }}>Area : </label>
                    <AmDropdown
                        disabled={documents.documentListValue.length === 0 ? true : false}
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
                </FormInline>

                <div style={{ clear: "both" }}></div>
            </div>
        </div>
        
    </>
}

const useColumnsConfirm = (cols) => {
    const [columns, setColumns] = useState(cols);

    useEffect(() => {
        let findCode = cols.find(x => x.accessor === "bstoCode");
        if (findCode === null || findCode === undefined) {
            findCode = { "accessor": "bstoCode", "Header": "Code", "sortable": false, "width": 200 };
            findCode.Cell = function (row) {
                if (row.original.lvl > 0) {
                    let calPadding = row.original.lvl * 20
                    let calPadding2 = (row.original.lvl - 1) * 20
                    return <div style={{ display: "inline-block", paddingLeft: calPadding2 }}><SubdirectoryArrowRightIcon style={{ display: "inline-block" }} fontSize={"small"} /><div style={{ paddingLeft: calPadding, display: "inline-block" }}><FaPallet />{row.original.bstoCode}</div></div>
                }
                else {
                    return <><InsertDriveFileIcon fontSize={"small"} />{row.original.bstoCode}</>
                }
            }
            setColumns([findCode, ...cols])
        }
        else {
            findCode.Cell = function (row) {
                if (row.original.lvl > 0) {
                    let calPadding = row.original.lvl * 20
                    let calPadding2 = (row.original.lvl - 1) * 20
                    return <div style={{ display: "inline-block", paddingLeft: calPadding2 }}><SubdirectoryArrowRightIcon style={{ display: "inline-block" }} fontSize={"small"} /><div style={{ paddingLeft: calPadding, display: "inline-block" }}><FaPallet />{row.original.bstoCode}</div></div>
                }
                else {
                    return <><InsertDriveFileIcon fontSize={"small"} />{row.original.bstoCode}</>
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
    const { documents } = useContext(ProcessQueueContext);

    useEffect(() => {
        setOpen(props.open)
    }, [props.open]);

    useEffect(() => {
        if (!IsEmptyObject(data)) {
            let process = { ...props.data }.processResults.map(x => {
                let objData = { "docCode": x.docCode }
                let arrPallet = [];
                x.processResultItems.forEach(processRes => {
                    let itemHeader = {}
                    for (let obj in processRes) {
                        if (obj !== "pickStos") {
                            if (obj === "docItemCode")
                                itemHeader["bstoCode"] = processRes[obj]
                            else if (obj === "baseQty") {
                                let findQty = documents.documentListValue.find(x => x.ID === processRes["Document_ID"]).docItems.find(x => x.ID === processRes["docItemID"])
                                let sumPicking = processRes["pickStos"].map(psto => psto.pickQty).reduce((s, v) => s + v, []);
                                itemHeader["pickQty"] = sumPicking + '/' + findQty.Quantity === 0 ? sumPicking : findQty.Quantity;
                            }
                            else
                                itemHeader[obj] = processRes[obj]

                            itemHeader.lvl = 0
                        }
                    }
                    arrPallet.push(itemHeader)

                    arrPallet = arrPallet.concat(processRes.pickStos.map(y => { return { ...y, "lvl": 1 } }))
                })
                objData.processResult = arrPallet;
                return objData;
            });
            setItemProcess(process)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        setData({ ...props.data })
    }, [props.data])

    const onClickConfirm = () => {
        let confirmData = {};
        confirmData["desASRSWarehouseCode"] = data["desASRSWarehouseCode"];
        confirmData["desASRSLocationCode"] = data["desASRSLocationCode"];
        confirmData["flagAuto"] = props.flagAuto;
        confirmData["desASRSAreaCode"] = data["desASRSAreaCode"];
        if (props.waveProcess) {
            confirmData["waveRunMode"] = mode;
            if (mode === 1)
                confirmData["scheduleTime"] = datetime;
        }
        confirmData["processResults"] = data.processResults;

        Axios.post(window.apipath + "/v2/" + props.confirmProcessUrl, confirmData).then(res => {
            props.onClose(res.data, false);
        });
    }

    const res = () => itemProcess.length > 0 ? itemProcess.map(x => {
        return <Accordion style={{ marginBottom: "5px"}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{x.docCode}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ width: "100%", height:"400px" }}>
                    <AmTable
                        columns={columns}
                        dataSource={x.processResult}
                        sortable={false}
                        filterable={false}
                        dataKey="pstoID"
                        pageSize={1000}
                        minRows={20}
                        tableConfig={false}
                    />
                </div>
            </AccordionDetails>
        </Accordion>
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
                    data={[{ "value": "0", "label": "Manual" }, { "value": "1", "label": "Schedule" }, { "value": "2", "label": "Sequent" }]}
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
        styleDialog={{ maxWidth: "800px" }}
        open={open}
        close={a => { setOpen(!open); props.onClose(); }}
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
                    props.onClose()
                }}>Cancel</AmButton>
        }
    />;
}

const Accordion = withStyles({
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
})(MuiAccordion);

const AccordionSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: "30px !important",
        '&$expanded': {
            minHeight: "30px !important",
        }
    },
    content: {
        margin: "0 !important",
        '&$expanded': {
            margin: "0 !important",
        }
    },
    expandIcon: {
        padding: 0,
        '&$expanded': {
            padding: 0,
        }
    },
})(MuiAccordionSummary);


const AccordionDetails = withStyles({
    root: {
        display:"block"
    },
})(MuiAccordionDetails);

const CheckboxCustom = withStyles({
    root: {
        padding: "0 !important",
        marginRight: "5px"
    },

})(Checkbox);

const IconButtonCustom = withStyles({
    root: {
        padding: "0 !important",
        color:"black",
        position:"relative"
    },

})(IconButton);

const Delete = withStyles({
    root: {
        marginRight: "15px"
    },
})(DeleteIcon);

const OrderbyCustom = (props) => {
    const [data, setData] = useState(() => {
        if (props.sortData !== undefined) {
            return props.sortData.orderBys.map(x => {
                return { fieldName: x.fieldName, orderByType: x.orderByType ? x.orderByType : "0", order: x.order };
            });
        }
        else {
            return [];
        }
    });
    const [select, setSelect] = useState({})
    const [open, setOpen] = useState(false)
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        setOpen(props.open)
    }, [props.open]);

    useEffect(() => {
        const newOrder = props.orderList.filter(x => {
            return data.find(y => y.fieldName === x.sortField) === undefined
        });
        setOrderList(newOrder);
    }, [data]);

    const onClickAddItem = () => {
        if (select.fieldName !== undefined && select.fieldName !== null) {
            data.push({ ...select, order: data.length + 1 })
            setData([...data])
            setSelect({})
        }
    }

    const onClickRemoveItem = (item) => {
        const res = data.filter(x => x.fieldName !== item.fieldName)
            .sort((a, b) => a - b)
            .map((x, idx) => {
                return { ...x, order: idx + 1 };
            });
        setData(res)
    }

    const createElement = () => {
        return <>
            <FormInline>
                <AmDropdown
                    id={"order"}
                    placeholder={"order"}
                    fieldDataKey={"sortField"}
                    fieldLabel={["field"]}
                    width={200}
                    ddlMinWidth={200}
                    labelPattern=" : "
                    data={orderList}
                    value={select.fieldName}
                    zIndex={9999}
                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                        setSelect({ fieldName: value, orderByType: "0" })
                    }} />&nbsp;&nbsp;
            <AmDropdown
                    id={"orderSign"}
                    placeholder={""}
                    fieldDataKey={"value"}
                    fieldLabel={["label"]}
                    labelPattern=" : "
                    width={100}
                    ddlMinWidth={50}
                    defaultValue={"0"}
                    data={orderObj}
                    zIndex={9999}
                    onChange={(value, dataObject, inputID, fieldDataKey) => {
                        select.orderByType = value;
                    }} />
                <AmButton style={{ marginLeft: 10, display: "inline" }} styleType="confirm" onClick={onClickAddItem}>Add</AmButton>
            </FormInline>
            {data.map(x => <FormInline>{x.order}-{props.orderList.find(y => x.fieldName === y.sortField).field} | {orderObj.find(y => x.orderByType === y.value).label}
                <IconButtonCustom><DeleteIcon onClick={() => onClickRemoveItem(x)}/></IconButtonCustom>
                 {/* <AmButton styleType="delete_clear" onClick={() => onClickRemoveItem(x)}>Remove</AmButton> */}
            </FormInline>)
            }
        </>
    }

    return <AmDialogConfirm
        styleDialog={{ width: "500px" }}
        open={open}
        close={a => { setOpen(!open); props.onClose(); }}
        bodyDialog={createElement(props.orderList)}
        customAcceptBtn={
            <AmButton
                styleType="confirm_clear"
                onClick={() => {
                    props.confirmOrder(props.sortData, data);
                    setOpen(!open);
                }}>OK</AmButton>
        }
        customCancelBtn={
            <AmButton
                styleType="delete_clear"
                onClick={() => {
                    setOpen(!open)
                    props.onClose()
                }}>Cancel</AmButton>
        }
    />;
}

ProcessQueueDetail.propTypes = {
    /**
    * กำหนดค่าเริ่มต้นสำหรับสร้าง Wave
    * ** value : "1"
    */
    modeDefault: PropTypes.string,
    /**
     * ใช้เปิดปิดการเบิกแบบเป็น percent
     ** value : true || false
    */
    percentRandom: PropTypes.bool,
    /**
     * รูปแบบของหัวตารางของรายละเอียดเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    documentItemDetail: PropTypes.array.isRequired,
    /**
    * รูปแบบของหัวตารางสำหรับข้อมูลก่อน comfirm wave งานเบิก
    * ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    columnsConfirm: PropTypes.array.isRequired,
    /**
     * query string สำหรับดึงข้อมูล Area
     ** value? : string
    */
    areaQuery: PropTypes.array.isRequired,
    /**
     * รายการ Area โดยใช้เงื่อนไขผ่าน {arealist:[],document:{document:{}, docItem:[]}} โดยส่ง Area List กลับ
     ** value? : (arealist,doc)=> {return arealist}
    */
    customDesArea: PropTypes.func,
    /**
     * ข้อมูล Area เริ่มต้น โดยใช้เงื่อนไขผ่าน {document:{}, docItem:[]}
     ** value? : (doc)=> {return value}
    */
    areaDefault: PropTypes.func,
    /**
     * Url สำหรับ process queue
     ** value? : process_wq
    */
    processUrl: PropTypes.string,
    /**
     * Url สำหรับ confirm process queue
     ** value? : confirm_process_wq
    */
    confirmProcessUrl: PropTypes.string,
}
export default ProcessQueueDetail;