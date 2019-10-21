import React, { useState, useEffect, useContext, useReducer } from "react";
import { apicall, createQueryString } from '../../components/function/CoreFunction2';
import { ExplodeRangeNum, MergeRangeNum,ExplodeRangeNumToIntArray,ConvertToRangeNum } from '../../components/function/RangeNumUtill';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import AmFindPopup from '../../components/AmFindPopup';
import AmDropdown from '../../components/AmDropdown';
import AmMultiDropdown from '../../components/AmMultiDropdown';
import AmButton from "../../components/AmButton";
import styled from 'styled-components'
import { indigo, grey, red } from '@material-ui/core/colors';
import AmInput from '../../components/AmInput';
import AmValidate from '../../components/AmValidate';
const Axios = new apicall()
const styles = theme => ({
    root: {
        borderBottom: '2px solid red[400] !important',
        '&:after': {
            borderBottom: '2px solid red[800] !important',
        },
    },
    button: {
        margin: theme.spacing(),
        width: '130px',
    },
    div: {
        width: '300px',
    },
})
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
  width: 80px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;
const optiontest = [
    { label: 'Yes', value: 'y' },
    { label: 'No', value: 'n' },
];
const suggestions = [
    { label: 'Afghanistan',},
    { label: 'Aland Islands' },
    { label: 'Albania' },
    { label: 'Algeria' },
    { label: 'American Samoa' },
    { label: 'Andorra' },
    { label: 'Angola' },
    { label: 'Anguilla' },
    { label: 'Antarctica' },
    { label: 'Antigua and Barbuda' },
    { label: 'Argentina' },
    { label: 'Armenia' },
    { label: 'Aruba' },
    { label: 'Australia' },
    { label: 'Austria' },
    { label: 'Azerbaijan' },
    { label: 'Bahamas' },
    { label: 'Bahrain' },
    { label: 'Bangladesh' },
    { label: 'Barbados' },
    { label: 'Belarus' },
    { label: 'Belgium' },
    { label: 'Belize' },
    { label: 'Benin' },
    { label: 'Bermuda' },
    { label: 'Bhutan' },
    { label: 'Bolivia, Plurinational State of' },
    { label: 'Bonaire, Sint Eustatius and Saba' },
    { label: 'Bosnia and Herzegovina' },
    { label: 'Botswana' },
    { label: 'Bouvet Island' },
    { label: 'Brazil' },
    { label: 'British Indian Ocean Territory' },
    { label: 'Brunei Darussalam' },
].map(suggestion => ({
    ...suggestion,
    value: suggestion.label,
    label: suggestion.label,
}));

const txtQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,SKUMasterType_ID,SKUTypeCode,SKUTypeName,UnitType_ID,UnitTypeCode,UnitTypeName,Code," +
        "Name,Description,WeightKG,WidthM,LengthM,HeightM,Cost,Price,Revision,Status,Created,Modified,ObjectSize_ID,ObjectSize_Code,LastUpdate",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 0,
    all: "",
};
const UnitTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI",
    t: "UnitType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const SKUMasterTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "SKUMasterType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
function Test6(props) {
    const { classes } = props;

    // รูปแบบการประกาศ state เก็บข้อมูลของพวกdropdown
    const [valueText, setValueText] = useState({
        txtCode: {
            value: 13802
        },
        txtUnitType: {
            value: 92
        },
        ddlUnitType: {
            value: 93
        },
        ddlUnitType2: {},
        ddlSKUType: {},
        ddlTest: {},
        ddlSKUType2: {
            // value: [34, 35]
        },
        ddlTest2: {
            // value: ['Austria', 'Azerbaijan']
        },
        ddlTest3: {},
        txtEmail: {},//value: 13802
        txtEmail2: {},
    });

    const [defaultValue, setDefaultValue] = useState(2);
    const [dataSrc, setDataSrc] = useState([]);

    const cols = [
        {
            Header: 'Code',
            accessor: 'Code',
            fixed: 'left',
            width: 130,
            sortable: true,
        },
        {
            Header: 'Name',
            accessor: 'Name',
            width: 200,
            sortable: true,
        },
        {
            Header: 'Category',
            accessor: 'SKUTypeCode',
            width: 100,
            sortable: true
        },
        {
            Header: 'Gross Weight (Kg.)',
            accessor: 'WeightKG',
            width: 150,
            sortable: true
        },
        {
            Header: 'Last Update',
            accessor: 'LastUpdate',
            width: 200,
            sortable: true
        }
    ];

    const colsUnitType = [
        {
            Header: 'ID',
            accessor: 'ID',
            fixed: 'left',
            width: 100,
            sortable: true,
        },
        {
            Header: 'Code',
            accessor: 'Code',
            sortable: true,
        },
    ];

    useEffect(() => {
        getData(createQueryString(SKUMasterTypeQuery))
    }, [SKUMasterTypeQuery]);
    async function getData(qryString) {
        const res = await Axios.get(qryString).then(res => res)
        setDataSrc(res.data.datas)
    }
    useEffect(() => { console.log(valueText) }, [valueText])

    //ค่าที่ส่งกลับมา ของcomponent AmDropdown, AmMultiDropdown, AmFindPopup,
    //value, dataObject, inputID=ไอดีของinput, fieldDataKey=ชื่อฟิล์ดที่ลิงค์กับtableในdb
    const onHandleChange = (value, dataObject, inputID, fieldDataKey) => {
        // console.log(event)
        // if (inputID === "txtCode") {
        //     setValueText({
        //         ...valueText, [inputID]: {
        //             value: value,
        //             dataObject: dataObject,
        //             fieldDataKey: fieldDataKey,
        //         }
        //     });
        // } else {
        setValueText({
            ...valueText, [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
            }
        });
        // }
    };
    //ค่าที่ส่งกลับมา ของcomponent AmDropdown, AmMultiDropdown, AmFindPopup,
    const onHandleDDLChange = (value, dataObject, inputID, fieldDataKey) => {
        setValueText({
            ...valueText, [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
            }
        });
    };

    //ค่าที่ส่งกลับมา ของ AmInput
    const onHandleInputChange = (value, obj, element, event) => {
        // console.log(obj)
        // console.log(event)
        setValueText({
            ...valueText, [element.id]: {
                value: value
            }
        });
    };
    const onHandleInputPress = (value, obj, element, event) => {
        if (event.key == "Enter") {
            event.preventDefault();
            setValueText({
                ...valueText, [element.id]: {
                    value: value
                }
            });
        }else{
            alert(value)
        }
    };
    //ค่าที่ส่งกลับมา ของ AmButton
    const onHandleSearch = (value, obj, event) => {
        console.log(value)
        console.log(obj)
        console.log(event)
        // alert("ID: " + valueText.txtCode.value +
        //     " :: " + valueText.txtCode.label +
        //     "<br >ID: " + valueText.txtUnitType.value +
        //     " :: " + valueText.txtUnitType.label)
        // Axios.get(createQueryString(txtQuery)).then(res =>
        //     console.log(res.data.datas)
        // );
    }

    const onHandlePress =  (value, obj, element, event) => {
        alert(value);
    };
    //Ex. function ที่ส่งเป็น props ไปยัง AmValidate
    const onCustomValidate = (value) => {
        // console.log(value)
        var regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (value.match(regExp)) {
            return true;
        } else {
            return false;
        }
    }
    const customDropdown = () => {
        return <AmDropdown
            id="ddlUnitType"
            // disabled
            placeholder="Select Unit Type"
            fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
            fieldLabel={["ID", "Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
            width={200} //กำหนดความกว้างของช่อง input
            ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
            // value={valueText.ddlUnitType.value} //ค่า value ที่เลือก
            defaultValue={valueText.ddlUnitType.value}
            queryApi={UnitTypeQuery}
            onChange={onHandleDDLChange}
            ddlType={"search"} //รูปแบบ Dropdown 
                zIndex={1000}
                required
        />;
    }
    const customMultiDropdown = () => {
        return <AmMultiDropdown
            id="ddlTest2"
            placeholder="Select Test2"
            fieldDataKey="value"
            fieldLabel={["label"]}
            width={400}
            // ddlMinWidth={200}
            ddlMaxWidth={250}
            data={suggestions} //ส่ง option แบบarray
            value={valueText.ddlTest2.value}
            // defaultValue={['Austria','Azerbaijan']}
            onChange={onHandleDDLChange} />;
    }
    const convertData = () => {
        let val1 = ["1-6","9","12-14"];
         let val2 = "1-6";
          let val3 = "1-6,25,9,12-14,23";
          let val4 = "1,2,3,4,5,6,9,12,13,14,23";
          let val5 = "5,4,3,2,1,6,10,12,13,14,23";
          let val6 = [5,4,3,2,1,6,10,12,13,14,23];
        //   console.log(ExplodeRangeNum(val1));
        //   console.log(ExplodeRangeNum(val2));
        //   console.log(ExplodeRangeNum(val3));
        //   console.log(MergeRangeNum(val4));
        //   console.log(MergeRangeNum(val5));
        
        // console.log(ExplodeRangeNumToIntArray(val1));
        // console.log(ExplodeRangeNumToIntArray(val2));
        // console.log(ExplodeRangeNumToIntArray(val3));
        // console.log(ExplodeRangeNumToIntArray(val4));
        // console.log(ExplodeRangeNumToIntArray(val5));
        // console.log(ConvertToRangeNum(val6));
    }
    return (
        <>
            <AmButton id="btnSearch" styleType="add" className={classNames(classes.button)} onClick={onHandleSearch}>
                {'Test Search'}
            </AmButton>
            <label>== Find Popup ==</label>
            {/* width ถ้าไม่ส่งไปจะเป็น auto */}
            <FormInline>
                <label>Code: </label>
                {/* ใช้กับตัวเลือกที่มีข้อมูลเยอะมากๆ เช่น sku */}
                <AmFindPopup
                    id="txtCode"
                    placeholder="Select SKU"
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                    // value={valueText.txtCode.value} // ใช้เมื่อต้องการเปลี่ยน value จากหน้า frontโดยตรง
                    defaultValue={13802}
                    labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                    queryApi={txtQuery} //object query string
                    columns={cols} //array column สำหรับแสดง table
                    width={400} //กำหนดความกว้างของช่อง input
                    onChange={onHandleChange} />
            </FormInline>
            <FormInline>
                <label>Unit Type</label>
                <AmFindPopup
                    id="txtUnitType"
                    // disabled
                    required={true}
                    placeholder="Select Unit Type"
                    fieldDataKey="ID"
                    fieldLabel={["Code"]}
                    // value={valueText.txtUnitType.value} //ใช้เมื่อต้องการเปลี่ยน value จากหน้า frontโดยตรง
                    defaultValue={2}
                    labelTitle="Search of Unit Type"
                    queryApi={UnitTypeQuery}
                    columns={colsUnitType}
                    width={200}
                    onChange={onHandleChange} />
            </FormInline>

            <br />
            <label>== Dropdown ==</label>
            {/* Dropdown ส่งค่าoptionlist ได้ 3 แบบ ผ่าน props
             [1] queryApi={UnitTypeQuery}  ส่งobject  query string =>component จะแปลงข้อมูลเป็น optionlist ให้
             [2] data={dataSrc} ส่่ง array ข้อมูลที่ดึงมาจากdb  โดยส่งข้อมูลจาก res.data.datas =>component จะแปลงข้อมูลเป็น optionlist ให้
            
             func: onChange={onHandleDDLChange} 
             เมื่อมีการเลือกค่าใหม่หรือลบค่าที่เลือก จะส่งข้อมูลกลับมาผ่านfunc นี้ 
             (value, dataObject, inputID, fieldDataKey)
            
                กำหนดความกว้าง ถ้าไม่กำหนดเอง ค่า default = auto
            width={400}
            ddlMinWidth={200}
            ddlMaxWidth={250}
                ค่า default 
             fieldDataKey="value"
             fieldLabel={["label"]}
            */}

            {/* Dropdown แบบมีช่อง Search 
            ต้องส่ง props ddlType={"search"} 
            Ex.ส่ง queryApi สำหรับแปลงเป็น optionlist 
            */}
            {customDropdown()}
            {/* <AmDropdown
                id="ddlUnitType"
                // disabled
                placeholder="Select Unit Type"
                fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                fieldLabel={["ID", "Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                width={200} //กำหนดความกว้างของช่อง input
                ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
                value={valueText.ddlUnitType.value} // ใช้เมื่อต้องการเปลี่ยน value จากหน้า frontโดยตรง
                defaultValue={2}
                queryApi={UnitTypeQuery}
                onChange={onHandleDDLChange}
                ddlType={"search"} //รูปแบบ Dropdown 
            /> */}
             <FormInline>
                <label>Unit Type</label>
            <AmDropdown
                id="ddlUnitType2"
                // disabled
                placeholder="Select Unit Type"
                fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                fieldLabel={["ID", "Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                width={200} //กำหนดความกว้างของช่อง input
                ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
                // value={valueText.ddlUnitType2.value} // ใช้เมื่อต้องการเปลี่ยน value จากหน้า frontโดยตรง
                defaultValue={2}
                queryApi={UnitTypeQuery}
                onChange={onHandleDDLChange}
                ddlType={"search"} //รูปแบบ Dropdown 
                zIndex={1000}
                disabled
                // required={true}
            />
             </FormInline>

            {/* Dropdown แบบไม่มีช่อง Search 
            ต้องส่ง props ddlType={"normal"} 
            */}
            <AmDropdown id="ddlTest"
                // disabled={true} 
                styleType="default"
                placeholder="Select Test"
                // fieldDataKey="value"
                // fieldLabel={["label"]}
                zIndex={1000}
                // width={200}
                // ddlMinWidth={200}  ถ้าใช้ เเบบ normal ไม่ได้ต้องส่งค่า ddlMinWidth,ddlMaxWidth
                data={optiontest}
                // value={valueText.ddlTest.value}
                onChange={onHandleDDLChange}
                ddlType={"normal"}
            />

            {/* Ex.ส่ง queryDatas สำหรับแปลงเป็น optionlist */}
            <FormInline>
                <label>Unit Type</label>
            <AmDropdown id="ddlSKUType"
                // disabled
                placeholder="Select SKU Type"
                fieldDataKey="ID"
                fieldLabel={["Code"]}
                labelPattern=" : "
                width={300}
                zIndex={1000}
                // value={valueText.ddlSKUType.value}
                data={dataSrc}
                onChange={onHandleDDLChange}
                ddlType={"normal"} />
             </FormInline>

            {/* Ex.ส่ง ค่า option แบบเป็นarray  */}
            <AmDropdown
                id="ddlTest3"
                // disabled
                placeholder="Select Test"
                // fieldDataKey="value"
                // fieldLabel={["label"]}
                width={300}
                zIndex={1000}
                data={suggestions}
                // value={valueText.ddlTest3.value}
                onChange={onHandleDDLChange}
                ddlType={"search"} />

            <br />
            <label>== MultiDropdown ==</label>
            {/* ใช้เหมือนกับdropdown */}
            {/* MultiDropdown ส่งค่าoptionlist ได้ 3 แบบ ผ่าน props
             [1] queryApi={UnitTypeQuery}  ส่งobject  query string =>component จะแปลงข้อมูลเป็น optionlist ให้
             [2] data={dataSrc} ส่่ง array ข้อมูลที่ดึงมาจากdb  โดยส่งข้อมูลจาก res.data.datas =>component จะแปลงข้อมูลเป็น optionlist ให้
            
             func: onChange={onHandleDDLChange} 
             เมื่อมีการเลือกค่าใหม่หรือลบค่าที่เลือก จะส่งข้อมูลกลับมาผ่านfunc นี้ 
             (value, dataObject, inputID, fieldDataKey)
            
             กำหนดความกว้าง ถ้าไม่กำหนดเอง ค่า default = auto
            width={400} //ความกว้าง ของช่อง input
            ddlMinWidth={200} //Min ความกว้าง ของ กล่อง dropdown
            ddlMaxWidth={250} //Max ความกว้าง ของ กล่อง dropdown

             ค่า default 
             fieldDataKey="value"
             fieldLabel={["label"]}
            */}
            {/* {customMultiDropdown()} */}

            <AmMultiDropdown
                id="ddlTest2"
                // disabled
                // required={true}
                placeholder="Select Test2"
                // fieldDataKey="value"
                // fieldLabel={["label"]}
                width={300}
                zIndex={1000}
                ddlMinWidth={300}
                // ddlMaxWidth={300}
                data={suggestions} //ส่ง option แบบarray
                // value={valueText.ddlTest2.value} //ใช้เมื่อต้องการเปลี่ยน value จากหน้า frontโดยตรง
                defaultValue={['Austria', 'Azerbaijan']}
                returnDefaultValue={true}
                onChange={onHandleDDLChange} />
            {/* ส่ง query ที่ต้องการดึงจาก db มาสร้างเป็น option */}
            <AmMultiDropdown
                id="ddlSKUType2"
                placeholder="Select SKU Type"
                fieldDataKey="ID" //ชื่อฟิิล์ดข้อมูล ที่ใช้อ้างอิงกับค่าใน table
                fieldLabel={["Code", "Name"]}
                labelPattern=" : " // 
                width={300} 
                zIndex={1000}
                ddlMinWidth={300}
                // ddlMaxWidth={350}
                // value={valueText.ddlSKUType2.value}
                defaultValue={[34, 35]}
                returnDefaultValue={true}
                queryApi={SKUMasterTypeQuery}  //ส่ง querystring ไป
                // data={dataSrc}  //ส่ง data ที่ดังมากจาก db แล้ว
                onChange={onHandleDDLChange}
            />
            <br />
            <FormInline>
                <LabelH>Email:</LabelH>
                <InputDiv>
                    <AmInput
                        id="txtEmail"
                        name="email"
                        required={true}
                        // defaultValue={111}
                        //value={valueText.txtEmail.value}
                        placeholder="Email"
                        onChange={onHandleInputChange}
                        validate={true} //ประกาศใช้ตรวจสอบค่าinput
                        // styleValidate={{display: 'block'}} <=แสดงใต้input เปลี่ยนสไตล์ส่วนเเสดงผลข้อความเตือน default จะเเสดงแถวเดียวกับinput
                        // msgSuccess="Success" //ข้อความสำเร็จ
                        msgError="Error" //ข้อความผิดพลาด
                        regExp={/^[0-9\.]+$/} 
                    //    regExp={/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/}  
                />
                </InputDiv>
                {/* <AmValidate
                    value={valueText.txtEmail.value}
                    // msgSuccess="Success" 
                    msgError="Error"
                    regExp={/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/} /> */}
            </FormInline>
            <br />
            <FormInline>
                <LabelH>Email:</LabelH>
                <InputDiv>
                    <AmInput
                        id="txtEmail2"
                        name="email"
                        placeholder="Email"
                        required={true}
                        defaultValue="pop@ggg"
                        onChange={onHandleInputChange}
                        onKeyPress={onHandleInputPress}//onHandlePress
                        // onKeyDown={(value, obj, element, event)=>alert(value)}//onHandlePress
                        // onMouseOver={()=>alert("xxx2")}
                        // onMouseOut={()=>alert("xxx3")}
                        // onFocus={()=>alert("xxx")}
                        validate  //ประกาศใช้ตรวจสอบค่าinput
                        msgSuccess="Success"
                        msgError="Error"
                        customValidate={onCustomValidate} //ฟังก์ชั่นจากหน้าหลัก จัดการเอง
                    // onMouseOver={(a,b,c) => console.log(c)} 
                    />
                </InputDiv>
                {/* <AmValidate
                        value={valueText.txtEmail2.value}
                        msgSuccess="Success"
                        msgError="Error"
                        customValidate={onCustomValidate}
                    // regExp={/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/} 
                    /> */}
            </FormInline>

            {convertData()}
        </>
    );
}

Test6.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Test6);