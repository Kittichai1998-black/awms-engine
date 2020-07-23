import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
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

const Axios = new apicall()

const LabelStyle = {
    fontWeight: "bold",
    paddingRight: '20px'
}

const FormGroup = styled.div`
display: flex;
// flex-flow: row wrap;
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
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}

const steps = ['Warehouse', 'Pallet', 'Area', 'Barcode', 'Location']

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

const AmMappingHH = (props) => {
    // const classes = useStyles();
    // const [activeStep, setActiveStep] = useState(0);
    const [datasTreeView, setDatasTreeView] = useState([])
    const [editData, setEditData] = useState({})
    const [activeStep, handleNext, handleBack, handleReset] = useSteps(0)
    // const steps = steps;
    // const tableSize = useWindowSize(containerRef)
    const treeview = useRef();

    // const containerRef = useRef()
    // const [width] = useWindowSize(containerRef)

    useEffect(() => {
        switch (steps[activeStep - 1]) {
            case "Pallet":
                console.log("Pallet");
                // Axios.get(createQueryString(AreaMasterQuery)).then(res => {
                //     console.log(editData);
                //     console.log(res);
                //     handleBack()
                // })
                break;
            case "Area":
                // Axios.get(createQueryString(AreaMasterQuery)).then(res => {
                //     console.log(editData);
                //     console.log(res);
                //     handleBack()
                // })
                // Axios.post(window.apipath + "/v2/ScanMapStoAPI", editData).then(res => {
                //     console.log(editData);
                //     console.log(res);
                //     handleBack()
                // })
                break;
            default: break;

        }
        // effect
        // return () => {
        //     cleanup
        // }
    }, [activeStep])




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
                            // DDref={ref.current[index]}
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
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeForm(fieldDataKey, dataObject)}
                            ddlType={"search"} //รูปแบบ Dropdown 
                        />
                    </FormGroup>
                );
            case "Pallet":
                return (
                    <FormGroup>
                        <Label style={LabelStyle}>Pallet</Label>
                        <AmInput
                            // required={true}
                            // error={true}
                            autoFocus
                            defaultValue={editData.scanCode ? editData.scanCode : ""}
                            // validate={true}
                            // msgError="Error"
                            // regExp={""}
                            // onChange={(value, dataObject, inputID, fieldDataKey) => onChangeForm(1, value)}
                            // onKeyPress={(value, dataObject, inputID, fieldDataKey) => onChangeForm(1, value)}
                            onKeyUp={(value, dataObject, inputID, fieldDataKey) => onChangeForm("scanCode", value)}
                        />
                    </FormGroup>
                )
            case "Barcode":
                return (
                    <TreeView
                        // selectRow={true}
                        ref={treeview}
                        showCheckbox={true}
                        // onExpanded={GetFile}
                        // onSelectItem={DownloadFile}
                        items={datasTreeView}
                    // style={{width: "",height: ""}}
                    />
                )
            default:
                return 'Unknown step';
        }
    }

    const onChangeForm = (field, data) => {
        // console.log(field, data);
        if (data) {
            let _editData = Clone(editData)
            if (typeof data === "object") {
                _editData[field] = data[field] && data[field]
            }
            else {
                _editData[field] = data
            }
            console.log(_editData);
            setEditData(_editData)
        }


        // console.log(typeof {});
        // let test = {}
        // console.log(IsEmptyObject(null));
        // console.log(data);

        // if (data) {
        //     _editData[field] = data
        // }
    }
    return (
        <>
            {/* <div className={classes.root}> */}
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
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
                                    onClick={handleBack}
                                    style={{ margin: "8px 8px 0 0" }}
                                >
                                    Back
                                        </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNext}
                                    style={{ margin: "8px 8px 0 0" }}
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} style={{ padding: "24px" }}>
                    <Typography>All steps completed - you&apos;re finished</Typography>
                    <Button onClick={handleReset} style={{ margin: "8px 8px 0 0" }}>
                        Reset
                        </Button>
                </Paper>
            )}
            {/* </div> */}
        </>
    )
}

export default AmMappingHH
