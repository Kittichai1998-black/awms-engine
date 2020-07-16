import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
// import CardContent from '@material-ui/core/CardContent';
// import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import AmInput from '../../components/AmInput'
import AmDropdown from '../../components/AmDropdown'
import Label from '../../components/AmLabelMultiLanguage'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
}));

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

const AmMappingHH = () => {
    const classes = useStyles();
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

    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <>
                        <Box
                            boxShadow={2}
                            p={2}
                            style={{ borderRadius: "5px" }}
                        >
                            <FormControl>
                                <InputLabel htmlFor="my-input"> <Label>Warehouse</Label></InputLabel>
                                <Input></Input>
                                {/* <AmDropdown
                                    // required={required}
                                    // error={rowError}
                                    // helperText={inputError.length ? "required field" : false}
                                    // id={idddl}
                                    // DDref={ref.current[index]}
                                    placeholder="Select"
                                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                    fieldLabel={"Name"} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                    // width={width ? width : 300} //กำหนดความกว้างของช่อง input
                                    // ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                                    // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                    queryApi={WarehouseQuery}
                                    // data={dataUnit}
                                    // returnDefaultValue={true}
                                    defaultValue={1}
                                    // onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row)}
                                    ddlType={"search"} //รูปแบบ Dropdown 
                                /> */}
                                {/* <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText> */}
                            </FormControl>
                
                            {/* <form className={classes.root} noValidate autoComplete="off"> */}

                            {/* </form> */}
                        </Box>
                    </>
                );
            case 1:
                return 'An ad group contains one or more ads which target a shared set of keywords.';
            case 2:
                return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
            default:
                return 'Unknown step';
        }
    }
    return (
        <>
            <div className={classes.root}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                            <StepContent>
                                <Typography>{getStepContent(index)}</Typography>
                                <div className={classes.actionsContainer}>
                                    <div>
                                        <Button
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            className={classes.button}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            className={classes.button}
                                        >
                                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                        </Button>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <Button onClick={handleReset} className={classes.button}>
                            Reset
                        </Button>
                    </Paper>
                )}
            </div>
        </>
    )
}

export default AmMappingHH
