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
import SvgIcon from '@material-ui/core/SvgIcon';

import AmRediRectInfo from '../../components/AmRedirectInfo'
import PhotoIcon from '@material-ui/icons/Photo';
// const logo = require('./images/PAL0000020.jpeg');
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
function JsonIcon(props) {
    return (
        <SvgIcon {...props} >
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </SvgIcon>
    );
}

function Test5(props) {

    const { classes } = props;
    const [querySelect, setQuerySelect] = useState(query);
    const { data, onClickLoad } = useExportExcel([], querySelect);
    const [isLoad, setIsLoad] = useState(false);
    const [showIMG, setShowIMG] = useState(null)
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

    const getPalletDel = (data) => {
        return <div style={{ display: "flex", maxWidth: '250px' }}>
            <label>{data}</label>
            <AmRediRectInfo customApi={() => getFile(data)} type={"custom_icon"} customIcon={<PhotoIcon fontSize="small" color="primary" />} />
        </div>

    }
    async function getFile(data) {
        try {
            await Axios.get(window.apipath + '/v2/download_image?fileName=' + data + "&token=" + localStorage.getItem("Token")).then(res => {

                if (res.data._result.status === 1) {
                    console.log(res.data.dataBase64)
                    setShowIMG(res.data.dataBase64)
                }
            });

        } catch (err) {
            console.log(err)
        }
    }
    const onClickLoadPDF = async () => {
        try {
            // let reqjson = {
            //     "layoutType": 0,
            //     "listsCode": [
            //         {
            //             "code": "PAL0000001"
            //         },
            //         {
            //             "code": "PAL0000002"
            //         }
            //     ]
            // }
            let reqjson = {
                "layoutType": 91,
                "listsCode":
                    [{ "code": "N|1|20381|100", "title": "FINISHED GOODS", "options": "itemName=PJAAN04-0017กกก&lotNo=&controlNo=2&supplier=&codeNo=&receivedDate=07/16/2020&qtyReceived=100&palletNo=1/2" }, { "code": "N|2|20381|50", "title": "FINISHED GOODS", "options": "itemName=PJAAN04-0017&lotNo=&controlNo=2&supplier=&codeNo=&receivedDate=07/16/2020&qtyReceived=50&palletNo=2/2" }]
            }
            await Axios.postload(window.apipath + "/v2/download/print_tag_code", reqjson, "printcode.pdf", "preview").then();

        } catch (err) {
            console.log(err)
        }
    }
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
                <AmButton styleType="add_clear" onClick={onClickLoadPDF}>
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
                <AmButton styleType="warning" className={classNames(classes.button)}
                    startIcon={<SaveIcon className={classNames(classes.leftIcon)} />}>
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
                <AmButton styleType="default" className={classNames(classes.button)}
                    startIcon={<SaveIcon className={classNames(classes.leftIcon)} />}>
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
                <AmButton styleType="dark" style={{ lineHeight: 1.5 }} disabled
                    startIcon={<SaveIcon className={classNames(classes.leftIcon)} />}>
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

            <JsonIcon fontSize='small' style={{ color: "#1a237e" }} />
            {/* <img src={'data:image/png;base64,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'}/> */}

            {/* {getPalletDel("PAL0000020")} */}
            {/* {showIMG ? <img src={showIMG} height={200} /> : null} */}
            {/* <img src={window.apipath + "/v2/download/download_image?fileName=" + "PAL0000020" + "&_token=" + localStorage.getItem("Token")} height={200} /> */}

            <a href={window.apipath +
                "/v2/download/print_pdf?fileName=MasterData_.pdf&token=" +
                localStorage.getItem("Token")}
                target="_blank">View PDF</a>
            <a href={window.apipath + "/v2/download/download_image?fileName=" + "AMW0000003" + "&token=" + localStorage.getItem("Token")} target="_blank">download me</a>


        </div>
    );

}
Test5.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Test5);