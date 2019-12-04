import React, { useState, useEffect, useContext, useReducer } from "react";
import PropTypes, { func } from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import SaveIcon from '@material-ui/icons/Save';
import AmExportExcel from '../../components/AmExportExcel';
import AmLink from "../../components/AmLink";
import AmCheckBox from "../../components/AmCheckBox";
import styled from 'styled-components'
import AmButton from "../../components/AmButton";
import AmToolTip from "../../components/AmToolTip";
import { Link as RouterLink } from 'react-router-dom'
import AmWorkQueueStatus from "../../components/AmWorkQueueStatus";
import AmDocumentStatus from "../../components/AmDocumentStatus";
import AmIconStatus from "../../components/AmIconStatus";
import AmEntityStatus from "../../components/AmEntityStatus";
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
import { Typography } from "@material-ui/core";
import AmInput from "../../components/AmInput";
import { apicall, createQueryString } from '../../components/function/CoreFunction'
const Axios = new apicall()

const styles = theme => ({
    button: {
        margin: theme.spacing(),
        width: '130px',
        lineHeight: 1.5
    },
    leftIcon: {
        marginRight: theme.spacing(),
    },
    rightIcon: {
        marginLeft: theme.spacing(),
    },
    iconSmall: {
        fontSize: 20,
    },
    link: {
        marginTop: '10px',
        '&:hover': {
            color: '#000000',
            textDecorationLine: 'none'
        },
        color: 'red',
    },
    icon: {
        width: '120px', margin: theme.spacing(),
    },
    input: {
        margin: theme.spacing(),
    },
    AppInline: {
        textAlign: 'left',
        display: 'inline-block',
        justifyContent: 'center',
        verticalAlign: 'bottom',
    }

});
const AppWrapper = styled.div`
text-align: left; 
`
const AppInline = styled.div`
text-align: left; 
display: inline-block;
justify-content: center;
vertical-align: bottom;
`
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
// input {
//     margin: 5px 0 0 0;
//   }
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
const query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "PackMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,SKUMaster_ID,SKU_Code,PackMasterType_ID,PackCode,PackName,UnitType_ID,UnitTypeCode,UnitTypeName,ObjectSize_ID,ObjectSizeCode,ObjectSize_Code,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,Revision,Status,Created,Modified,LastUpdate,BaseQuantity,Quantity,BaseUnitTypeCode",
    g: "",
    s: "[{'f':'Code','od':'asc'}]",
    sk: "",
    l: 100,
    all: "",
};

const query2 = {
    queryString: window.apipath + "/v2/SelectDataViwAPI",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'Code','od':'asc'}]",
    sk: "",
    l: 0,
    all: "",
};
// const createQueryString = (select) => {
//     let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
//         + (select.q === "" ? "" : "&q=" + select.q)
//         + (select.f === "" ? "" : "&f=" + select.f)
//         + (select.g === "" ? "" : "&g=" + select.g)
//         + (select.s === "" ? "" : "&s=" + select.s)
//         + (select.sk === "" ? "" : "&sk=" + select.sk)
//         + (select.l === 0 ? "" : "&l=" + select.l)
//         + (select.all === "" ? "" : "&all=" + select.all)
//         + "&isCounts=true"
//         + "&apikey=free03"
//     return queryS
// }

const cols = [
    { Header: 'No.' },
    { accessor: 'Code', Header: window.project === "TAP" ? "Part NO." : 'SKU Code' },
    { accessor: 'Name', Header: window.project === "TAP" ? "Part Name" : 'SKU Name' },
    { accessor: 'WeightKG', Header: 'Gross Weight (Kg.)' },
    { accessor: 'Quantity', Header: 'Quantity' },
    { accessor: 'UnitTypeCode', Header: 'Unit Type' },
    { accessor: 'BaseQuantity', Header: 'Base Quantity' },
    { accessor: 'BaseUnitTypeCode', Header: 'Base Unit Type' },
    { accessor: 'ObjectSizeCode', Header: '% Weight Verify' },
    { accessor: 'LastUpdate', Header: 'Last Update' }
];

const useExportExcel = (initialData, querySelect) => {
    const [data, setData] = useState(initialData);
    // const [resData, axiosGet] = useGetApi(null)
    // useEffect(() => {
    //     console.log(resData)
    //     if (resData) {
    //         if (resData.data._result !== undefined) {
    //             if (resData.data._result.status === 1) {
    //                 setData(resData.data.datas)
    //             }
    //         }
    //     }
    // }, [resData])
    useEffect(() => {
        getData(createQueryString(querySelect));

    }, [querySelect])
    async function getData(qryString) {

        const res = await Axios.get(qryString).then(res => res)
        setData(res.data.datas)
    }
    const onClickLoad = (querySel) => {
        querySel["l"] = 0
        querySel["sk"] = 0
        getData(createQueryString(querySel));
    };

    return { data, onClickLoad };
};

function Test5(props) {

    const { classes } = props;
    const [querySelect, setQuerySelect] = useState(query);
    const { data, onClickLoad } = useExportExcel([], querySelect);
    const [isLoad, setIsLoad] = useState(false);

    const routerlink = props => <RouterLink {...props} />

    const onHandleLoadFile = (val, obj, element, event) => {
        // console.log(o)
        setIsLoad(true)
    }
    const onHandleChange = (val, obj, element, event) => {
        if (val === "test")
            alert(element.id + " " + val)
        return val
    }

    const wqStatusList = [10, 11, 12, 21, 22, 31, 32, 90];
    const docEventStatusList = [10, 11, 12, 812, 24, 31, 32];
    const stoStatusList = [10, 11, 12, 13, 14, 17, 18, 99, 98, 97, 96];
    const entityStatus = [0, 1, 2, 3];
    const [state, setState] = React.useState({
        checkedA: true,
        checkedB: false,
        checkedF: true,
    });
    // async function getData(qryString) {
    //     return await Axios.get(qryString).then(res => {
    //         if (res.data.datas) {
    //             if (res.data.datas.length > 0) {
    //                 return res.data.datas;
    //             } else {
    //                 return null;
    //             }
    //         } else {
    //             return null;
    //         }
    //     }).catch(error => {
    //         console.log(error);
    //         return null;
    //     });
    // }
    const handleChange = name => event => {
        setState({ ...state, [name]: event.target.checked });
    };
    return (
        <div>
            <span>หน้านี้จะโหลดข้อมูล 100 rows ก่อนทันที </span>

            <AppWrapper >
                <span>ถ้ากดปุ่ม'Load Data' จะโหลดข้อมูลมาทั้งหมด ไม่จำกัด rows</span>
                <AmButton id="loaddata" styleType="delete" className={classNames(classes.button)} onClick={() => onClickLoad(querySelect)}>
                    {'Load Data'}
                </AmButton>
                <br />
                <span>ปุ่ม'Export Excel' โหลดไฟล์excel จะได้ไฟล์หลังจากหน้าโหลดข้อมูลเเล้วหรือกดปุ่ม 'Load Data'</span>
                <AmButton styleType="warning" className={classNames(classes.button)} onClick={onHandleLoadFile}>
                    <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                    Export Excel
                </AmButton>

                <AmExportExcel data={data} fileName={"Pack"} columns={cols} isLoading={isLoad} onToggleLoad={value => setIsLoad(value)} />

                <br />
                {/* <Button styleType="info_outline" className={classNames(classes.button)} onClick={(e) => onLogin()}>
                    {'Login'}
                </Button>
                <Button styleType="confirm_outline" className={classNames(classes.button)}>
                    {'Logout'}
                </Button>*/}

                <h4>Input</h4>
                <FormInline>
                    <LabelH>Name:</LabelH>
                    <InputDiv><AmInput id="name" name="names" placeholder="Name" styleType="primary" onChange={onHandleChange} style={{ width: '230px' }} /></InputDiv>
                    <label>*ทดสอบ หากพิมพ์คำว่า test จะเเสดง alert</label>
                </FormInline>
                <FormInline>
                    <LabelH>Password:</LabelH>
                    <InputDiv><AmInput id="password" name="password" styleType="default" placeholder="password" type="password" /></InputDiv>
                    <label>*ทดสอบ พิมพ์password</label>
                </FormInline>
                <FormInline>
                    <LabelH>Number:</LabelH>
                    <InputDiv><AmInput id="number" name="number" placeholder="number" type="number" styleType="error" /></InputDiv>
                    <label>*ทดสอบ  พิมพ์ตัวเลข</label>
                </FormInline>
                <FormInline>
                    <LabelH>multiline:</LabelH>
                    <InputDiv><AmInput id="txtmultiline" name="txtmultiline" placeholder="TXTmultiline" multiline styleType="primary" /></InputDiv>
                    <label>*หลายบรรทัด</label>
                </FormInline>

                <FormInline>
                    <LabelH>search:</LabelH>
                    <InputDiv><AmInput id="search" name="search" placeholder="search" type="search" styleType="primary" /></InputDiv>
                </FormInline>
                <br />
                <h4>Link</h4>

                <span>ลิงค์แบบแสดงในหน้าเดิม {' - '}</span><AmLink href={"/doc/gi/list"} >Test1</AmLink>

                <br />
                <span>ลิงค์แบบปุ่ม (เเสดงalert) {' - '}</span><AmLink component="button"
                    onClick={() => {
                        alert("I'm a button.");
                    }}>Test button</AmLink>
                <br />
                <span>ลิงค์แบบแสดงหน้าใหม่ {' - '}</span><AmLink component={routerlink}
                    target="_blank" to={"/doc/gi/create"}
                    onClick={(val, obj, ele, event) => console.log(val)}>Test3</AmLink>
                <br />
                <span>ลิงค์ เปลี่ยนสีปุ่ม {' - '}</span><AmLink href={"/doc/gi/create"} target="_blank" className={classNames(classes.link)}>Test2</AmLink>
                <br />
                <h4>Button</h4>
                <AmToolTip texttitle={"Add"} placement="top"><AmButton styleType="add" className={classNames(classes.button)}>
                    {'Test add'}
                </AmButton></AmToolTip>
                {' - '}
                <AmButton styleType="add" disabled>
                    {'Test add'}
                </AmButton>
                {' - '}
                <AmButton styleType="add_clear">
                    {'Test add'}
                </AmButton>
                {' - '}
                <AmButton styleType="add_clear" disabled>
                    {'Test add'}
                </AmButton>
                {' - '}
                <AmButton styleType="add_outline" >
                    {'Test add'}
                </AmButton>
                {' - '}
                <AmButton styleType="add_outline" disabled>
                    {'Test add'}
                </AmButton>
                <br />
                <AmButton styleType="delete" className={classNames(classes.button)}>
                    {'Test delete'}
                </AmButton>
                {' - '}
                <AmButton styleType="delete" disabled>
                    {'Test delete'}
                </AmButton>
                {' - '}
                <AmButton styleType="delete_clear" >
                    {'Test delete'}
                </AmButton>
                {' - '}
                <AmButton styleType="delete_clear" disabled>
                    {'Test delete'}
                </AmButton>
                {' - '}
                <AmButton styleType="delete_outline" >
                    {'Test delete'}
                </AmButton>
                {' - '}
                <AmButton styleType="delete_outline" disabled>
                    {'Test delete'}
                </AmButton>
                <br />
                <AmButton styleType="confirm" className={classNames(classes.button)}>
                    {'Test confirm'}
                </AmButton>
                {' - '}
                <AmButton styleType="confirm" disabled>
                    {'Test confirm'}
                </AmButton>
                {' - '}
                <AmButton styleType="confirm_clear">
                    {'Test confirm'}
                </AmButton>
                {' - '}
                <AmButton styleType="confirm_clear" disabled>
                    {'Test confirm'}
                </AmButton>
                {' - '}
                <AmButton styleType="confirm_outline" >
                    {'Test confirm'}
                </AmButton>
                {' - '}
                <AmButton styleType="confirm_outline" disabled>
                    {'Test confirm'}
                </AmButton>
                <br />
                <AmButton styleType="info" className={classNames(classes.button)}>
                    {'Test info'}
                </AmButton>
                {' - '}
                <AmButton styleType="info" disabled>
                    {'Test info'}
                </AmButton>
                {' - '}
                <AmButton styleType="info_clear">
                    {'Test info'}
                </AmButton>
                {' - '}
                <AmButton styleType="info_clear" disabled>
                    {'Test info'}
                </AmButton>
                {' - '}
                <AmButton styleType="info_outline" >
                    {'Test info'}
                </AmButton>
                {' - '}
                <AmButton styleType="info_outline" disabled>
                    {'Test info'}
                </AmButton>
                <br />
                <AmButton styleType="warning" className={classNames(classes.button)}>
                    <SaveIcon className={classNames(classes.leftIcon)} />
                    {'Test warning'}
                </AmButton>
                {' - '}
                <AmButton styleType="warning" disabled>
                    {'Test warning'}
                </AmButton>
                {' - '}
                <AmButton styleType="warning_clear">
                    {'Test warning'}
                </AmButton>
                {' - '}
                <AmButton styleType="warning_clear" disabled>
                    {'Test warning'}
                </AmButton>
                {' - '}
                <AmButton styleType="warning_outline" >
                    {'Test warning'}
                </AmButton>
                {' - '}
                <AmButton styleType="warning_outline" disabled>
                    {'Test warning'}
                </AmButton>
                {' - '}
                <br />
                <AmButton styleType="default" className={classNames(classes.button)}>
                    <SaveIcon className={classNames(classes.leftIcon)} />
                    {'Test default'}
                </AmButton>
                {' - '}
                <AmButton styleType="default" disabled >
                    {'Test default'}
                </AmButton>
                {' - '}
                <AmButton styleType="default_clear">
                    {'Test default'}
                </AmButton>
                {' - '}
                <AmButton styleType="default_clear" disabled>
                    {'Test default'}
                </AmButton>
                {' - '}
                <AmButton styleType="default_outline" disabled={false}>
                    {'Test default'}
                </AmButton>
                {' - '}
                <AmButton styleType="default_outline" disabled>
                    {'Test default'}
                </AmButton>
                {' - '}
                <br />
                <AmButton styleType="dark" style={{ lineHeight: 1.5 }}>
                    <SaveIcon className={classNames(classes.leftIcon)} />
                    {'Test dark'}
                </AmButton>
                {' - '}
                <AmButton styleType="dark" disabled>
                    {'Test dark'}
                </AmButton>
                {' - '}
                <AmButton styleType="dark_clear">
                    {'Test dark'}
                </AmButton>
                {' - '}
                <AmButton styleType="dark_clear" disabled>
                    {'Test dark'}
                </AmButton>
                {' - '}
                <AmButton styleType="dark_outline" style={{ width: "150px" }}>
                    {'Test dark'}
                </AmButton>
                {' - '}
                <AmButton styleType="dark_outline" disabled>
                    {'Test dark'}
                </AmButton>
                <br />
                <h4>Icon Status</h4>
                <span>เรียกใช้ผ่าน component  [IconStatus] ตรงๆ</span>
                <br />
                <AmIconStatus styleType={"NEW"} className={classNames(classes.icon)}>NEW</AmIconStatus>
                <br />
                <AmIconStatus styleType={"WORKING"} className={classNames(classes.icon)}>WORKING</AmIconStatus>
                <AmIconStatus styleType={"WORKED"} className={classNames(classes.icon)}>WORKED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"REMOVING"} className={classNames(classes.icon)}>REMOVING</AmIconStatus>
                {/* <AmEventStatus style={{ width: "190px", border: "3px solid red" }} styleType={"REMOVED"}>REMOVED</AmEventStatus> */}
                <AmIconStatus styleType={"REMOVED"} className={classNames(classes.icon)}>REMOVED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"RECEIVING"} className={classNames(classes.icon)}>RECEIVING</AmIconStatus>
                <AmIconStatus styleType={"RECEIVED"} className={classNames(classes.icon)}>RECEIVED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"REJECTING"} className={classNames(classes.icon)}>REJECTING</AmIconStatus>
                <AmIconStatus styleType={"REJECTED"} className={classNames(classes.icon)}>REJECTED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"CLOSING"} className={classNames(classes.icon)}>CLOSING</AmIconStatus>
                <AmIconStatus styleType={"CLOSED"} className={classNames(classes.icon)}>CLOSED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"PICKING"} className={classNames(classes.icon)}>PICKING</AmIconStatus>
                <AmIconStatus styleType={"PICKED"} className={classNames(classes.icon)}>PICKED</AmIconStatus>
                <AmIconStatus styleType="PENDING" className={classNames(classes.icon)}>PENDING</AmIconStatus>
                <br />
                <AmIconStatus styleType={"AUDITING"} className={classNames(classes.icon)}>AUDITING</AmIconStatus>
                <AmIconStatus styleType={"AUDITED"} className={classNames(classes.icon)}>AUDITED</AmIconStatus>
                <br />
                <AmIconStatus styleType={"RETURN"} className={classNames(classes.icon)}>RETURN</AmIconStatus>
                <AmIconStatus styleType={"HOLD"} className={classNames(classes.icon)}>HOLD</AmIconStatus>
                {/* <AmIconStatus styleType={"RETURN"} className={classNames(classes.icon)}><SaveIcon /></AmIconStatus> */}
                <br />
                <AmIconStatus styleType={"INACTIVE"} className={classNames(classes.icon)}>INACTIVE</AmIconStatus>
                <AmIconStatus styleType={"ACTIVE"} className={classNames(classes.icon)}>ACTIVE</AmIconStatus>
                <AmIconStatus styleType={"REMOVE"} className={classNames(classes.icon)}>REMOVE</AmIconStatus>
                <AmIconStatus styleType={"DONE"} className={classNames(classes.icon)}>DONE</AmIconStatus>
                <AmIconStatus styleType={"PASS"} className={classNames(classes.icon)}>PASS</AmIconStatus>

                <br />
                <span>เรียกใช้ผ่าน component  [StorageObjectEventStatus]</span>
                <br />
                {
                    stoStatusList.map((number, idx) => {
                        return <AmStorageObjectStatus key={idx} statusCode={number} />
                    })
                }
                <br />
                <span>เรียกใช้ผ่าน component  [DocumentEventStatus]</span>
                <br />
                {
                    docEventStatusList.map((number, idx) => {
                        return <><AmDocumentStatus key={idx} statusCode={number} /><br /></>
                    })
                }

                <br />
                <span>เรียกใช้ผ่าน component  [WorkQueueStatus]</span>
                <br />
                {
                    wqStatusList.map((number, idx) => {
                        return <AmWorkQueueStatus key={idx} statusCode={number} />
                    })
                }
                <br />
                <span>เรียกใช้ผ่าน component  [EntityStatus]</span>
                <br />
                {
                    entityStatus.map((number, idx) => {
                        return <AmEntityStatus key={idx} statusCode={number} />
                    })
                }
                <br />

                {/* <h4>CheckBox</h4>
                <AmCheckBox disabled />
                <AmCheckBox disabled defaultChecked />
                <AmCheckBox styleType="primary" defaultChecked />
                <AmCheckBox styleType="error" defaultChecked />
                <AmCheckBox styleType="default" defaultChecked />
                <AmCheckBox checked={state.checkedA} value="checkedA" onChange={handleChange('checkedA')} />
                <AmCheckBox checked={state.checkedB} value="checkedB" onChange={handleChange('checkedB')} />
                <AmCheckBox checked={state.checkedF} value="checkedF" styleType="error" onChange={handleChange('checkedF')} /> */}
            </AppWrapper>
        </div>
    );

}
Test5.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Test5);