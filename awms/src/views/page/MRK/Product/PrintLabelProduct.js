import React, { useState, useEffect, useRef } from "react";
import { withStyles } from '@material-ui/core/styles';
import { apicall, createQueryString, Clone } from '../../../../components/function/CoreFunction2';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import JsBarcode from 'jsbarcode';
import _ from 'lodash';
import html2canvas from 'html2canvas';
import styled from 'styled-components';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { setTimeout } from "timers";
import { useTranslation } from 'react-i18next'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    // THSarabunNew: {
    //     normal: 'THSarabunNew.ttf',
    //     bold: 'THSarabunNew-Bold.ttf',
    //     italics: 'THSarabunNew-Italic.ttf',
    //     bolditalics: 'THSarabunNew-BoldItalic.ttf'
    // },
    TFPhethai: {
        normal: 'TF-Phethai.ttf',
        italics: 'TF-Phethai-Italic.ttf',
        bold: 'TF-Phethai.ttf',
    },
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    }
}
const Axios = new apicall()

const styles = theme => ({
    root: {
        // maxWidth: '100%',
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    labelfont: {
        fontFamily: [
            '"Sarabun"', 'sans-serif'
        ].join(','),
    },
    paperContainer: {
        maxWidth: '450px',
        width: '100%',
        minWidth: '300px',
        padding: theme.spacing(2, 1),
    },
    stepperContainer: {
        padding: '10px',
    },
    buttonAuto: {
        margin: theme.spacing(),
        width: 'auto',
        lineHeight: 1
    },
    button: {
        marginTop: theme.spacing(),
        marginRight: theme.spacing(),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
        textAlign: 'end'
    },
    resetContainer: {
        textAlign: 'center'
    },
    tb: {
        fontSize: '18px',
    },
    tbhead: {
        fontWeight: 'bold',
        verticalAlign: 'top'
    },
    tbdetail: {
        width: '265px', whiteSpace: 'initial'
    },
    print_size: {
        width: '400px',
        height: '600px',
        padding: '5px 12px',
        backgroundColor: '#ffffff'
    },
    print_title: {
        fontSize: '20px',
        paddingBottom: '5px',
        fontWeight: 'bold',
        width: '100px'
    },
    print_detail: {
        fontSize: '36px',
        fontWeight: 'bold',
        width: '300px',
        whiteSpace: 'initial'
    },
    print_detail2: {
        fontSize: '26px',
        fontWeight: 'bold',
        whiteSpace: 'initial',
        width: '375px'
    },
    print_footer: {
        fontSize: '12px',
    },
    tb_bottom: {
        verticalAlign: 'bottom',
        textAlign: 'center'
    },
    tr_bottom: { verticalAlign: 'bottom' },
    tr_top: { verticalAlign: 'top' },
    divLine: {
        // borderBottom: '2px solid #000000',
        marginTop: 45
    }
})

const DivHidden = styled.div`
    overflow: hidden;
    height: 0;
`;
const StorageObjectViw = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "r_StorageObject",
    q: "",
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 1,
    all: "",
}

const PrintLabelProduct = (props) => {
    const { t } = useTranslation()

    const { classes, location } = props;

    const [valueInput, setValueInput] = useState({});

    const [datas, setDatas] = useState(null);
    const [dataShow, setDataShow] = useState(null);
    const [revNo, setRevNo] = useState(null);

    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();
    const [labelBarcode, setLabelBarcode] = useState(null);
    const [isLoad, setIsLoad] = useState(false);

    const alertDialogRenderer = (message, type, state) => {
        setMsgDialog(message);
        setTypeDialog(type);
        setStateDialog(state);
    }
    useEffect(() => {
        if (msgDialog && stateDialog && typeDialog) {
            setShowDialog(<AmDialogs typePopup={typeDialog} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >);
        } else {
            setShowDialog(null);
        }
    }, [stateDialog, msgDialog, typeDialog]);
    // useEffect(() => {
    //     console.log(valueInput);
    // }, [valueInput])
    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
    };
    const onHandleChangeInputPalletCode = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            GetPalletSto(value);
        }
    }
    function getSteps() {
        var baseCode = "";
        if (valueInput) {
            if (valueInput.PalletCode) { baseCode = valueInput.PalletCode; }
        }
        return [{ label: 'Barcode Pallet', value: baseCode },
        { label: 'Information of pallet', value: null },
        ];
    }

    useEffect(() => {
        const values = queryString.parse(location.search);
        var palletcode = values && values.palletcode ? values.palletcode.toString() : null;
        console.log(palletcode)
        if (palletcode) {
            onCreateBarcodeAuto(palletcode);
        }
    }, [location]);
    const onCreateBarcodeAuto = (value) => {
        valueInput['PalletCode'] = value;
        GetPalletSto(value);
    };

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <div>
                    <AmInput
                        id={"PalletCode"}
                        placeholder="Pallet code"
                        type="input"
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "PalletCode", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputPalletCode(value, null, "PalletCode", null, event)}
                    />
                </div>;
            case 1:
                return dataShow;
            default:
                return 'Unknown step';
        }
    }
    const handleNext = (index) => {
        if (index === 0) {
            GetPalletSto(valueInput.PalletCode);
        }
        if (index === 1) {
            //set , update Rev No. เมื่อคลิกโหลดแต่ละครั้ง
            UpdateOptions();
        }
    }

    const handleBack = (index) => {
        if (index === 1) {
            //setValueInput({ ...valueInput, ['PalletCode']: null })
            setValueInput({});
            setDataShow(null);
        }
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }

    function handleReset() {
        setActiveStep(0);
        setValueInput({});
        setDataShow(null);
        setRevNo(null);
        var img = document.getElementById("barcode");
        img.src = "#";
    }

    const GetPalletSto = (reqPalletCode) => {
        if (reqPalletCode) {
            let queryStr = Clone(StorageObjectViw);
            queryStr.q = "[{ 'f': 'Pallet', c:'=', 'v': '" + reqPalletCode.trim() + "'}]";
            Axios.get(createQueryString(queryStr)).then((response) => {
                if (response.data._result.status === 1) {
                    if (response.data.datas.length !== 0) {
                        setDatas(response.data.datas[0]);
                        setDataShow(DataShowRenderer(response.data.datas[0]));
                        //สร้างbarcode ก่อน 
                        createBarcode(response.data.datas[0]);
                        setActiveStep(prevActiveStep => prevActiveStep + 1);

                    } else {
                        alertDialogRenderer("Don't have Pallet : " + reqPalletCode + " in system", "error", true);
                        let ele2 = document.getElementById('PalletCode');
                        if (ele2)
                            ele2.value = "";
                        valueInput['PalletCode'] = null;
                        ele2.focus();

                    }
                } else {
                    alertDialogRenderer(response.data._result.message, "error", true);
                }
            });
        } else {
            alertDialogRenderer("Barcode Pallet must be value", "error", true);
        }
    }

    const DataShowRenderer = (data) => {
        return (<table style={{ width: "100%" }}>
            <tbody className={classes.tb}>
                <tr>
                    <td className={classes.tbhead}>Pallet ID:</td>
                    <td className={classes.tbdetail}>{data.Pallet}</td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>Mat. No.:</td>
                    <td className={classes.tbdetail}>{data.SKU_Code + " " + data.SKU_Name}</td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>Batch No.:</td>
                    <td className={classes.tbdetail}>{data.Batch}</td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>MNF.Date:</td>
                    <td className={classes.tbdetail}>{moment(data.Product_Date).format('DD.MM.YYYY')}</td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>PRD Qty:</td>
                    <td className={classes.tbdetail}><AmInput
                        id={"PRDQty"}
                        placeholder="PRD Qty"
                        type="input"
                        style={{ width: "100%" }}
                        defaultValue={parseInt(data.Qty, 10) + " " + data.Base_Unit}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "PRDQty", null, event)}
                    /></td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>Sale Qty:</td>
                    <td className={classes.tbdetail}><AmInput
                        id={"SaleQty"}
                        placeholder="Sale Qty"
                        type="input"
                        style={{ width: "100%" }}
                        defaultValue={parseInt(data.SaleQty, 10) + " " + data.Unit}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "SaleQty", null, event)}
                    /></td>
                </tr>
                <tr>
                    <td className={classes.tbhead}>Remark:</td>
                    <td className={classes.tbdetail}><AmInput
                        id={"Remark"}
                        placeholder="Remark"
                        type="input"
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "Remark", null, event)}
                    /></td>
                </tr>
            </tbody>
        </table>
        );
    }


    const clearlabel = () => {
        setRevNo(null);
        var img = document.getElementById("barcode");
        img.src = "#";
    }
    const createBarcode = (datas) => {
        var img = document.getElementById("barcode");
        JsBarcode(img, datas.Pallet, {
            format: "CODE128",
            lineColor: "#0aa",
            width: 3,
            height: 60,
            background: "#ffffff",
            lineColor: "#000000",
            displayValue: false
        });
    }
    function get2D(num) {
        return (num.toString().length < 2 ? "0" + num : num).toString();
    }
    const printPDF = (data = datas, rev) => {
        let revShow = get2D(rev);
        let Product_Date = moment(data.Product_Date).format('DD.MM.YYYY');
        let skuname = data.SKU_Name;
        let newskuname = skuname.length < 50 ? skuname : skuname.substr(0, 50) + "...";
        let PRDQty = valueInput.PRDQty ? valueInput.PRDQty : parseInt(data.Qty, 10) + " " + data.Base_Unit;
        let SaleQty = valueInput.SaleQty ? valueInput.SaleQty : parseInt(data.SaleQty, 10) + " " + data.Unit;
        let remark = valueInput.Remark ? valueInput.Remark : "";
        let status_Rev = data.Status + " Rev." + revShow;
        let username_Date = localStorage.getItem("Username") + "." + moment().format('DDMMYY');
        const barcode = document.getElementById('barcode');
        html2canvas(barcode, { dpi: 150 })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');

                var docDefinition = {
                    pageSize: { width: 400, height: 600 },
                    pageMargins: [10, 10, 10, 10],
                    content: [
                        {
                            layout: {
                                defaultBorder: false,
                                paddingTop: function (i, node) { return -6; },
                                paddingBottom: function (i, node) { return -6; },
                            },
                            table: {
                                widths: [105, '*'],
                                body: [
                                    [{ text: 'Pallet ID:', style: 'col1' }, { text: data.Pallet, style: 'col2' }],
                                    [{ text: 'Mat. No.:', style: 'col1' }, { text: data.SKU_Code, style: 'col2' }],
                                ]
                            }
                        },
                        {
                            layout: {
                                defaultBorder: false,
                            },
                            table: {
                                widths: ['*'],
                                heights: [90],
                                body: [
                                    [{ text: newskuname, style: 'skuname' }]
                                ]
                            }

                        },
                        {
                            layout: {
                                defaultBorder: false,
                                paddingTop: function (i, node) { return -6; },
                                paddingBottom: function (i, node) { return -6; },
                            },
                            table: {
                                widths: [105, '*'],
                                body: [
                                    [{ text: 'Batch No.:', style: 'col1' }, { text: data.Batch, style: 'col2' }],
                                    [{ text: 'MNF.Date:', style: 'col1' }, { text: Product_Date, style: 'col2' }],
                                    [{ text: 'PRD Qty:', style: 'col1' }, { text: PRDQty, style: 'col2' }],
                                    [{ text: 'Sale Qty:', style: 'col1' }, { text: SaleQty, style: 'col2' }],
                                ]
                            }
                        },
                        {
                            style: 'tableExample',
                            layout: {
                                defaultBorder: false,
                            },
                            table: {
                                widths: ['*', 3, '*', 3, '*'],
                                body: [
                                    [
                                        {
                                            text: "",
                                            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#000000'],
                                            border: [false, false, false, true],
                                        }, '',
                                        {
                                            text: "",
                                            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#000000'],
                                            border: [false, false, false, true],
                                        }, '',
                                        {
                                            text: "",
                                            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#000000'],
                                            border: [false, false, false, true],
                                        }
                                    ],
                                    [{ text: 'Produced By', style: 'sign' }, '', { text: 'Received By', style: 'sign' }, '', { text: 'Audited By', style: 'sign' }],
                                    [{ colSpan: 5, image: imgData }]
                                ],
                            },
                            alignment: 'center'
                        },
                        {
                            style: 'tableFooter',
                            layout: {
                                defaultBorder: false,
                                paddingTop: function (i, node) { return -5; },
                                paddingBottom: function (i, node) { return -5; },
                            },
                            table: {
                                widths: [230, '*'],
                                body: [
                                    [{ text: 'Remark: ' + remark, alignment: 'left' }, { text: status_Rev + '\n' + username_Date, alignment: 'right' }],
                                ]
                            }

                        },
                    ],
                    defaultStyle: { font: 'TFPhethai' },
                    styles: {
                        col1: {
                            fontSize: 28, margin: [0, 15, 0, 0]
                        },
                        col2: {
                            fontSize: 46,
                        },
                        skuname: {
                            fontSize: 34,
                            verticalAlign: 'center'
                        },
                        sign: {
                            fontSize: 18,
                            alignment: 'center'
                        },
                        tableExample: {
                            margin: [0, 45, 0, 0]
                        },
                        tableFooter: {
                            // margin: [0, 5, 0, 0],
                            fontSize: 18,
                        }
                    },
                };
                var pdfX = pdfMake.createPdf(docDefinition);
                var win = window.open('', '_blank');
                pdfX.print({}, win);
            });
    }
    const UpdateOptions = async () => {
        let options = datas.Options ? queryString.parse(datas.Options) : null;
        let rev = revNo ? revNo + 1 : options && options.Rev ? parseInt(options.Rev) + 1 : 1;
        setRevNo(rev);

        var dataObj = []

        const StoQuery = {
            queryString: window.apipath + "/v2/SelectDataTrxAPI/",
            t: "StorageObject",
            q: "[{ 'f': 'ParentStorageObject_ID', c:'=', 'v': " + datas.ID + "}]",
            f: "*",
            g: "",
            s: "[{'f':'Code','od':'asc'}]",
            sk: 0,
            l: 1,
            all: "",
        };

        await Axios.get(createQueryString(StoQuery)).then((res) => {
            var row = res.data.datas

            row.forEach(row1 => {
                delete row1["ModifyBy"]
                delete row1["ModifyTime"]

                var qryStr = queryString.parse(row1.Options)
                qryStr.Rev = rev
                var qryStr1 = queryString.stringify(qryStr)
                row1.Options = decodeURIComponent(qryStr1)
            })
            dataObj.push(row[0])
        })
        let updjson = {
            "t": "amt_StorageObject",
            "pk": "ID",
            "datas": dataObj,
            "nr": false,
            "_token": localStorage.getItem("Token")
        }
        Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then((res) => {

            if (res.data._result !== undefined) {
                if (res.data._result.status === 1) {
                    console.log("Update revision of pallet success");
                    // alertDialogRenderer("Update revision of pallet success", "success", true);
                    printPDF(datas, rev)
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            }
        })
    }

    return (
        <div className={classes.root}>
            {stateDialog ? showDialog ? showDialog : null : null}
            <Paper className={classes.paperContainer}>
                <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepperContainer}>
                    {steps.map((row, index) => (
                        <Step key={row.label}>
                            <StepLabel>
                                <Typography variant="h6">{t(row.label)}{row.value ? " : " : ""}
                                    <label style={{ fontWeight: 'bolder', textDecorationLine: 'underline', textDecorationColor: indigo[700] }}>{row.value}</label>
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {getStepContent(index)}
                                <div className={classes.actionsContainer}>
                                    <div>
                                        {activeStep !== 1 ? null :
                                            <AmButton styleType="delete_clear"
                                                onClick={handleReset}
                                                className={classes.button}
                                            >
                                                {t("Clear")}
                                    </AmButton>}
                                        {/* <AmButton styleType="dark_clear"
                                            disabled={activeStep === 0}
                                            onClick={() => handleBack(index)}
                                            className={classes.button}
                                        >
                                            Back
                                    </AmButton> */}

                                        {activeStep === steps.length - 1 ?
                                            <AmButton
                                                styleType="confirm"
                                                onClick={() => handleNext(index)}
                                                className={classes.button}
                                            >{t("Download PDF")}</AmButton>
                                            :
                                            <AmButton
                                                styleType="confirm"
                                                onClick={() => handleNext(index)}
                                                className={classes.button}
                                            >{t("Next")}
                                        </AmButton>}
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>
            <br />
            <DivHidden>
                <img id="barcode" />
            </DivHidden>

        </div>
    );
}
PrintLabelProduct.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PrintLabelProduct);

