import React, { useState, useEffect, useRef, useMemo } from "react";

import {
    indigo,
    deepPurple,
    lightBlue,
    red,
    grey,
    green
} from "@material-ui/core/colors";
import { useTranslation } from "react-i18next";
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton";
import AmDropdown from "../../../../components/AmDropdown";
import AmInput from "../../../../components/AmInput";
import { withStyles } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import AmEditorTable from "../../../../components/table/AmEditorTable"
import styled from 'styled-components'
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import LabelT from '../../../../components/AmLabelMultiLanguage'
import { apicall} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

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
@media(max - width: 300px) {
    margin: 0;
}
`;

const styles = theme => ({
    root: {
        // maxWidth: '100%',
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
        ].join(",")
    },
    paperContainer: {
        maxWidth: "450px",
        width: "100%",
        minWidth: "300px",
        padding: theme.spacing(2, 1)
    },
    stepperContainer: {
        padding: "10px"
    },
    buttonAuto: {
        margin: theme.spacing(),
        width: "auto",
        lineHeight: 1
    },
    button: {
        marginTop: theme.spacing(),
        marginRight: theme.spacing()
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
        textAlign: "end"
    },
    actionsContainerStart: {
        marginBottom: theme.spacing(2),
        textAlign: "start"
    },
    resetContainer: {
        textAlign: "left"
    },
    tb: {
        fontSize: "18px"
    },
    tbhead: {
        fontWeight: "bold",
        verticalAlign: "top"
    },
    tbdetail: {
        width: "265px",
        whiteSpace: "initial"
    },
    print_size: {
        width: "400px",
        height: "600px",
        padding: "5px 12px",
        backgroundColor: "#ffffff"
    },
    print_title: {
        fontSize: "20px",
        paddingBottom: "5px",
        fontWeight: "bold",
        width: "100px"
    },
    print_detail: {
        fontSize: "36px",
        fontWeight: "bold",
        width: "300px",
        whiteSpace: "initial"
    },
    print_detail2: {
        fontSize: "26px",
        fontWeight: "bold",
        whiteSpace: "initial",
        width: "375px"
    },
    print_footer: {
        fontSize: "12px"
    },
    tb_bottom: {
        verticalAlign: "bottom",
        textAlign: "center"
    },
    tr_bottom: { verticalAlign: "bottom" },
    tr_top: { verticalAlign: "top" },
    divLine: {
        // borderBottom: '2px solid #000000',
        marginTop: 45
    },
    // labelHead: {
    //     fontWeight: "inherit",
    //     fontWeight: 'bold',
    // },
    labelHead2: {
        fontWeight: "inherit",
    },
    labelText: {
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1
    },
    labelTextRoot: {
        fontWeight: "bold",
        fontSize: 16,
        flexGrow: 1,
        display: 'inline-flex'
    },
    labelText2: {
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1,
        display: 'inline-flex'
    },
    statusLabel: {
        fontSize: 12,
        // height: '1.75em',
        padding: 3,
        width: 'auto',
    },
    textNowrap: { flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
    detail: {
        fontSize: '90%',
    },
    areadetail: {
        fontSize: '1.225em'
    },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
        padding: 3
    },
    addCircleIcon: {
        color: green[800]
    },
    removeCircleIcon: {
        color: red[700]
    }
});




const AreaMasterLocationQuerys = ()=> {
    return {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 20},{ "f": "ObjectSize_ID", "c":"=", "v": 4}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
}

const MappingReceive_HH = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [valueInput, setValueInput] = useState({});
    const [datas, setDatas] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);
    const [dialogGate, setdialogGate] = useState(false);
    const [areaMasterLocquery, setareaMasterLocquery] = useState(AreaMasterLocationQuerys);
    const [areaMasterLoc, setareaMasterLoc] = useState();
    const [bodyCode, setbodyCode] = useState();
    const [warehouseID, setwarehouseID] = useState(0);
    const [warehouseCode, setwarehouseCode] = useState();
    const [gateCode, setgateCode] = useState();
    const [gateID, setgateID] = useState();
    const [barCodeDoc, setbarCodeDoc] = useState();
    const [inputList, setInputList] = useState([{ barcode: "" }]);
    const [barCode, setbarCode] = useState([]);
    const [dataDoc, setdataDoc] = useState({});

    useEffect(() => {
        if (warehouseID != 0) {
            getareaLocQuery(warehouseID)
    }
    }, [warehouseID])


    useEffect(() => {
        if (gateCode) {
            getStepContent()           
        }
    }, [gateCode])

 


    const getareaLocQuery = (IDwarehouse) => {
        if (areaMasterLocquery) {
            let queryAr = areaMasterLocquery;
            let objQuery = areaMasterLocquery;
            if (objQuery !== null) {
                let areaLocqry = JSON.parse(objQuery.q)
                areaLocqry.push({ 'f': 'warehouse_ID', 'c': '=', 'v': IDwarehouse })
                objQuery.q = JSON.stringify(areaLocqry);
            }
            setareaMasterLocquery(queryAr);
            setareaMasterLoc(objQuery)
        }

    }

    const WarehouseMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'desc' }]",
        sk: 0,
        l: 100,
        all: ""
    };

    //steps
    const steps = getSteps();
    function getSteps() {

        var locationCode = "";
        if (valueInput) {
            if (valueInput.locationCode) { locationCode = gateCode; }
        }
        return [
            { label: t("Select Gate"), value: locationCode,idrow : 1 },
            { label: t('Scan Barcode Product'), value: null, idrow: 2},
            { label: t('Confirm Receive Pallet'), value: null, idrow: 3 },
        ];
    };

    // handle input change
    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...inputList];
        list[index][name] = value;
        barCode.push(list)
        setInputList(list);

    };

    // handle click event of the Remove button
    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);

        setInputList(list);

        let ele = document.getElementById("barcode" + index.toString());
        if (ele)
            ele.value = "";

    };

    // handle click event of the Add button
    const handleAddClick = () => {
        setInputList([...inputList, { barcode: "" }]);
    };

    const getStepContent = (step, row) => {
   
        switch (step) {
            case 0:
                var valueGate;
                if (row.idrow && row.idrow === 1) {
                      valueGate = row.value
                }


                return <div style={{ display: "flex" }}>
                    <AmInput
                        id={"locationCode"}
                        type="input"
                        placeholder={'Select Gate'}
                        autoFocus={true}
                        style={{ width: "100%" }}
                        defaultValue={valueGate ?  valueGate :'' }
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, "locationCode")}
                        onKeyPress={(value, obj, element, event) => {
                            if (event.key === "Enter") {
                                onHandleChangeInput(value, "locationCode");
                                handleNext(0);
                            }
                        }
                        }
                    />
                    <IconButton
                        size="small"
                        aria-label="info"
                        style={{ marginTop: "5px" }}
                    >
                        <SearchIcon
                            fontSize="small"
                         onClick={() => { OpenFindGate() }}
                        />
                    </IconButton>
                </div>
            case 1:
                return <RenderAddBarCode data={inputList} />
            case 2:
                return <><div>
                    {dataDoc ? <div><FormInline>
                        <labelHead>Document No. : </labelHead>
                        <labelText>{dataDoc.docCode}</labelText>
                    </FormInline>
                    <FormInline>
                        <labelHead>Gade :</labelHead>
                        <labelText>{dataDoc.gade}</labelText>
                    </FormInline>
                    <FormInline>
                        <labelHead>Lot : </labelHead>
                        <labelText>{dataDoc.lot}</labelText>
                    </FormInline>
                    <FormInline>
                        <labelHead>Start Pallet : </labelHead>
                        <labelText>{dataDoc.start_pallet}</labelText>
                    </FormInline>
                    <FormInline>
                        <labelHead>End Pallet : </labelHead>
                            <labelText>{dataDoc.end_pallet}</labelText>
                        </FormInline></div> : null}
                </div></>;
            default:
                return 'Unknown step';
        }

    }

    const OpenFindGate = () => {
       setdialogGate(true)

    }

 const RenderAddBarCode = React.memo(({ data }) => {
        return <div>
            {data.map((x, i) => {
                return (
                  
                    <div style={{ display: "flex" }}>
                        <AmInput
                            id={"barcode" + i.toString()}
                            name={"barcode"}
                            type="input"
                            placeholder="Enter Barcode"
                            defaultValue={x.barcode}
                            style={{ width: "100%" }}
                            onChange={(value, obj, element, event) => handleInputChange(event, i)}
                        />

                        {data.length !== 1 &&
                            <IconButton size="small" >
                                <RemoveCircleIcon
                                    className={classes.removeCircleIcon}
                                    fontSize="small"
                                    onClick={() => { handleRemoveClick(i) }}
                                />
                            </IconButton>
                        }
                        {data.length - 1 === i && i < 1 ? 
                            <IconButton size="small" >
                                <AddCircleIcon
                                    fontSize="small"
                                    className={classes.addCircleIcon}
                                    onClick={handleAddClick}
                                />
                            </IconButton> : null
                        }
                    </div>
                )
            })}
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(data)}</div> */}
        </div>

    });
    const handleNext = (index) => {
        if (index === 0) {
            if (valueInput.locationCode) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            } else {
                alertDialogRenderer("warning", t("Please Select Gate."))
            }
        }
        if (index === 1) {
            if(inputList.length > 0){
                // const listBarcode = inputList.find(obj => { return obj.barcode !== ""}).barcode;
                var listBarcode = []
                inputList.map((x,i)=>{
                    if((x.barcode !== undefined || x.barcode !== null) && x.barcode.length > 0){
                        listBarcode.push(x.barcode);
                    }
                });
                 
                if(listBarcode.length > 0){
                    CheckBarcodeMappingDocument(listBarcode);
                }else{
                     alertDialogRenderer("warning", t("Please Scan Barcode Product."))
                }
            }
        }
        if (index === 2) {
            ConfirmReceive();
        }
    }

    const handleBack = (index) => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        if (index === 1) {
            let ele = document.getElementById("locationCode");
            if (ele)
                ele.value = gateCode;

        }
       

    }

    const handleReset = () => {
        //setValueInput({});
        setActiveStep(0);
        setDatas(null);
        //setInputList([{ barcode: "" }]);
    };

    const onHandleChangeInput = (value, field) => {
        if (value) {
            if (field === 'locationCode') {
                setgateCode(value)
            }
            valueInput[field] = value;
        }
    };

    const CheckBarcodeMappingDocument = (listBarcode) => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        var qrCode = [];
        var barCode = {};
        let qrCodes;
        listBarcode.forEach((x, i) => {
            qrCodes = {
                "qrCode1": listBarcode[0] ? listBarcode[0] : "null",
                "qrCode2": listBarcode[1] ? listBarcode[1] : "null"
            }
 
        })
        qrCode.push(qrCodes)
        barCode['qrCodes'] = qrCode
        setbarCodeDoc(barCode);

        Axios.post(window.apipath + '/v2/FindDocByQRCode', barCode).then((res) => {
            if (res.data._result.status === 1) {
                setdataDoc(res.data);
            } else {
                setSettingAlert({ type: 'warning', message: res.data._result.message });
                setOpenAlert(true);
                setdataDoc();
            }
        });   

    }

    const ConfirmReceive = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        alertDialogRenderer("success", t("Sucess"))
        let barcode_pstos = [];
        let bars = barCodeDoc['qrCodes'][0]
        if (bars.qrCode1 && bars.qrCode2) {
            barcode_pstos.push(bars.qrCode1)
            barcode_pstos.push(bars.qrCode2)
        } else if (bars.qrCode){
            barcode_pstos.push(bars.qrCode1)
        }

        let datas = {}
        datas = {
            //"warehouseCode" : warehouseCode,
            "GateCode" : gateCode,
            "QR": barcode_pstos 
        }

        Axios.post(window.apipath + '/v2/checkregist_wc', barCode).then((res) => {
            if (res.data._result.status === 1) {
                //setdataDoc(res.data);
            } else {
                setSettingAlert({ type: 'warning', message: res.data._result.message });
                //setOpenAlert(true);
                //setdataDoc();
            }
        }); 


    }
    // Alert Dialog
    const alertDialogRenderer = (type, message) => {
        setSettingAlert({ type: type, message: message });
        setOpenAlert(true)
    }
    const onAccept = (data) => {
        setOpenAlert(data)
        if (data === false) {
            setSettingAlert(null)
        }
    }

    const editorListcolunmGate = () => {
        return [{
            "field": "ggg",
            "component": () => {
                return <div>
                    <FormInline>
                        <LabelT style={LabelTStyle}> Area :</LabelT>
                        <InputDiv>
                            <AmDropdown
                                //required={required}
                                id={'WarehouseID'}                            
                                placeholder={"Select"}
                                fieldDataKey={'ID'}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["Code"]} 
                                labelPattern=" : " 
                                width={ 200} 
                                ddlMinWidth={ 200} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={WarehouseMasterQuery}
                                // data={dataUnit}
                                returnDefaultValue={true}
                                defaultValue={1}
                                onChange={(value, dataObject, fieldDataKey) => onChangeEditor(value, dataObject, fieldDataKey)}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </InputDiv>
                    </FormInline>
                    <FormInline>
                        <LabelT style={LabelTStyle}>Gate :</LabelT>
                        <InputDiv>
                            <AmDropdown
                                //required={required}
                                id={'AreaLocCode'}
                                placeholder={"Select"}
                                fieldDataKey={'Code'}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["Code"]}
                                labelPattern=" : "
                                width={200}
                                ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={areaMasterLoc}
                                // data={dataUnit}
                                //returnDefaultValue={true}
                                //defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                                onChange={(value, dataObject, fieldDataKey) => onChangeEditor(value, dataObject, fieldDataKey)}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </InputDiv>
                    </FormInline>
                </div>
            }
        }]
    }

    const onChangeEditor = (value, dataObject, fieldDataKey) => {
        if (value && dataObject && fieldDataKey) {
            if (fieldDataKey === 'WarehouseID') {
                setwarehouseID(value)
                setwarehouseCode(dataObject.Code)
            } else if (fieldDataKey === 'AreaLocCode') {              
                setgateCode(value)
                setgateID(dataObject.ID)
            }
        }
    
   }

    const onHandleEditConfirm = (status, rowdata, inputError) => {
        if (status) {           
            setdialogGate(false)
            let ele = document.getElementById("locationCode");
            if (ele)
                ele.value = gateCode;

               valueInput['locationCode'] = gateCode;

        } else {
            valueInput["locationCode"] = ''
            setdialogGate(false)
        }

    }



    function AlertDialog(open, setting, onAccept) {
        if (open && setting) {
            return <AmDialogs typePopup={setting.type} content={setting.message}
                onAccept={(e) => onAccept(e)} open={open}></AmDialogs>
        } else {
            return null;
        }
    }
 

    function FindGateDialog(open, data, onConfirmSelect, onClose) {
        if (open && data) {
        } else {
            return null;
        }
    }
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])
   


    return (
        <>
            {/* {DialogFindGate} */}
            {DialogAlert}
            <AmEditorTable
                style={{ width: "300px", height: "300px" }}
                titleText={'GATE'}
                open={dialogGate}
                onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError)}
                //data={editData}
                //objColumnsAndFieldCheck={{ objColumn: props.columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunmGate()}
            />
            <Paper className={classes.paperContainer}>
                <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                    className={classes.stepperContainer}>

                    {steps.map((row, index) => (
                        
                        <Step key={row.label}>
                            <StepLabel>
                                <Typography variant="h6">{t(row.label)}{row.value ? " : " : ""}
                                    <label style={{ fontWeight: 'bolder', textDecorationLine: 'underline', textDecorationColor: indigo[700] }}>{row.value}</label>
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {getStepContent(index,row)}
                                <div className={classes.actionsContainer}>
                                    <div>
                                        <AmButton
                                            disabled={activeStep === 0}
                                            styleType="dark_clear"
                                            onClick={() => handleBack(index)}
                                            className={classes.button}
                                        >
                                            {t('Back')}
                                        </AmButton>
                                        <AmButton
                                            styleType="confirm"
                                            onClick={() => handleNext(index)}
                                            className={classes.button}
                                        >
                                            {activeStep === 0 ? 'Next' : activeStep === 1 ? t('Check') : t('Confirm')}
                                        </AmButton>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <AmButton styleType="dark_clear" onClick={handleReset} className={classes.button}>
                            {t('Reset')}
                        </AmButton>
                    </Paper>
                )}
            </Paper>
        </>
    );
}



MappingReceive_HH.propTypes = {

}
export default withStyles(styles)(MappingReceive_HH);