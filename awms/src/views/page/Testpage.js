import React, { useState, useEffect } from "react";
import { Input,Button} from 'reactstrap';
import Axios from 'axios';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Ambutton from '../../components/AmButton'
import AmButton from "../../components/AmButton";
import AmRadio from '../../components/AmRadio'
import AmRadioGroup from '../../components/AmRadioGroup'
import AmDialogConfirm from '../../components/AmDialogConfirm'
import AmCheckbox from '../../components/AmCheckBox'
import { Radio } from "@material-ui/core";




const query = {
    queryString: window.apipath + "/api/trx",
    t: "StorageObject",
    q: "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'ObjectType', c:'=', 'v': 2},{ 'f': 'EventStatus', c:'in', 'v': '11,12'}]",
    f: "Code, concat(Code, ':' ,Name) as Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: "",
    l: "100",
    all: "",
};

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
        + (select.q === "" ? "" : "&q=" + select.q)
        + (select.f === "" ? "" : "&f=" + select.f)
        + (select.g === "" ? "" : "&g=" + select.g)
        + (select.s === "" ? "" : "&s=" + select.s)
        + (select.sk === "" ? "" : "&sk=" + select.sk)
        + (select.l === 0 ? "" : "&l=" + select.l)
        + (select.all === "" ? "" : "&all=" + select.all)
        + "&isCounts=true"
        + "&apikey=free03"
    return queryS
}




const Body = (props) => {

    const [data, setData] = useState({});
    const [valueRadio, setvalueRadio] = useState([{ value: "xx", label: "xx", name: "n" },
    { value: "xx2", label: "xx2", name: "n" }]);
    const [getvalueRadio, setgetvalueRadio] = useState();

    useEffect(() => {
        props.value(data);
    })

    return <div>
        <div>
            <Input onChange={(e) => {
                let data2 = data;
                data.input1 = e.target.value
                setData(data2)
            }
            }></Input>
        </div>
    <div>
        <TextField onChange={(e) => {
            let data2 = data;
            data.input4 = e.target.value
            setData(data2)
            }}></TextField>
        </div>
            <div>
           
        <TextField onChange={(e) => {
            let data2 = data;
            data.input6 = e.target.value
            setData(data2)
            }}></TextField>
        </div>
        <div>
            <AmRadioGroup value={valueRadio} onChange={(vn) => {
                let data2 = data;
                data.inputRadio = vn;
                setData(data2)
            }}>
            </AmRadioGroup>

        </div>
        <AmRadio value="Radio" label="Radio" onChange={(vn) => {
            let data2 = data;
            data.inputRadios = vn
            setData(data2)
        }}>></AmRadio>

        <AmButton styleType="dark_outline" style={{ width: "150px" }}>
            {'Test DialogConfirm2'}
        </AmButton>
    </div>
    

}


const Body2 = (props) => {

    const [data2, setData2] = useState({});

    useEffect(() => {
        props.value(data2);
    })

    return <div>
        <input onChange={(e) => { setData2(e.target.value)}}></input>
    </div>
           
}


const BtnCus = () => {
    return <div>
        <AmButton styleType="dark_outline" style={{ width: "150px" }} >
            {'Test DialogConfirm2'}
        </AmButton></div>
}

const Popup = (props) => {

    const [open, setOpen] = useState(false);
    const [data, setData] = useState({});
    const [getvalue, setgetValue] = useState(0);
    const [Title, setTitle] = useState("Title");
    const [Bodys, setBodys] = useState("secondary");
    const [btnCon, setbtnCon] = useState("Yes");
    const [btnCan, setbtnCan] = useState("No");
    const [dataRadios, setdataRadios] = useState("");
    const [dataRadiosGroup, setdataRadiosGroup] = useState("");
    //const [datadropdown, setdatadropdown] = useState();
    const [datacheckbox, setdatacheckbox] = useState();
    const [valueText, setvalueText] = useState();

    const [CustomBtn, setCustomBtn] = useState(<div>Hii</div>);


    //useEffect(() => {
    //    Axios.get(createQueryString(query)).then((res) => {
    //        let createList = res.data.datas.map((x) => { return { "value": x.Code, "label": x.Name } })
    //        setdatadropdown(createList)
    //    })

    //}, [])


    //useEffect(() => {
    //    console.log(datadropdown)
    //}, [datadropdown])

    useEffect(() => {

        if (getvalue)
            alert(getvalue.input1 + " : " +
                getvalue.input2 + " : " +
                getvalue.input4 + " : " +
                getvalue.input5 + " : " +
                getvalue.input6 + " : " +
                getvalue.inputRadio + " : " +
                getvalue.inputRadios)

    }, [getvalue]);


    const handleClickOpen = () => {
       setTitle("Confirm...................")
        setBodys(<Body value={(e) => { setData(e); }} />)
        setOpen(true)
    }

    const handleClickOpen2 = () => {

        setTitle("Confirm...................")
        setBodys(<Body2 value={(e) => { setData(e); }} />)

        setOpen(true)

    }
    const onChange = (id, dataKeys, dataObjects) => (event)=> {
        setvalueText({
            ...valueText, [id]: {
                dataKey: dataKeys,
                dataObject: dataObjects,
              
            }
        })

        console.log(valueText)
        
    }


    return (
        <div>
            <div>

                <Typography variant="subtitle1">Input1: {data.input1}</Typography>
                <Typography variant="subtitle1">Input2: {data.input4}</Typography>
                <Typography variant="subtitle1">Input3: {data.input5}</Typography>
                <Typography variant="subtitle1">Input4: {data.input6}</Typography>
                <Typography variant="subtitle1">Value Radio:{data.inputRadio}</Typography>
                <Typography variant="subtitle1">Value Radio:{data.inputRadios}</Typography>
                <Typography variant="subtitle1">Value Radios:{dataRadios}</Typography>
                <Typography variant="subtitle1">Value Checkbox:{datacheckbox}</Typography>


                <Typography variant="subtitle1">Value RadioGroup:{dataRadiosGroup}</Typography>

                <br />

            </div>
            <div>
                <AmButton styleType="dark_outline" style={{ width: "150px" }} onClick={handleClickOpen}>
                    {'Test DialogConfirm'}
                </AmButton>
                <AmButton styleType="dark_outline" style={{ width: "150px" }} onClick={handleClickOpen2}>
                    {'Test DialogConfirm2'}
                </AmButton>
                <AmCheckbox value="checkbox" label="chckbox" onChange={(e, v) => setdatacheckbox(e)}></AmCheckbox>

            </div>

            <div>Radio</div>
            <AmRadio value="Radio" label="Radio" onChange={(vn) => setdataRadios(vn)}></AmRadio>

            <AmRadioGroup value={[{ value: "Radio1", label: "Radio1" },
            { value: "Radio2", label: "Radio2" }]}
                onChange={(vn) => setdataRadiosGroup(vn)}></AmRadioGroup>

            <AmDialogConfirm id="Dialogcon1" open={open} close={a => setOpen(a)} titleDialog={Title}
                dataDialog={data}
                onchange={(vn) => console.log(vn)}
                bodyDialog={Bodys}
               
                customBtn={<AmButton styleType="dark_outline" style={{ width: "100px" }}>
                    {'Test DialogConfirm2'}
                </AmButton> }
                styleDialog={{ width: "600px", height: "500px" }}
            />


            <AmDialogConfirm id="Dialogcon2" open={open} close={a => setOpen(a)} titleDialog={Title}
                dataDialog={data}
                onChange={(vn) => console.log(vn)}

                //onChange={onChange("Dialogcon2","data")}
                bodyDialog={Bodys}
              
                styleDialog={{ width: "600px", height: "500px" }}
            />





        </div>
    )

}

export default Popup;