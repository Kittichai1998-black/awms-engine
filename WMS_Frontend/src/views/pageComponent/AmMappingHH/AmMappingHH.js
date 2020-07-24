import React, { useRef, useState, useLayoutEffect, useEffect, createRef } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components'
// import CardContent from '@material-ui/core/CardContent';
// import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import AmInput from '../../../components/AmInput'
import AmDropdown from '../../../components/AmDropdown'
import Label from '../../../components/AmLabelMultiLanguage'
import { apicall, createQueryString, Clone, DateTimeConverter, FilterURL, IsEmptyObject } from '../../../components/function/CoreFunction'
// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from '@material-ui/core/InputLabel'
// import FormHelperText from '@material-ui/core/FormHelperText'
import useSteps from './useSteps'
import TreeView from 'deni-react-treeview'
import { AiFillDelete } from 'react-icons/ai';

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

const steps = ['Warehouse', 'Pallet', 'Area', 'Barcode', 'Location']

const actionButtons = [
    (<AiFillDelete size="15" color="#ff704d" />)
];

// function useWindowSize(ref) {
//     const [size, setSize] = useState([0, 0]);
//     useLayoutEffect(() => {
//         function updateSize() {
//             console.log(ref);
//             if (ref.current)
//                 setSize([ref.current.offsetWidth, ref.current.offsetHeight]);
//         }
//         window.addEventListener('resize', updateSize);
//         updateSize();
//         return () => window.removeEventListener('resize', updateSize);
//     }, []);
//     return size;
// }

const AmMappingHH = () => {
    // const classes = useStyles();
    // const [activeStep, setActiveStep] = useState(0);
    const [datasTreeView, setDatasTreeView] = useState([])
    const [editData, setEditData] = useState({ action: 1, amount: 1, mode: 0, rootOptions: "_done_des_estatus=12&_mvt=1011" })
    const [activeStep, handleNext, handleBack, handleReset] = useSteps(0)
    // const steps = steps;
    // const tableSize = useWindowSize(containerRef)
    const [areaLocationMasterQuery, setAreaLocationMasterQuery] = useState()
    const ref = useRef([0, 1, 2, 3, 4, 5, 6, 7].map(() => createRef()))
    const [requiredField, setRequiredField] = useState({ pallet: false, area: false })
    // const containerRef = useRef()
    // const treeview = useRef()
    // const [width] = useWindowSize(containerRef)

    // useEffect(() => {
    //     console.log(ref);
    //     // console.log(treeview);

    //     switch (steps[activeStep - 1]) {
    //         case "Pallet":
    //             console.log("Pallet");
    //             let _editData = Clone(editData)
    //             if (!_editData.scanCode) {
    //                 handleBack()
    //                 let _requiredField = { ...requiredField }
    //                 _requiredField.pallet = true
    //                 setRequiredField(_requiredField)
    //             }

    //             // console.log(ref);
    //             // console.log(ref.current[1]);
    //             // console.log(treeview);

    //             // Axios.get(createQueryString(AreaMasterQuery)).then(res => {
    //             //     console.log(editData);
    //             //     console.log(res);
    //             //     handleBack()
    //             // })
    //             break;
    //         case "Area":
    //             // Axios.get(createQueryString(AreaMasterQuery)).then(res => {
    //             //     console.log(editData);
    //             //     console.log(res);
    //             //     handleBack()
    //             // })
    //             // Axios.post(window.apipath + "/v2/ScanMapStoAPI", editData).then(res => {
    //             //     console.log(editData);
    //             //     console.log(res);
    //             //     handleBack()
    //             // })
    //             break;
    //         default: break;

    //     }
    //     // effect
    //     // return () => {
    //     //     cleanup
    //     // }
    // }, [activeStep])




    // const createElementEditor = () => {
    //     if (props.elementEditor)
    //         return
    // }

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
                            fieldDataKey="warehouseID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            // width={300} //กำหนดความกว้างของช่อง input
                            ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                            // valueData={"Name"} //ค่า value ที่เลือก
                            queryApi={WarehouseQuery}
                            // data={dataUnit}
                            returnDefaultValue={true}
                            defaultValue={1}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(fieldDataKey, dataObject)}
                            ddlType={"search"} //รูปแบบ Dropdown 
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
                            autoFocus
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
                                fieldDataKey="areaID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                // width={300} //กำหนดความกว้างของช่อง input
                                ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={AreaMasterQuery}
                                // data={dataUnit}
                                // returnDefaultValue={true}
                                defaultValue={editData.areaID ? editData.areaID : null}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("areaID", dataObject, null, ['locationCode'])}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={LabelStyle}>Location</Label>
                            <AmDropdown
                                // helperText={inputError.length ? "required field" : false}
                                // id={"locationCode"}
                                // DDref={ref.current[3]}
                                placeholder={"Select"}
                                fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["locationCode"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                // width={width ? width : 300} //กำหนดความกว้างของช่อง input
                                ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={areaLocationMasterQuery}
                                // data={dataUnit}
                                // returnDefaultValue={true}
                                defaultValue={editData.locationCode ? editData.locationCode : null}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("locationCode", dataObject)}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </FormGroup>
                    </>

                )
            case "Barcode":
                return (
                    <>
                        <TreeView
                            selectRow={true}
                            // ref={ref.current[4]}
                            showCheckbox={true}
                            // onExpanded={GetFile}
                            // onSelectItem={DownloadFile}
                            actionButtons={actionButtons}
                            items={datasTreeView}
                            onActionButtonClick={onActionButtonClick}
                        // style={{width: "",height: ""}}
                        />
                        <FormGroup>
                            <Label style={LabelStyle}>QR</Label>
                            <AmInput
                                required={true}
                                // inputRef={ref.current[5]}
                                // error={true}
                                autoFocus
                                defaultValue={editData.scanCode ? editData.scanCode : ""}
                                // validate={true}
                                // msgError="Error"
                                // regExp={""}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                                onKeyPress={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                            // onKeyUp={(value, dataObject, inputID, fieldDataKey) => onChangeEditor("scanCode", value)}
                            />
                        </FormGroup>
                    </>
                )
            default:
                return 'Unknown step';
        }
    }

    const onChangeEditor = (field, data, related, removeRelated) => {
        // console.log(field, data);
        if (data) {
            let _editData = Clone(editData)
            if (typeof data === "object") {
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

            console.log(_editData);
            setEditData(_editData)

            if (field === "areaID") {
                let _AreaLocationMasterQuery = { ...AreaLocationMasterQuery }
                let query = AreaLocationMasterQuery.q ? JSON.parse(AreaLocationMasterQuery.q) : ""
                query.push({ f: "AreaMaster_ID", c: "=", v: data[field] })
                _AreaLocationMasterQuery.q = JSON.stringify(query)
                setAreaLocationMasterQuery(_AreaLocationMasterQuery)
            }
        }


        // console.log(typeof {});
        // let test = {}
        // console.log(IsEmptyObject(null));
        // console.log(data);

        // if (data) {
        //     _editData[field] = data
        // }
    }

    const handleStep = (step) => {
        switch (steps[activeStep]) {
            case "Warehouse":
                handleNext()
                break
            case "Pallet":
                if (step === "next") {
                    let _editData = Clone(editData)
                    let _requiredField = { ...requiredField }
                    if (_editData.scanCode) {
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
                    let _editData = Clone(editData)
                    let _requiredField = { ...requiredField }
                    if (_editData.areaID) {
                        handleNext()
                        _requiredField.area = false
                        Axios.post(window.apipath + "/v2/ScanMapStoAPI", editData).then(res => {
                            // console.log(editData);
                            console.log(res);
                            // handleBack()
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
                    // let _requiredField = { ...requiredField }
                    // if (_editData.areaID) {
                    //     handleNext()
                    //     _requiredField.area = false
                    // } else {
                    //     _requiredField.area = true
                    // }
                    // setRequiredField(_requiredField)

                } else if (step === "back") {
                    handleBack()
                }
                break;
            default: break;

        }
        // effect
        // return () => {
        //     cleanup
        // }
    }

    const onActionButtonClick = (item, actionButton) => {
        console.log(item, actionButton);
        const buttonName = actionButton.type.name;
        switch (buttonName) {
            case 'AiFillDelete':
                alert('Action: trash, Item: ' + item.text);
                break;
            default:
        }
    }
    return (
        <>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel><Label>{label}</Label></StepLabel>
                        <StepContent>
                            <Typography>
                                <Box
                                    boxShadow={2}
                                    p={2}
                                    style={{ borderRadius: "5px" }}
                                >{getStepContent(index)}</Box>
                            </Typography>
                            <div style={{ marginTop: '16px' }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={() => handleStep("back")}
                                    style={{ margin: "8px 8px 0 0" }}
                                >
                                    <Label>Back</Label>
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleStep("next")}
                                    style={{ margin: "8px 8px 0 0" }}
                                ><Label>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Label>
                                </Button>
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
        </>
    )
}

export default AmMappingHH
