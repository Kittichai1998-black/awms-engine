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
                q: "[{ 'f': 'Des_Customer_ID', c: '=', 'v': " + customerIds + " }]",
                f: "ID,Code,Name,Remark",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",

            })
        }
    }, [customerIds])


    const onHandleDDLChangeCus = (value, dataObject, inputID, fieldDataKey) => {
        if (value !== null || value !== undefined) {
            setcustomerIds(value)
        }

    }

    const onHandleDDLChangeDoc = (value, dataObject, inputID, fieldDataKey) => {
        if (value !== null || value != undefined) {
            setremark(dataObject.Remark)
        }

    };

    const onChangeEditorBarcodepick = (e) => {

    };

    const onChangeEditorQtypick = (e) => {

    };

    const onChangeEditorBarcodeConsole = (e) => {

    }

    const Column = [
        { Header: "Pack Item", accessor: 'pacItem' },
        { Header: "Quantity", accessor: "quantity" },
        { Header: 'UnitType', accessor: 'unittype' },
    ];

    const datasSourse = [{
        'pacItem': "Test",
        "quantity": "1/12",
        'unittype': "PC"
    }];

    const handleChange = (event, newValue) => {
        setvalue(newValue);
    };

    const onclickPick = () => {

    };

    const onclickPickClear = () => {

    };

    const onChangeEditorpickingConsole = () => {


    };

    const onChangeEditorQtyConsole = () => {


    };

 return (
        <div>
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
                      <div style={{ marginLeft:"10px" }}><LabelH>Picking : </LabelH></div>
                      <InputDiv>
                          <AmInput
                              id={"picking"}
                              style={{ width: "200px" }}
                              placeholder={"Scan Barcode"}
                              //validate={true}
                              //msgError="Error"
                              //regExp={validate ? validate : ""}
                              //defaultValue={data ? data[cols.field] : ""}
                              onChange={(e )=> onChangeEditorBarcodepick(e) }>
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
                 </Card>:null }</div>
            <div>
            </div>
        </div>

    )
};
ConsolePankan.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ConsolePankan);
