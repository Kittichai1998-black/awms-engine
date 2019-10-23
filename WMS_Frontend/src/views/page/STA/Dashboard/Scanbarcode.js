import * as signalR from '@aspnet/signalr';
import React, { useState, useEffect } from "react";
import Fullscreen from "react-full-screen";
import AmInput from '../../../../components/AmInput';
import AmButton from '../../../../components/AmButton';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components'
import AmDropdown from "../../../../components/AmDropdown"
import { apicall, createQueryString } from '../../../../components/function/CoreFunction2'
import { ExplodeRangeNum, MergeRangeNum, ToRanges, match } from '../../../../components/function/RangeNumUtill';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Flash from 'react-reveal/Flash';
import AmDialogs from '../../../../components/AmDialogs'
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import IconLock from '@material-ui/icons/Lock';
import IconLockOpen from '@material-ui/icons/LockOpen';
import Moment from 'moment';
import { useTranslation } from 'react-i18next'
import * as SC from '../../../../constant/StringConst'
import Axios1 from 'axios'
const Axios = new apicall()


const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    content: {
        marginBottom: 10
    },
    inlineTitle: {
        display: 'flex',
        fontWeight: 'bold',
        alignItems: 'center',
        verticalAlign: 'middle',
        textAlign: 'right'
    },
    div: {
        justifyContent: 'right'
    },
    spacing: {
        marginRight: '5px',
    },
});




const FormInline = styled.div`

display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 6px 6px 6px 0;
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

const Border = styled.div`
  display: inline-block;
  color: #e91e63;
  font-size: 1.5em;
  margin: 1em;
  display: block;
`;


const BorderGrey = styled.div`
  display: inline-block;
  color: #616161;
  font-size: 1.5em;
  margin: 1em;
  display: block;
`;

const useAreaID = (areaID) => {
    const [areaIDs, setareaIDs] = useState();

    useEffect(() => {
        setareaIDs(areaID)
    }, [areaID]);

    return areaIDs;
}

const useWCSStatus = () => {
    const [data, setData] = useState([]);
    let url = window.apipath + '/dashboard'
    let connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets //1
        })
        // .configureLogging(signalR.LogLevel.Information)
        .build();

    const signalrStart = () => {
        connection.start()
            .then(() => {
                connection.on("alert" , res => {
                    setData(JSON.parse(res))
                })
            })
            .catch((err) => {
                setTimeout(() => signalrStart(), 5000);
            })
    };
    
    useEffect(() => {
        signalrStart()

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        return () => {
            connection.stop()
        }
    }, [])

    return data;
}

const useDashboardArea = (areaID) => {
    const [data, setData] = useState(null);
    let url = window.apipath + '/dashboard'
    let connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets //1
        })
        // .configureLogging(signalR.LogLevel.Information)
        .build();

    const signalrStart = () => {
        connection.start()
            .then(() => {
                connection.on("DASHBOARD_PRD_RECIEVE_" + areaID, res => {
                    setData(JSON.parse(res))
                })
            })
            .catch((err) => {
                setTimeout(() => signalrStart(), 5000);
            })
    };

    useEffect(() => {
        signalrStart()

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        return () => {
            connection.stop()
        }
    }, [areaID])

    return data;
}

const useClock = (propsTime, t) => {
    const [date, setDate] = useState()
    const [time, setTime] = useState()

    useEffect(() => {
        Axios1.get(window.apipath + "/v2/time").then((res) => {
            if (res) {
                setDate({
                    dateClient: new Date(),
                    dateServer: new Date(res.data.dbTime + "+07:00"),
                });
            }
        })  
    }, [])

    useEffect(() => {
        if (date) {
            var timerID = setInterval(() => runningCurrentDate(), 250);
            return () => {
                clearInterval(timerID);
            };
        }
    }, [date, localStorage.getItem("Lang")])

    useEffect(() => {
        if (date)
            runningCurrentDate()
    }, [localStorage.getItem("Lang")])

    const runningCurrentDate = () => {
        let currentDateTime = new Date(date.dateServer.getTime() + (new Date().getTime() - date.dateClient.getTime()));
        setTime(t(propsTime.label) + Moment(currentDateTime).format(propsTime.format))
    }
    return time
}


const Scanbarcode = (props) => {
    const { t } = useTranslation()
    const { classes, location, history } = props;
    const [valueText, setValueText] = useState({});
    const [databar, setdatabar] = useState({});
    const [valueBarcode, setvalueBarcode] = useState();  
    const [productCode, setproductCode] = useState();
    const [qty, setqty] = useState(0);
    const [qtyMax, setqtyMax] = useState(0);
    const [areaGate, setareaGate] = useState();
    const [carton, setcarton] = useState();
    const [pallet, setpallet] = useState();
    const [orderNo, setorderNo] = useState();
    const [unitCode, setunitCode] = useState('PC');

    const [productCode2, setproductCode2] = useState();
    const [qty2, setqty2] = useState(0);
    const [qtyMax2, setqtyMax2] = useState(0);
    const [areaGate2, setareaGate2] = useState();
    const [carton2, setcarton2] = useState();
    const [pallet2, setpallet2] = useState();
    const [orderNo2, setorderNo2] = useState();
    const [unitCode2, setunitCode2] = useState('PC');
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.25);
    const areaIDs = useAreaID(localStorage.getItem("areaIDs"));
    const wcsAlert = useWCSStatus();
    const data = useDashboardArea(localStorage.getItem("areaIDs"))
    //const { width, height } = useWindowWidth();
    const [area1, setarea1] = useState();
    const [area2, setarea2] = useState();
    const [gateLeft, setgateLeft] = useState(false);
    const [gateRight, setgateRight] = useState(false);
    const [width_height, set_width_height] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const [lockStateLeft, setLockStateLeft] = useState(false)
    const [lockStateRight, setLockStateRight] = useState(false)

    const [lockGateID, setLockGateID] = useState([])

    const [manualAddLeft, setManualAddLeft] = useState({})
    const [manualAddRight, setManualAddRight] = useState({})
    
    const updateNoQRData = (side, field, value) => {
        let iniData = {};
        if(side === "left"){
            iniData = manualAddLeft;
            iniData[field] = value;
            setManualAddLeft({...iniData,"palletCode":pallet})
        }
        else{
            iniData = manualAddRight;
            iniData[field] = value;
            setManualAddRight({...iniData,"palletCode":pallet2})
        }
    };

    const clock = useClock({
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        label: ""
    }, t)
   const time = clock 

   useEffect(() => {
    console.log(wcsAlert)
    }, [wcsAlert])

    useEffect(() => {
        setTimeout(() => {
            set_width_height({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }, 20);
    }, [isFullScreen])

    const goFull = () => {
        setIsFullScreen(true);
        setCalHeight(0.6);
    }
    const goMin = () => {
        setIsFullScreen(false);
        setCalHeight(0.65);
    }
    const AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"<", "v": 8}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 7,
        all: "",
    }

    const AreaLocationMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationMaster",
        q: '',
        f: "ID,Code,Name, AreaMaster_ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 2,
        all: "",

    }


    const onHandleChangeDDL = (value, dataObject, inputID, fieldDataKey) => {
        localStorage.setItem("areaIDs", value);
        localStorage.setItem("areaCode", dataObject.Code);
        let Area = value
        var databars = { ...databar }
        databars.areaID = Area
        setdatabar(databars)
    }
    
    /*useEffect(() => {
        setInterval(() => {
            if (areaIDs != null && areaIDs != NaN) {
                getScanbar();
            }
        }, 3000);
        
    }, [areaIDs])*/

    const MapStoNoDoc = (areaGateLoc, side) => {
        let mapSto = {};
        if(side === "left"){
            if(data !== null){
                let leftGate = data.find(x => x.gate === 1);
                if(leftGate !== null && leftGate !== undefined && leftGate.baseID !== null)
                {
                    let splitItem = [];
                    let carton = manualAddLeft.carton.split(',');
                    carton.forEach(e => {
                        if(e.includes('-')){
                            let splitCar = [];
                            let carArr = e.split('-');
                            for(let i = carArr[0]; i<= carArr[1]; i++)
                            {
                                splitCar.push(parseInt(i))
                            }
                            splitItem = splitItem.concat(splitCar)
                        }
                        else{
                            splitItem.push(parseInt(e))
                        }
                    });

                    let disCarton = splitItem.filter((v, i, a) => a.indexOf(v) === i).sort();
                    let resCarton = MergeRangeNum(disCarton.join(','));

                    mapSto.rootID = leftGate.baseID;
                    mapSto.scanCode = manualAddLeft.code;
                    mapSto.orderNo = manualAddLeft.orderNo;
                    mapSto.amount = disCarton.length;
                    mapSto.warehouseID = 1;
                    mapSto.areaID = leftGate.areaID;
                    mapSto.locationCode = leftGate.areaLocationCode;
                    mapSto.action = 1;
                    mapSto.options = SC.OPT_CARTON_NO + '=' + resCarton;
                    mapSto.rootOptions = SC.OPT_DONE_DES_EVENT_STATUS + '=98';
                    mapSto.isRoot = false;
                }
            }
        }
        else{
            if(data !== null){
                
                let rightGate = data.find(x => x.gate === 2);
                if(rightGate !== null && rightGate !== undefined && rightGate.baseID !== null)
                {
                    let splitItem = [];
                    let carton = manualAddRight.carton.split(',');
                    carton.forEach(e => {
                        if(e.includes('-')){
                            let splitCar = [];
                            let carArr = e.split('-');
                            for(let i = carArr[0]; i<= carArr[1]; i++)
                            {
                                splitCar.push(parseInt(i))
                            }
                            splitItem = splitItem.concat(splitCar)
                        }
                        else{
                            splitItem.push(parseInt(e))
                        }
                    });

                    let disCarton = splitItem.filter((v, i, a) => a.indexOf(v) === i).sort();
                    let resCarton = MergeRangeNum(disCarton.join(','));

                    mapSto.rootID = rightGate.baseID;
                    mapSto.scanCode = manualAddRight.code;
                    mapSto.orderNo = manualAddRight.orderNo;
                    mapSto.amount = disCarton.length;
                    mapSto.warehouseID = 1;
                    mapSto.areaID = rightGate.areaID;
                    mapSto.locationCode = rightGate.areaLocationCode;
                    mapSto.action = 1;
                    mapSto.options = SC.OPT_CARTON_NO + '=' + resCarton;
                    mapSto.rootOptions = SC.OPT_DONE_DES_EVENT_STATUS + '=98';
                    mapSto.isRoot = false;
                }
            }
        }
        Axios.post(window.apipath + '/v2/ScanMapStoAPI', mapSto).then(res => {
            UnlockGate(areaGateLoc, side)
        })
    }

    const RemovePackSto = (baseID, areaID) => {
        Axios.post(window.apipath + '/v2/RemoveFromPalletRecievedAPI', {baseStoID:baseID, areaID:areaID}).then(res => console.log(res))
        document.getElementById("barcodeLong").focus()
    }

    const UnlockGate = (areaGateLoc, side) => {
        
        setLockGateID(lockGateID.filter(x => x !== areaGateLoc))
        databar.lockGateID = lockGateID
        setdatabar({...databar})
        if(side === "left")
            setLockStateLeft(false)
        else
            setLockStateRight(false)

        document.getElementById("barcodeLong").focus()
    }
    
    const LockGate = (areaGateLoc, side) => {
        lockGateID.push(areaGateLoc)
        databar.lockGateID = lockGateID
        setdatabar({...databar})
        if(side === "left")
            setLockStateLeft(true)
        else
            setLockStateRight(true)
        
        document.getElementById("barcodeLong").focus()
    }

    const Scanbar = () => {
        var databars = {...databar}
        Axios.post(window.apipath + '/v2/ScanMapBaseReceiveAPI', databars).then((res) => {
            if (res.data._result.status === 1) {

                if (res.data.bsto != null) {
                    var datass = res.data.bsto.mapstos[0]
                    var dataQtyMax = res.data.bsto.objectSizeMaps[0]
                    if (datass.qty === null) {
                        setqty(0)
                    } else { setqty(datass.qty) }
                    if (dataQtyMax.maxQuantity === null) {
                        setqtyMax(0)
                    } else {
                        setqtyMax(dataQtyMax.maxQuantity)

                    }
                    if (datass.qty != null && dataQtyMax.maxQuantity != null) {

                        var qtyIn = parseFloat(datass.qty)
                        var qtyMaxIn = parseFloat(dataQtyMax.maxQuantity)

                        var calQty = qtyMaxIn - qtyIn

                        if (calQty < qtyMaxIn) {
                            var MsgError = "Recive " + calQty + "/" + qtyMaxIn;
                            setMsgDialogSuc(MsgError);
                            setStateDialogSuc(true);
                        }
                        else if (calQty === qtyMaxIn) {
                            var MsgErrors = "Empty"
                            setMsgDialog(MsgErrors);                          
                            setStateDialog(true);
                        } else {

                        }

                    }
                } else {

                    setMsgDialog(res.data._result.message);
                    setStateDialog(true);
                }


            } else {
                setMsgDialog(res.data._result.message);
                setStateDialog(true);
            }

        })
        document.getElementById("barcodeLong").focus()
    }

    useEffect(()=>{
        if(data !== null){
            data.forEach(x=>{
                if(x.gate === 1){
                    setarea1(x.areaLocationCode)
                    if(x.baseID !== null){
                        setgateLeft(true)
                        setpallet(x.baseCode)
                        setareaGate(x.areaID)
                        
                        if (x.Quantity === null || x.Quantity === undefined) {
                            setqty(0)
                        } else {
                            setqty(x.Quantity)
                        }
                        if (x.MaxQuantity === null) {
                            setqtyMax(0)
                        } else {
                            setqtyMax(x.MaxQuantity)
                        }

                        setproductCode(x.Code)
                        setorderNo(x.OrderNo)
                        setunitCode(x.UnitCode)
                        setcarton(x.Options !== "" && x.Options !== null ? x.Options.split("=")[1].split("&")[0] : null)
                    }
                    else{
                        setgateLeft(false)
                    }
                }
                else{
                    setarea2(x.areaLocationCode)
                    if(x.baseID !== null){
                        setgateRight(true)
                        setpallet2(x.baseCode)
                        setareaGate2(x.areaID)
                        
                        if (x.Quantity === null || x.Quantity === undefined) {
                            setqty2(0)
                        } else {
                            setqty2(x.Quantity)
                        }
                        if (x.MaxQuantity === null) {
                            setqtyMax2(0)
                        } else {
                            setqtyMax2(x.MaxQuantity)
                        }
                        setproductCode2(x.Code)
                        setorderNo2(x.OrderNo)
                        setunitCode2(x.UnitCode)
                        setcarton2(x.Options !== "" && x.Options !== null ? x.Options.split("=")[1].split("&")[0] : null)
                    }
                    else{
                        setgateRight(false)
                    }
                }
            })
        }
    }, [data])

    const getScanbar = () => {
        let areas = parseInt(areaIDs, 10);
        Axios.get(window.apipath + '/v2/CheckBaseReceivedAPI?areaID=' + areas).then((res) => {
            //console.log(res.data.datas)
            if (res.data._result.status = 1) {
                if (res.data.datas != null) {
                    setarea1(res.data.datas[0].areaLocationCode)
                    setarea2(res.data.datas[1].areaLocationCode)
                    if (res.data.datas[0].bsto !== null) {
                        setgateLeft(true)
                        let datas = res.data.datas[0].bsto
                        
                        setpallet(datas.code)
                        setareaGate(datas.areaID)
                        let datass = datas.mapstos[0]

                        if (datass !== undefined) {
                            let dataQtyMax = datas.objectSizeMaps[0]
                            console.log(dataQtyMax)
                            if (datass.qty === null || datass.qty === undefined) {
                                setqty(0)
                            } else {
                                setqty(datass.qty)
                            }
                            if (dataQtyMax.maxQuantity === null) {
                                setqtyMax(0)
                            } else {
                                setqtyMax(dataQtyMax.maxQuantity)

                            }
                            setproductCode(datass.code)
                            setorderNo(datass.orderNo)
                            setunitCode(datass.unitCode)
                            setcarton(datass.options.split("=")[1].split("&")[0])
                        }
                
                    }

                    if (res.data.datas[1].bsto !== null){
                        setgateRight(true)
                        let datas = res.data.datas[1].bsto
                        setpallet2(datas.code)
                        setareaGate2(datas.areaID)
                        let datass = datas.mapstos[0]

                        if (datass !== undefined) {
                            let dataQtyMax = datas.objectSizeMaps[0]

                            if (datass.qty === null || datass.qty === undefined) {
                                setqty2(0)
                            } else {
                                setqty2(datass.qty)
                            }
                            if (dataQtyMax.maxQuantity === null) {
                                setqtyMax2(0)
                            } else {
                                setqtyMax2(dataQtyMax.maxQuantity)
                            }
                            setproductCode2(datass.code)
                            setorderNo2(datass.orderNo)
                            setunitCode2(datass.unitCode)
                            setcarton2(datass.options.split("=")[1].split("&")[0])
                        }
                    }
                    }
                }
            
        })

    }

 const HeadGateA = (getGate) => {
        return <CardContent style={{ height: "60px", background: "#e91e63" }} >
            <Grid container spacing={12}>
                <Grid item xs={4}>                 
                </Grid> <Grid item xs={6}>
                    <FormInline>
                        <div style={{ marginRight:"20px" }}>
                        <IconLockOpen style={{ color: "#ffffff", fontSize: '40px' }}></IconLockOpen>
                    </div>
                        <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">
                            {getGate}</Typography>
                    </FormInline>
                </Grid>
            </Grid>
        </CardContent>
    }

    const HeadGateB = (getGate) => {
        return <CardContent style={{ height: "60px",  }} >
            <Grid container spacing={12}>
                <Grid item xs={5}></Grid> <Grid item xs={4}>
                    <Typography  style={{ color: "#ffffff" }} variant="h4" component="h3">{getGate}</Typography>
                </Grid>
            </Grid>
        </CardContent>
    }

    const HeadLock = (getGate) => {
        return <CardContent style={{ height: "60px", background: "#bdbdbd" }} >
            <Grid container spacing={12}>
                <Grid item xs={4}>
                </Grid> <Grid item xs={6}>
                    <FormInline>
                        <div style={{ marginRight: "20px" }}>
                            <IconLock style={{ fontSize: '40px' }}></IconLock>
                        </div>
                        <Typography style={{ color: "#212121" }} variant="h4" component="h3">{getGate}</Typography>
                    </FormInline>
                </Grid>
            </Grid>
        </CardContent>
    }


    const HeadGateC = (getGate) => {
        return <CardContent style={{ height: "60px", background: "#fcfcfc" }} >
            <Grid container spacing={12}>
                <Grid item xs={5}></Grid> <Grid item xs={4}>
                    {console.log(lockStateRight)}
                    <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">{getGate}</Typography>
                </Grid>
            </Grid>
        </CardContent>
    }

    const WCSStatusText = () => {
        let res = wcsAlert.find(x=> x.AreaCode === localStorage.getItem("areaCode"))
        if(res !== null && res !== undefined){
            if(res.ErrorFlag === true)
                return res.Status + ' : ' + res.Description;
            else
                return null;
        }
        else
            return null;
    }

    return (
        <Fullscreen
            enabled={isFullScreen}
            onChange={isFull => setIsFullScreen(isFull)}
        >
            <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: width_height.height, width: width_height.width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">
                
                <div className={classes.root}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="stretch"
                        className={classes.content}>
                        <Grid item xs={12} sm={6} md={6} xl={6}>
                            <Grid
                                container
                                direction="row"
                                justify="flex-start"
                                alignItems="center"
                            >
                                <Grid item>
                                </Grid>
                                <Grid item>
                                    {/* <p>width:{width} height:{height}</p> */}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} xl={6}>
                            <Grid
                                container
                                direction="row"
                                justify="flex-end"
                                alignItems="center"
                            >
                                <Grid item >
                                    <IconButton style={{ padding: 4 }} onClick={isFullScreen ? goMin : goFull}>
                                        {isFullScreen ?
                                            <FullscreenExitIcon fontSize="large" />
                                            : <FullscreenIcon fontSize="large" />
                                        }
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                
                <div style={{backgroundColor:"Red",fontSize:"3em", width:"100%", textAlign:"center"}}>
                    {
                        WCSStatusText()
                    }
                </div>
                <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
                <AmDialogs typePopup={"success"} content={msgDialogSuc} onAccept={(e) => { setStateDialogSuc(e) }} open={stateDialogSuc}></AmDialogs >
                <div>
                    <Grid container spacing={24}>
                        <Grid item xs={12} style={{ paddingLeft: "350px", paddingTop: "10px" }}>
                            <div style={{ paddingTop: "15px" }}>
                                <FormInline>
                                    <Typography variant="h4" component="h3">QR Code : </Typography>
                                    <AmInput style={{ width: "300px" }}
                                        id="barcodeLong"
                                        autoFocus={true}
                                        value={valueBarcode}
                                        
                                        onKeyPress={(value, a, b, event) => {
                                            if (event.key === "Enter") {
                                                let bar = value
                                                var databarcode = databar
                                                databarcode.scanCode = bar
                                                //setdatabar(databarcode)
                                                    setdatabar(databarcode);
                                                    document.getElementById("barcodeLong").value = "";
                                                    Scanbar();
                                            }
                                        }}
                                    >
                                    </AmInput></FormInline></div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{ paddingTop: "30px" }} >
                                <FormInline>
                                    <Typography style={{ paddingLeft: "120px" }} variant="h4" component="h3">Area : </Typography>
                                    <div style={{ marginRight: "10px" }}>
                                        <AmDropdown
                                            id="area"
                                            placeholder="Select"
                                            fieldDataKey="ID" //���촴Column ���ç�Ѻtable �db 
                                            fieldLabel={["Code", "Name"]}
                                            labelPattern=" : " //�ѭ�ѡɳ����ͧ��â�������ҧ����
                                            width={300} //��˹��������ҧ�ͧ��ͧ input
                                            ddlMinWidth={300} //��˹��������ҧ�ͧ���ͧ dropdown
                                            valueData={valueText} //��� value ������͡
                                            defaultValue={localStorage.getItem("areaIDs")}
                                            returnDefaultValue={true}
                                            queryApi={AreaMaster}
                                            onChange={onHandleChangeDDL}
                                            ddlType={"search"} //�ٻẺ Dropdown 
                                        />
                                    </div>
                                </FormInline>
                            </div>
                        </Grid>
                        <Grid item xs={6} >
                            <div style={{ paddingTop: "30px" }}>
                                <FormInline>
                                    <Typography  variant="h4" component="h3">{time} </Typography>
                                </FormInline>
                            </div>
                        </Grid>


                        <Grid item xs={6} >
                            <div style={{ paddingTop: "30px", marginRight: "5px" }}>
                                <Card>
                                    <div>
                                        {gateLeft === true ?
                                            lockStateLeft === true ? <div>{HeadLock(area1 ? area1 : "")}</div> :
                                            <Flash>{HeadGateA(area1 ? area1 : "")}</Flash>
                                            : <div>{HeadGateB(area1 ? area1 : "")}</div>}
                                    </div>
                                    <Card style={{ height: "500px" }}>
                                    {gateLeft === true ? 
                                    <div>
                                        {!lockStateLeft ? <Flash>
                                            <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
                                                <Grid item xs={1}></Grid><Grid item xs={11}>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Pallet :</Typography >
                                                        <Typography variant="h5" component="h3">{pallet}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Product :</Typography >
                                                        <Typography variant="h5" component="h3">{productCode}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">OrderNo :</Typography >
                                                        <Typography variant="h5" component="h3">{orderNo}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Carton :</Typography >
                                                        <Typography variant="h5" component="h3">{carton}</Typography>
                                                    </FormInline>

                                                </Grid></Grid>
                                                    {lockStateLeft === true ?
                                                            <BorderGrey>
                                                            
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax} <label style={{marginLeft:"20px"}}>{unitCode}</label></Typography>
                                                                </FormInline>
                                                            </BorderGrey> : <Border>
                                                            
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax} <label style={{marginLeft:"20px"}}>{unitCode}</label></Typography>
                                                                </FormInline>
                                                        </Border>}
                                                        <div style={{textAlign:"center"}}>
                                                        {productCode !== "" && productCode !== null && productCode !== undefined ? null :
                                                <AmButton style={{width:"80%", fontSize:"2em"}} styleType="confirm" onClick={()=> {
                                                    LockGate(areaGate, "left")
                                                    }}>Manual</AmButton>}

                                                <AmButton style={{marginTop:"10px",width:"80%", fontSize:"2em"}} styleType="delete" onClick={()=> {
                                                    RemovePackSto(pallet, areaIDs)
                                                }}>Remove</AmButton></div>
                                            </Card>
                                        </Flash> : 
                                        <Flash>
                                            <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
                                                <Grid item xs={1}></Grid><Grid item xs={11}>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Pallet :</Typography >
                                                        <Typography variant="h5" component="h3">{pallet}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Product :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="code" value={manualAddLeft["code"]}  onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("left" ,"code", value);
                                                            }}  onKeyPress={(value, a, b, event)=>{
                                                                if(event.key === "Enter"){
                                                                    document.getElementById("orderNo").focus();
                                                                }
                                                            }}/>
                                                        </Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">OrderNo :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="orderNo" value={manualAddLeft["orderNo"]}  onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("left" ,"orderNo", value);
                                                            }}  onKeyPress={(value, a, b, event)=>{
                                                                if(event.key === "Enter"){
                                                                    document.getElementById("carton").focus();
                                                                }
                                                            }}/>
                                                        </Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Carton :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="carton" value={manualAddLeft["carton"]}  onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("left" ,"carton", value);
                                                            }} />
                                                        </Typography>
                                                    </FormInline>
                                                </Grid></Grid>
                                                        {lockStateLeft === true ?
                                                            <BorderGrey>
                                                            
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax} <label style={{marginLeft:"20px"}}>{unitCode}</label></Typography>
                                                                </FormInline>
                                                            </BorderGrey> : <Border>
                                                            
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax} <label style={{marginLeft:"20px"}}>{unitCode}</label></Typography>
                                                                </FormInline>
                                                        </Border>}
                                                        
                                                        <div style={{textAlign:"center"}}>
                                                            
                                                    <AmButton style={{width:"80%", fontSize:"2em"}} styleType="confirm" onClick={()=> {
                                                        MapStoNoDoc(areaGate, "left")
                                                        UnlockGate(areaGate, "left")
                                                        setManualAddLeft({});
                                                    }}>Save</AmButton>
                                                    <AmButton style={{marginTop:"10px",width:"80%", fontSize:"2em"}} styleType="delete" onClick={() => {
                                                        UnlockGate(areaGate, "left")
                                                        setManualAddLeft({});
                                                        }}>Clear</AmButton>
                                                </div>
                                            </Card>
                                        </Flash>}
                                    </div> : null}
                                    </Card>
                                </Card>
                            </div>
                        </Grid>

                        <Grid item xs={6}>
                            <div style={{ paddingTop: "30px", marginLeft: "5px" }}>
                                <Card>
                                    <div>
                                        {gateRight === true ?
                                            lockStateRight === true ? <div>{HeadLock(area2 ? area2 : "")}</div> :
                                            <Flash>{HeadGateA(area2 ? area2 : "")}</Flash>
                                            : <div>{HeadGateB(area2 ? area2 : "")}</div>}
                                    </div>
                                <Card style={{ height: "500px" }} >
                                    {gateRight === true ? 
                                    <div>
                                        {!lockStateRight ? <Flash>
                                            <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
                                                <Grid item xs={1}></Grid><Grid item xs={11}>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Pallet :</Typography >
                                                        <Typography variant="h5" component="h3">{pallet2}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Product :</Typography >
                                                        <Typography variant="h5" component="h3">{productCode2}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">OrderNo :</Typography >
                                                        <Typography variant="h5" component="h3">{orderNo2}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }}>
                                                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Carton :</Typography >
                                                        <Typography variant="h5" component="h3">{carton2}</Typography>
                                                    </FormInline>

                                                </Grid></Grid>
                                                    {lockStateRight === true ?
                                                        <BorderGrey>
                                                            <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                <Typography variant="h5" component="h3"> {qty2 === 0 ? "-" : qty2} / {qtyMax2 === 0 ? "-" : qtyMax2} <label style={{marginLeft:"20px"}}>{unitCode2}</label></Typography>
                                                            </FormInline>
                                                        </BorderGrey> : 
                                                        <Border>
                                                            <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                <Typography variant="h5" component="h3"> {qty2 === 0 ? "-" : qty2} / {qtyMax2 === 0 ? "-" : qtyMax2} <label style={{marginLeft:"20px"}}>{unitCode2}</label></Typography>
                                                            </FormInline>
                                                        </Border>
                                                    }
                                                    <div style={{textAlign:"center"}}>
                                                        {productCode2 !== "" && productCode2 !== null && productCode2 !== undefined ? null :
                                                        <AmButton style={{width:"80%", fontSize:"2em"}} styleType="confirm" onClick={()=> {
                                                            LockGate(areaGate2, "right")
                                                            }}>Manual</AmButton>
                                                        }
                                                        <AmButton style={{marginTop:"10px",width:"80%", fontSize:"2em"}} styleType="delete" onClick={()=> {
                                                            RemovePackSto(pallet2, areaIDs)
                                                        }}>Remove</AmButton>
                                                    </div>
                                            </Card>
                                        </Flash> : 
                                        <Flash>
                                            <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
                                                <Grid item xs={1}></Grid><Grid item xs={11}>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Pallet :</Typography >
                                                        <Typography variant="h5" component="h3">{pallet2}</Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Product :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="code2" value={manualAddRight["code"]} onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("right" ,"code", value);
                                                            }} onKeyPress={(value, a, b, event)=>{
                                                                if(event.key === "Enter"){
                                                                    document.getElementById("orderNo2").focus();
                                                                }
                                                            }}/>
                                                        </Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">OrderNo :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="orderNo2" value={manualAddRight["orderNo"]} onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("right" ,"orderNo", value);
                                                            }}  onKeyPress={(value, a, b, event)=>{
                                                                if(event.key === "Enter"){
                                                                    document.getElementById("carton2").focus();
                                                                }
                                                            }}/>
                                                        </Typography>
                                                    </FormInline>
                                                    <FormInline style={{ paddingTop: "10px" }} >
                                                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Carton :</Typography >
                                                        <Typography variant="h5" component="h3">
                                                            <AmInput id="carton2" value={manualAddRight["carton"]} onChangeV2={(value, a, b, event)=>{
                                                                updateNoQRData("right" ,"carton", value);
                                                            }} />
                                                        </Typography>
                                                    </FormInline>
                                                </Grid></Grid>
                                                    {lockStateRight === true ?
                                                            <BorderGrey>
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty2 === 0 ? "-" : qty2} / {qtyMax2 === 0 ? "-" : qtyMax2} <label style={{marginLeft:"20px"}}>{unitCode2}</label></Typography>
                                                                </FormInline>
                                                            </BorderGrey> : 
                                                            <Border>
                                                                <FormInline style={{textAlign:"center", display:"inline-block", width:"100%", paddingTop: "10px" }}>
                                                                    <Typography variant="h5" component="h3"> {qty2 === 0 ? "-" : qty2} / {qtyMax2 === 0 ? "-" : qtyMax2} <label style={{marginLeft:"20px"}}>{unitCode2}</label></Typography>
                                                                </FormInline>
                                                            </Border>
                                                        }
                                                        <div style={{textAlign:"center"}}>
                                                            <AmButton style={{width:"80%", fontSize:"2em"}} styleType="confirm" onClick={()=> {
                                                                MapStoNoDoc(areaGate2, "right");
                                                                UnlockGate(areaGate2, "right");
                                                                setManualAddRight({});
                                                                }}>Save</AmButton>
                                                            <AmButton style={{marginTop:"10px", width:"80%", fontSize:"2em"}} styleType="delete" onClick={() => {
                                                                UnlockGate(areaGate2, "right");
                                                                setManualAddRight({});
                                                                    }}>Clear</AmButton>
                                                        <br/>
                                                        </div>
                                                        
                                            </Card>
                                        </Flash>}
                                    </div> : null}
                                </Card>
                                </Card></div></Grid>
                    </Grid>
                </div>
            </div>
        </Fullscreen>
    );
}
Scanbarcode.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Scanbarcode);
