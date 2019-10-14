import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from '../../../../components/AmCreateDocument'
import AmButton from '../../../../components/AmButton'
import AmEditorTable from '../../../../components/table/AmEditorTable'
import AmInput from '../../../../components/AmInput'
import AmDropdown from '../../../../components/AmDropdown'
import AmFindPopup from '../../../../components/AmFindPopup'
import styled from 'styled-components'
import AmDialogs from '../../../../components/AmDialogs'
import AmTable from '../../../../components/table/AmTable'
import AppBar from "@material-ui/core/AppBar";
import LibraryAdd from "@material-ui/icons/LibraryAdd";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import AmListSTORenderer from '../../../pageComponent/AmListSTORenderer'
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import Collapse from '@material-ui/core/Collapse';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Axios from 'axios';
const styles = theme => ({
    root: {
        width: "100%"
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular
    },
    expand: {
        transform: "rotate(0deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    collapse: {
        transform: "rotate(180deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    container: {
        width: "100%",
        overflow: "hidden",
        height: "auto",
        background: "red"
    },
    paper: {
        padding: "3px"
    },

    fontIndi_0: {
        color: "#1b5e20",
        minHeight: "50px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    fontIndi_1: {
        color: "#01579b",
        minHeight: "50px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    fontIndi_2: {
        color: "#c51162",
        minHeight: "50px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    indicator_0: { backgroundColor: "#1b5e20" },
    indicator_1: { backgroundColor: "#01579b" },
    indicator_2: { backgroundColor: "#c51162" }
});

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

const LabelH = styled.label`
font-weight: bold;
  width: 200px;
`;




const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;



const ConsolePankan = (props) => {
    const { classes } = props;
    const [customerIds, setcustomerIds] = useState();
    const [docIds, setdocIds] = useState();
    const [issueDoc, setissueDoc] = useState();
    const [remark, setremark] = useState();
    const [reload, setreload] = useState({});
    const [value, setvalue] = useState(0);
    const [newStorageObjPick, setNewStorageObjPick] = useState(null);
    const [newStorageObjConsole, setNewStorageObjConsole] = useState(null);
    const [barcodePick, setbarcodePick] = useState();
    const [barcodePicks, setbarcodePicks] = useState();
    const [barcodeConsole, setbarcodeConsole] = useState();
    const [barcodeConsoles, setbarcodeConsoles] = useState();
    const [expanded, setExpanded] = useState(true);
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");
    const [valuesGuide, setvaluesGuide] = useState(false);
    const [dataGiude, setdataGiude] = useState();
    const [qtypick, setqtypick] = useState();
    const [qtyconsole, setqtyconsole] = useState();
    const [datasSourse, setdatasSourse] = useState([]);


    const Customer = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: "[{ 'f': 'Status', c: '<', 'v': '2' }]",
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }


    useEffect(() => {
        if (customerIds !== null || customerIds !== undefined) {
            setissueDoc({
                queryString: window.apipath + "/v2/SelectDataViwAPI/",
                t: "Document",
                q: "[{ 'f': 'Des_Customer_ID', c: '=', 'v': " + customerIds + " },{ 'f': 'DocumentType_ID', c: '=', 'v': '1002' }]",
                f: "ID,Code,Name,Remark",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",

            })
        }
    }, [customerIds])

    useEffect(() => {
        setdatasSourse([]);
    }, [valuesGuide])


    const onHandleDDLChangeCus = (value, dataObject, inputID, fieldDataKey) => {
        if (value === null) {
            setMsgDialogErr("Customer invalid")
            setStateDialogErr(true)

        } else {

            if (value !== null || value !== undefined) {
                setcustomerIds(value)
            } else if (value === null) {
                setMsgDialogErr("Customer invalid")
                setStateDialogErr(true)
            }
        }

    }

    const onHandleDDLChangeDoc = (value, dataObject, inputID, fieldDataKey) => {
        if (value === null) {
            setMsgDialogErr("Document invalid")
            setStateDialogErr(true)
        } else {

            if (value !== null || value != undefined) {
                setdocIds(value)
                setremark(dataObject.Remark)
                setvaluesGuide(true)
                GetDocument(value)
            } else if (value === null) {
                setMsgDialogErr("Document invalid")
                setStateDialogErr(true)
            }
        }

    };


    const GetDocument = (docID) => {
        Axios.get(
            window.apipath + "/v2/DocumentItemListAndLocationListAPI?docID=" + docID +  "&getMapSto=true&_token=" +
            localStorage.getItem("Token")
        ).then(res => {
            let resDatas = res.data.docItemLists
            let datas = null
            let pacItem = null
            let quantity = null
            let unittype = null
            console.log(resDatas)
            resDatas.map((x) => {
                datas = {
                'pacItem': x.code + ":" + x.name,
                    "quantity": x.pickQty + "/" + x.allQty,
                    'unittype': x.unit

                }
                datasSourse.push(datas)
                setreload({})
            })

        //    let pacItem = x.code  x.name
        //    data = {
        //        'pacItem': x.code : x.name,
        //        "quantity": "1/12",
        //        'unittype': "PC"

        //    }
        //    setdatasSourse.push(datas)
        })
    }

    const onChangeEditorBarcodepick = (e) => {
        setbarcodePicks(e)
    };

    const onChangeEditorQtypick = (e) => {
        setqtypick(e)
    };

    const onChangeEditorBarcodeConsole = (e) => {
        if (e !== null || e !== undefined) {
            setbarcodePick(e)
        }
    }

    const Column = [
        { Header: "Pack Item", accessor: 'pacItem' },
        { Header: "Quantity", accessor: "quantity" },
        { Header: 'UnitType', accessor: 'unittype' },
    ];

  

    const handleChange = (event, newValue) => {
        setvalue(newValue);
    };

    const onclickPick = () => {
        if (barcodePicks === undefined) {
            setMsgDialogErr("Barcode invalid")
            setStateDialogErr(true)

        } else if (qtypick === undefined ) {
            setMsgDialogErr("Qty invalid")
            setStateDialogErr(true)

        } else {

            Axios.post(window.apipath + '/v2/TransferPanKanAPI').then((res) => {
                if (res.data._result.status === 1) {
                    let datas = res.data
                    setNewStorageObjPick(<AmListSTORenderer
                        dataSrc={datas}

                    />);

                } else {


                }
            })


        }


      
    };

    const onclickPickClear = () => {

    };

    const onChangeEditorpickingConsole = (e) => {
        setbarcodeConsole(e)

    };

    const onChangeEditorQtyConsole = (e) => {
        setqtyconsole(e)

    };

    const onclickConsole = () => {
        if (barcodeConsole === undefined) {
            setMsgDialogErr("Barcode invalid")
            setStateDialogErr(true)

        } else if (qtyconsole === undefined) {
            setMsgDialogErr("Qty invalid")
            setStateDialogErr(true)

        } else {

            Axios.post(window.apipath + '/v2/TransferPanKanAPI').then((res) => {
                if (res.data._result.status === 1) {
                    let datas = res.data
                    setNewStorageObjConsole(<AmListSTORenderer
                        dataSrc={datas}

                    />)
                } else {


                }
            })


        }


    };

    const onclickConsoleClear = () => {

    }

 return (
     <div>
         <AmDialogs
             typePopup={"success"}
             content={msgDialogSuc}
             onAccept={e => {
                 setStateDialogSuc(e);
             }}
             open={stateDialogSuc}
         ></AmDialogs>
         <AmDialogs
             typePopup={"error"}
             content={msgDialogErr}
             onAccept={e => {
                 setStateDialogErr(e);
             }}
             open={stateDialogErr}
         ></AmDialogs>


            <FormInline>
                <LabelH>Customer : </LabelH>
                <InputDiv>
                    <AmDropdown
                        id={"CustomerId"}
                        placeholder={"Select Customer"}
                        fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        width={600} //กำหนดความกว้างของช่อง input
                        ddlMinWidth={600} //กำหนดความกว้างของกล่อง dropdown
                        //valueData={valueText[idddl]} //ค่า value ที่เลือก
                        queryApi={Customer}
                        returnDefaultValue={true}
                        //defaultValue={data !== {} && data !== null ? data[row.pair] : ""}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeCus(value, dataObject, inputID, fieldDataKey)}
                        ddlType={"search"} //รูปแบบ Dropdown 
                    />
                </InputDiv>
            </FormInline>
            <div style={{ paddingTop: "10px" }}>
                <FormInline>
                    <LabelH>Docment : </LabelH>
                    <InputDiv>
                        <AmDropdown
                            id={"IssueId"}
                            placeholder={"Select Document"}
                            fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            fieldLabel={["Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            width={600} //กำหนดความกว้างของช่อง input
                            ddlMinWidth={600} //กำหนดความกว้างของกล่อง dropdown
                            //valueData={valueText[idddl]} //ค่า value ที่เลือก
                            queryApi={issueDoc}
                            returnDefaultValue={true}
                            //defaultValue={data !== {} && data !== null ? data[row.pair] : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeDoc(value, dataObject, inputID, fieldDataKey)}
                            ddlType={"search"} //รูปแบบ Dropdown 
                        />
                    </InputDiv>
                </FormInline>
            </div>
            <div style={{ paddingTop: "10px" }}>
                <FormInline>
                    <LabelH>Remark : </LabelH>
                    <InputDiv>
                        <label>{remark}</label>
                    </InputDiv>
                </FormInline>
            </div>
            <div style={{ paddingTop: "10px" }}>
                <AmTable
                    data={datasSourse}
                    reload={reload}
                    columns={Column}
                    sortable={false}
                ></AmTable>
         </div>
         <div style={{ paddingTop: "10px" }}>
             <labelH style={{ color: "red"}}>Guide for Picking</labelH>
         </div>
         <div style={{ paddingTop:"10px" }}>
             <AppBar position="static" color="default">
                 <Tabs
                     classes={{
                         indicator: classnames(
                             classes.bigIndicator,
                             classes["indicator_" + value]
                         )
                     }}
                     value={value}
                     onChange={handleChange}
                     scrollButtons="on"
                 >
                     <Tab
                         label={"Pick"}
                         className={classes.fontIndi_0}

                     />
                     <Tab
                         label={"Console"}
                         className={classes.fontIndi_1}

                     />
                     <Tab
                         label={"View"}
                         className={classes.fontIndi_2}

                     />
                 </Tabs>
             </AppBar>
             <div>
                 {value == 0 ? <Card>
                     <FormInline>
                         <div style={{ marginLeft: "10px" }}><LabelH>Picking : </LabelH></div>
                         <InputDiv>
                             <AmInput
                                 id={"picking"}
                                 style={{ width: "200px" }}
                                 placeholder={"Scan Barcode"}
                                 //validate={true}
                                 //msgError="Error"
                                 //regExp={validate ? validate : ""}
                                 //defaultValue={data ? data[cols.field] : ""}
                                 onChange={(e) => onChangeEditorBarcodepick(e)}>
                             </AmInput>
                             <AmInput
                                 id={"quantitypick"}
                                 style={{ width: "100px", marginLeft: "10px" }}
                                 //validate={true}
                                 //msgError="Error"
                                 //regExp={validate ? validate : ""}
                                 defaultValue={1}
                                 type="number"
                                 onChange={(e) => onChangeEditorQtypick(e)}>
                             </AmInput>
                         </InputDiv>
                         <AmButton
                             style={{ width: 100, marginLeft: "10px" }}
                             styleType="info"
                             //disable={e.original.ID > 0 ? false : true}
                             onClick={onclickPick}
                         >
                             {"Post"}</AmButton>
                         <AmButton
                             style={{ width: 100, marginLeft: "10px" }}
                             styleType="info"
                             //disable={e.original.ID > 0 ? false : true}
                             onClick={onclickPickClear}
                         >
                             {"Clear"}</AmButton>
                     </FormInline>
                     <Collapse in={expanded} timeout="auto" unmountOnExit>
                         <CardContent className={classes.cardContent}>
                             {newStorageObjPick ? newStorageObjPick : null}
                         </CardContent>
                     </Collapse>
                 </Card> :
                     value == 1 ? <Card>
                         <FormInline>
                             <div style={{ marginLeft: "10px" }}><LabelH>Console : </LabelH></div>
                             <InputDiv>
                                 <AmInput
                                     id={"picking"}
                                     style={{ width: "200px" }}
                                     placeholder={"Input Base"}
                                     //validate={true}
                                     //msgError="Error"
                                     //regExp={validate ? validate : ""}
                                     //defaultValue={data ? data[cols.field] : ""}
                                     onChange={(e) => onChangeEditorBarcodeConsole(e)}>
                                 </AmInput>

                             </InputDiv>
                         </FormInline>
                         <FormInline>
                             <div style={{ marginLeft: "10px" }}><LabelH>Picking : </LabelH></div>
                             <InputDiv>
                                 <AmInput
                                     id={"picking"}
                                     style={{ width: "200px" }}
                                     placeholder={"Barcode"}
                                     //validate={true}
                                     //msgError="Error"
                                     //regExp={validate ? validate : ""}
                                     //defaultValue={data ? data[cols.field] : ""}
                                     onChange={(e) => onChangeEditorpickingConsole(e)}>
                                 </AmInput>
                                 <AmInput
                                     id={"quantitypick"}
                                     style={{ width: "100px", marginLeft: "10px" }}
                                     //validate={true}
                                     //msgError="Error"
                                     //regExp={validate ? validate : ""}
                                     defaultValue={1}
                                     type="number"
                                     onChange={(e) => onChangeEditorQtyConsole(e)}>
                                 </AmInput>
                             </InputDiv>
                             <AmButton
                                 style={{ width: 100, marginLeft: "10px" }}
                                 styleType="info"
                                 //disable={e.original.ID > 0 ? false : true}
                                 onClick={onclickConsole}
                             >
                                 {"Post"}</AmButton>
                             <AmButton
                                 style={{ width: 100, marginLeft: "10px" }}
                                 styleType="info"
                                 //disable={e.original.ID > 0 ? false : true}
                                 onClick={onclickConsoleClear}
                             >
                                 {"Clear"}</AmButton>
                         </FormInline>
                     </Card> : null}</div>
             <div>
             </div>




         </div>
            
        </div>

    )
};
ConsolePankan.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ConsolePankan);
