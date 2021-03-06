import React, { useRef, useState, useLayoutEffect, useEffect, createRef } from 'react';

// import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import styled from 'styled-components'
// import CardContent from '@material-ui/core/CardContent';
// import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import AmInput from '../../../components/AmInput'
import AmButton from '../../../components/AmButton'
import AmDropdown from '../../../components/AmDropdown'
import Label from '../../../components/AmLabelMultiLanguage'
import { apicall, createQueryString, Clone, DateTimeConverter, FilterURL, IsEmptyObject } from '../../../components/function/CoreFunction'
// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from '@material-ui/core/InputLabel'
// import FormHelperText from '@material-ui/core/FormHelperText'
import useSteps from './useSteps'
import TreeView from 'deni-react-treeview'
import { AiFillDelete } from 'react-icons/ai';
import './AmMappingHH.scss'
import AmDialogs from '../../../components/AmDialogs'
// import AmDialogConfirm from '../../../components/AmDialogConfirm'
import AmEditorTable from '../../../components/table/AmEditorTable'
import useSwitch from '../../../components/Hook/useSwitch'
import useGenerateFieldAmEditorTable from './useGenerateFieldAmEditorTable'

const Axios = new apicall()

const LabelStyle = {
    fontWeight: "bold",
    paddingRight: '20px'
}

const FormGroup = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
// @media (max-width: 800px) {
//     flex-direction: column;
//     align-items: stretch;
    
//   }
`;

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;
const LabelD = styled.label`
font-size: 10px
  width: 50px;
`;
const InputDiv = styled.div``;
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
const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID as warehouseID,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const DocumentProcessTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "DocumentProcessType",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID as processType,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "Name,Code,ID as areaID",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}

const steps = ['Warehouse', 'DocProcessType', 'Pallet', 'Area', 'Barcode', 'Location']

const actionButtons = [
    (<AiFillDelete size="15" color="#ff704d" />)
];

const detailPack = [
    { label: "GR", accessor: "grCode", type: "text", type: "text" },
    { label: "PA", accessor: "putawayCode", type: "text" },
    { label: "SKUItem", accessor: "pstoCode" },
    { label: "Batch", accessor: "batch", type: "text" },
    { label: "Lot", accessor: "lot", type: "text" },
    { label: "Quantity", accessor: ["addQty", "unitTypeCode"], type: "inputNum" }
]

const AmMappingHH = (props) => {

    // const classes = useStyles();
    // const [activeStep, setActiveStep] = useState(0);
    const [itemSelect, setItemSelect] = useState()
    const [dataDocSelect, setDataDocSelect] = useState()
    const [GenerateFieldAmEditorTable, dataAmEditorTable] = useGenerateFieldAmEditorTable(detailPack, itemSelect, dataDocSelect)
    const [datasTreeView, setDatasTreeView] = useState([])
    const [editData, setEditData] = useState(
        {
            processType: null,
            bstoCode: "BSS0000001",
            warehouseID: 1,
            areaID: null,
            locationID: null,
            pstos: [],
            //rootOptions: "_done_des_estatus=12&_mvt=1011",

            //qr: "N|1|20386,20291|160,100"
        }
    )
    const [dataModal, setDataModal] = useState({})
    const [activeStep, handleNext, handleBack, handleReset] = useSteps(0)
    const [isOpen, open, close] = useSwitch(0)
    // const steps = steps;
    // const tableSize = useWindowSize(containerRef)
    const [areaLocationMasterQuery, setAreaLocationMasterQuery] = useState()
    const [dataBarCode, setDataBarCode] = useState()
    const [areaLocationID, setAreaLocationID] = useState()
    // const ref = useRef([0, 1, 2, 3, 4, 5, 6, 7].map(() => createRef()))
    const [requiredField, setRequiredField] = useState({ pallet: false, area: false, qr: false })

    const [dialog, setDialog] = useState({ type: null, text: null, open: false })
    const [dialogpopup, setDialogpopup] = useState(false);

    const AreaLocationMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ObjectSize_ID", "c":"=", "v": 1}]',
        f: "Code as locationCode,ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    function getStepContent(index) {
        switch (steps[index]) {
            case "Warehouse":
                return (
                    <FormGroup>
                        <Label style={LabelStyle}>Warehouse</Label>
                        <AmDropdown
                            // required={required}
                            // error={rowError}
                            // helperText={inputError.length ? "required field" : false}
                            // id={idddl}
                            // DDref={ref.current[0]}
                            placeholder="Select"
                            fieldDataKey="warehouseID" //??????????????????Column ???????????????????????????table ??????db 
                            fieldLabel={["Name"]} //???????????????????????????????????????????????????????????????????????? optionList ????????? ???????????? input
                            labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                            // width={300} //??????????????????????????????????????????????????????????????? input
                            ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                            // valueData={"Name"} //????????? value ????????????????????????
                            queryApi={WarehouseQuery}
                            // data={dataUnit}
                            // returnDefaultValue={true}
                            defaultValue={editData.warehouseID ? editData.warehouseID : null}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(fieldDataKey, dataObject)}
                            ddlType={"search"} //?????????????????? Dropdown 
                        />
                    </FormGroup>
                );
            case "DocProcessType":
                return (
                    <FormGroup>
                        <Label style={LabelStyle}>DocProcess.Type</Label>
                        <AmDropdown
                            placeholder="Select"
                            fieldDataKey="processType" //??????????????????Column ???????????????????????????table ??????db 
                            fieldLabel={["Name"]} //???????????????????????????????????????????????????????????????????????? optionList ????????? ???????????? input
                            labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????                        
                            ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                            queryApi={DocumentProcessTypeQuery}
                            // data={dataUnit}
                            // returnDefaultValue={true}
                            defaultValue={editData.processType ? editData.processType : null}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(fieldDataKey, dataObject)}
                            ddlType={"search"} //?????????????????? Dropdown 
                        />
                    </FormGroup>
                );
            case "Pallet":
                return (
                    <FormGroup>
                        <Label style={LabelStyle}>Pallet</Label>
                        <AmInput
                            required={true}
                            // inputRef={ref.current[1]}
                            error={requiredField.pallet}
                            // autoFocus
                            defaultValue={editData.scanCode ? editData.scanCode : ""}
                            // validate={true}
                            // msgError="Error"
                            // regExp={""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                            onKeyPress={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                        // onKeyUp={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                        />
                    </FormGroup>
                )
            case "Area":
                return (
                    <>
                        <FormGroup>
                            <Label style={LabelStyle}>Area</Label>
                            <AmDropdown
                                required={true}
                                error={requiredField.area}
                                // helperText={inputError.length ? "required field" : false}
                                // id={idddl}
                                // DDref={ref.current[2]}
                                placeholder={"Select"}
                                fieldDataKey="areaID" //??????????????????Column ???????????????????????????table ??????db 
                                fieldLabel={["Code", "Name"]} //???????????????????????????????????????????????????????????????????????? optionList ????????? ???????????? input
                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                                // width={300} //??????????????????????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                                // valueData={valueText[idddl]} //????????? value ????????????????????????
                                queryApi={AreaMasterQuery}
                                // data={dataUnit}
                                // returnDefaultValue={true}
                                defaultValue={editData.areaID ? editData.areaID : null}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("areaID", dataObject, null, ['locationCode'])}
                                ddlType={"search"} //?????????????????? Dropdown 
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={LabelStyle}>Location</Label>
                            <AmDropdown
                                // helperText={inputError.length ? "required field" : false}
                                // id={"locationCode"}
                                // DDref={ref.current[3]}
                                placeholder={"Select"}
                                fieldDataKey="ID" //??????????????????Column ???????????????????????????table ??????db 
                                fieldLabel={["locationCode"]} //???????????????????????????????????????????????????????????????????????? optionList ????????? ???????????? input
                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                                // width={width ? width : 300} //??????????????????????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                                // valueData={valueText[idddl]} //????????? value ????????????????????????
                                queryApi={areaLocationMasterQuery}
                                // data={dataUnit}
                                // returnDefaultValue={true}
                                defaultValue={editData.locationCode ? editData.locationCode : null}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("locationCode", dataObject)}
                                ddlType={"search"} //?????????????????? Dropdown 
                            />
                        </FormGroup>
                    </>

                )
            case "Barcode":
                console.log(datasTreeView)
                return (
                    <>
                        <div className="theme-customization">
                            <TreeView
                                // selectRow={true}
                                // ref={treeview}
                                // Expanded
                                // showCheckbox={true}
                                // onExpanded={clicktest}
                                onSelectItem={(item, actionButton) => {
                                    console.log(item);
                                    if (item.layer !== 1) {
                                        open();
                                        setDialog(true)
                                        setItemSelect(item);
                                        console.log(item);
                                    }
                                }}
                                // actionButtons={actionButtons}
                                items={datasTreeView}
                                // onActionButtonClick={(item, actionButton) => { open(); setItemRemove(item) }}
                                style={{ width: "100%", height: "" }}
                            />
                        </div>
                        <FormGroup>
                            <Label style={LabelStyle}>QR</Label>
                            <AmInput
                                error={requiredField.qr}
                                required={true}
                                // inputRef={ref.current[5]}
                                // error={true}
                                autoFocus
                                defaultValue={editData.qr ? editData.qr : ""}
                                // validate={true}
                                // msgError="Error"
                                // regExp={""}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("qr", value)}
                                onKeyPress={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("qr", value)}
                            // onKeyUp={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                            />
                        </FormGroup>
                    </>
                )
            case "Location":
                return (
                    <>
                        <div className="theme-customization">
                            <TreeView
                                // selectRow={true}
                                // ref={treeview}
                                // Expanded
                                // showCheckbox={true}
                                // onExpanded={clicktest}
                                onSelectItem={(item, actionButton) => {
                                    if (item.layer !== 1) {
                                        open();
                                        setItemSelect(item);
                                        console.log(item);
                                    }
                                }}
                                // actionButtons={actionButtons}
                                items={datasTreeView}
                                // onActionButtonClick={(item, actionButton) => { open(); setItemRemove(item) }}
                                style={{ width: "100%", height: "" }}
                            />
                        </div>
                        {generateListLabel(detailPack)}
                    </>
                )
            default:
                return 'Unknown step';
        }
    }

    const generateListLabel = (obj) => {
        return editData.pstos.map(x => {
            return (
                <Box

                    boxShadow={2}
                    p={2}
                    style={{ borderRadius: "5px", marginTop: "5px" }}
                >
                    {obj.map((y, yi) => {
                        return (
                            <>
                                <FormGroup key={yi}>
                                    <Label style={{ fontWeight: "bold" }}>{y.label} : </Label>
                                    <label>{Array.isArray(y.accessor) ? y.accessor.map((z, zi) => x[y.accessor[zi]]).join(" ") : x[y.accessor]}</label>
                                </FormGroup>
                            </>
                        )
                    })}
                </Box>
            )
        })
    }

    const onChangeEditor = (field, data, related, removeRelated) => {
        console.log(field, data);
        let _editData = Clone(editData)
        if (typeof data === "object" && data) {
            _editData[field] = data[field] && data[field]
            if (related)
                for (let [key, value] of Object.entries(related)) {
                    if (key in data) {
                        _editData[value] = data[key]
                    }
                }
            if (removeRelated)
                removeRelated.forEach(x => delete _editData[x])
        } else {
            _editData[field] = data
        }

        if (field === "scanCode" && data) {
            console.log(data)
            const Query = {
                queryString: window.apipath + "/v2/SelectDataViwAPI/",
                t: "r_StorageObject",
                q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Pallet", "c":"=", "v":"' + data + '"}]',
                f: "*",
                g: "",
                s: "[{'f':'Pallet','od':'asc'}]",
                sk: 0,
                l: 1,
                all: ""
            };
            var queryStr = createQueryString(Query)
            Axios.get(queryStr).then(res => {
                // console.log(res.data.datas[0].AreaID)
                if (IsEmptyObject(res.data.datas)) {
                    editData["areaID"] = res.data.datas[0].AreaID
                }
            });

        } else if (field === "areaID" && data) {
            // let _AreaLocationMasterQuery = { ...AreaLocationMasterQuery }
            let query = AreaLocationMasterQuery.q ? JSON.parse(AreaLocationMasterQuery.q) : ""
            query.push({ f: "AreaMaster_ID", c: "=", v: data[field] })
            AreaLocationMasterQuery.q = JSON.stringify(query)
            console.log(AreaLocationMasterQuery);
            setAreaLocationMasterQuery(AreaLocationMasterQuery)
        }

        console.log(_editData);
        setEditData(_editData)
    }

    const handleStep = (step) => {
        console.log(steps[activeStep])
        switch (steps[activeStep]) {
            case "Warehouse":
                handleNext()
                break
            case "Pallet":
                if (step === "next") {
                    // let _editData = Clone(editData)
                    let _requiredField = { ...requiredField }
                    if (editData.scanCode) {
                        handleNext()
                        _requiredField.pallet = false
                    } else {
                        _requiredField.pallet = true
                    }
                    setRequiredField(_requiredField)
                } else if (step === "back") {
                    handleBack()
                }
                break;
            case "DocProcessType":
                if (step === "next") {
                    //console.log(_editData)
                    //let _editData = Clone(editData)
                    let _requiredField = { ...requiredField }
                    if (editData.processType) {
                        handleNext()
                        _requiredField.pallet = false
                    } else {
                        _requiredField.pallet = true
                    }
                    setRequiredField(_requiredField)
                } else if (step === "back") {
                    handleBack()
                }
                break;
            case "Area":
                if (step === "next") {
                    //    let _editData = Clone(editData)
                    console.log(editData)
                    let _requiredField = { ...requiredField }
                    if (editData.areaID) {

                        _requiredField.area = false
                        Axios.post(window.apipath + "/v2/scan_mapping_sto", editData).then(res => {
                            // console.log(editData);
                            console.log(res);
                            // handleBack()
                            if (res.data._result.status) {
                                const _datasTreeView = [{ id: res.data.bsto.id, text: res.data.bsto.code, children: res.data.pstos, expanded: true, layer: 1 }]

                                const _editData = { ...editData }
                                _editData.datas = []
                                setEditData(_editData)
                                setDatasTreeView(_datasTreeView)
                                handleNext()
                            } else {
                                setDialog({ type: "error", text: res.data._result.message, open: true })
                            }
                        })

                    } else {
                        _requiredField.area = true
                    }
                    setRequiredField(_requiredField)
                } else if (step === "back") {
                    handleBack()
                }
                break;
            case "Barcode":
                if (step === "next") {
                    // let _editData = Clone(editData)
                    let _requiredField = { ...requiredField }
                    if (editData.qr) {
                        _requiredField.qr = false
                        Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${editData.qr}`).then(res => {
                            console.log(res);
                            if (res.data._result.status) {
                                // console.log(res);
                                const _datasTreeView = [...datasTreeView]
                                console.log(_datasTreeView)
                                setDataBarCode(...datasTreeView)
                                _datasTreeView[0].children = []
                                const _editData = { ...editData }
                                _editData.qr = null
                                res.data.datas.forEach(x => {
                                    console.log(x)
                                    if (!editData.datas.find(y => y.dociID === x.dociID)) {
                                        _datasTreeView[0].children.push({ id: res.data.grID, text: `${x.pstoCode} | ${x.addQty} ${x.unitTypeCode}`, isLeaf: true, showRoot: true, ...x, ...res.data })
                                        _editData.datas.push(x)
                                    }
                                })
                                handleNext()

                                // console.log(_editData);
                                setEditData(_editData)
                                setDatasTreeView(_datasTreeView)

                            } else {
                                setDialog({ type: "error", text: res.data._result.message, open: true })
                            }

                        })
                    } else {
                        _requiredField.qr = true
                    }
                } else if (step === "back") {
                    handleBack()
                } else if (step === "reset") {
                    handleReset()
                }
                break;
            case "Location":
                if (step === "put") {
                    Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${editData.qr}`).then(res => {
                        console.log(res);
                        if (res.data._result.status) {
                            // console.log(res);
                            const _datasTreeView = [...datasTreeView]
                            console.log(_datasTreeView)
                            setDataBarCode(...datasTreeView)
                            _datasTreeView[0].children = []
                            const _editData = { ...editData }
                            _editData.qr = null
                            res.data.datas.forEach(x => {
                                console.log(x)
                                if (!editData.datas.find(y => y.dociID === x.dociID)) {
                                    _datasTreeView[0].children.push({ id: res.data.grID, text: `${x.pstoCode} | ${x.addQty} ${x.unitTypeCode}`, isLeaf: true, showRoot: true, ...x, ...res.data })
                                    _editData.datas.push(x)
                                }
                            })
                            handleNext()

                            // console.log(_editData);
                            setEditData(_editData)
                            setDatasTreeView(_datasTreeView)

                        } else {
                            setDialog({ type: "error", text: res.data._result.message, open: true })
                        }

                    })
                }
                // handleBack()

                break;
            default: break;

        }
    }

    const removeItem = () => {
        if (itemSelect.layer) {
            // pallet
        } else {
            // pack
        }
    }
    const closePopup = (status, rowdata) => {
        console.log(rowdata)
        console.log(status)
        if (status) {
            //
        }
        close()

    }
    const DataGeneratepopup = () => {
        console.log(dataBarCode)
        return detailPack.map(y => {
            console.log(y)
            return {
                field: y.field,
                component: (data = null, cols, key) => {
                    console.log(dataBarCode.children[0][y.accessor])
                    return (
                        <div key={key}>

                            {y.label === "Quantity" ? <FormInline>
                                {" "}
                                <LabelH>{y.label} : </LabelH>
                                <InputDiv>
                                    <AmInput
                                        style={{ width: "60px" }} type="number"
                                        defaultValue={dataBarCode.children[0]["addQty"]}
                                        id={y.accessor}
                                        type="input"
                                        onChange={val => {
                                            onChangeEditor(val);
                                        }}
                                    />
                                </InputDiv>
                            </FormInline> : <FormInline>
                                    {" "}
                                    <LabelH>{y.label} : {dataBarCode.children[0][y.accessor]}</LabelH>
                                </FormInline>}


                        </div>
                    );
                }
            };
        });
    };
    return (
        <>
            {/* <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={"title"}
                open={isOpen}
                onAccept={(status, rowdata, inputError) => { closePopup(status, rowdata) }}
                data={dataAmEditorTable}
                objColumnsAndFieldCheck={{ objColumn: detailPack, fieldCheck: "accessor" }}
                columns={DataGeneratepopup()}
            /> */}
            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                open={isOpen}
                onAccept={(status, rowdata, inputError) => { closePopup(status, rowdata) }}
                titleText={"Title"}
                data={editData}
                columns={DataGeneratepopup()}
            />
            <AmDialogs typePopup={dialog.type} content={dialog.text} onAccept={(e) => { setDialog({ open: e }) }} open={dialog.open}></AmDialogs >
            <Box
                boxShadow={2}
                // p={2}
                style={{ borderRadius: "5px" }}
            >
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>
                                <Typography variant="h6">
                                    <Label style={{ fontWeight: 'bolder', textDecorationLine: 'underline', textDecorationColor: indigo[700] }}>{label}</Label>
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography>
                                    {/* <Box
                                    boxShadow={2}
                                    p={2}
                                    style={{ borderRadius: "5px" }}
                                > */}
                                    {getStepContent(index)}
                                    {/* </Box> */}
                                </Typography>
                                <div style={{ marginTop: '16px', textAlign: 'end' }}>
                                    {activeStep !== 0 &&
                                        <AmButton
                                            styleType="dark_clear"
                                            // disabled={activeStep === 0}
                                            onClick={() => handleStep("back")}
                                            style={{ margin: "8px 8px 0 0" }}
                                        >
                                            Back
                                        </AmButton>}
                                    <AmButton
                                        variant="contained"
                                        styleType="confirm"
                                        onClick={() => handleStep(activeStep === steps.length - 1 ? 'put' : 'next')}
                                        style={{ margin: "8px 8px 0 0" }}
                                    >{activeStep === steps.length - 1 ? 'Put' : 'Next'}
                                    </AmButton>
                                    {steps[activeStep] === "Barcode" && editData.datas.length ?
                                        <AmButton
                                            styleType="confirm_outline"
                                            // disabled={activeStep === 0}
                                            onClick={() => handleStep("reset")}
                                            style={{ margin: "8px 8px 0 0" }}
                                        >
                                            Confirm
                                        </AmButton> : null}

                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {
                    activeStep === steps.length && (
                        <Paper square elevation={0} style={{ padding: "24px" }}>
                            <Typography>All steps completed - you&apos;re finished</Typography>
                            <Button onClick={handleReset} style={{ margin: "8px 8px 0 0" }}>
                                Reset
                        </Button>
                        </Paper>
                    )
                }
            </Box>
        </>
    )
}

export default AmMappingHH
