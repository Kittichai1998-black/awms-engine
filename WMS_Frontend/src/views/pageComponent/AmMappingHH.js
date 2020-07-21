import React from 'react';
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
import AmInput from '../../components/AmInput'
import AmDropdown from '../../components/AmDropdown'
import Label from '../../components/AmLabelMultiLanguage'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'

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
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}

const AmMappingHH = (props) => {
    // const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    function getSteps() {
        return ['Warehouse', 'Pallet', 'Barcode', 'Location'];
    }

    // const createElementEditor = () => {
    //     if (props.elementEditor)
    //         return
    // }

    function getStepContent(step) {
        switch (step) {
            case 0:
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
                            fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            // width={300} //กำหนดความกว้างของช่อง input
                            ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                            // valueData={"Name"} //ค่า value ที่เลือก
                            queryApi={WarehouseQuery}
                            // data={dataUnit}
                            returnDefaultValue={true}
                            defaultValue={1}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeForm(1, dataObject)}
                            ddlType={"search"} //รูปแบบ Dropdown 
                        />
                    </FormGroup>
                );
            case 1:
                return (
                    <FormGroup>
                        <Label style={LabelStyle}>Pallet</Label>
                        <AmInput
                            autoFocus
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeForm(1, dataObject)}
                            onKeyPress={(value, dataObject, inputID, fieldDataKey) => onChangeForm(1, dataObject)}
                        />
                    </FormGroup>
                )
            case 2:
                return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
            default:
                return 'Unknown step';
        }
    }

    const onChangeForm = (form, data) => {
        console.log(form, data);
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
