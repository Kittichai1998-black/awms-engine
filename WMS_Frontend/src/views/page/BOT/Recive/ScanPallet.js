import * as signalR from '@aspnet/signalr';
import React, { useState, useEffect } from "react";
import Fullscreen from "react-full-screen";
import AmInput from '../../../../components/AmInput';
import AmButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import Flash from 'react-reveal/Flash';
import { apicall, createQueryString } from '../../../../components//function/CoreFunction2'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import AmDialogs from '../../../../components/AmDialogs'
import AmTble from '../../../../components/AmTable/AmTableComponent'
import moment from "moment";
import { useTranslation } from 'react-i18next'

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
  padding: 1em 1em;
  border: 3px solid #e91e63;
  border-radius: 4px;
  display: block;
`;


const BorderGrey = styled.div`
  display: inline-block;
  color: #616161;
  font-size: 1.5em;
  margin: 1em;
  padding: 1em 1em;
  border: 3px solid #616161;
  border-radius: 4px;
  display: block;
`;




const dataSource = [{
    "code": '1000',
    "unit": '5000000',
    "unitType": '17',
    "packUnitType": 'N (ใหม่)',
    "ownnwer": 'BOT',
    "customer": 'SCB',
    "quantity": '20'
},
{
    "code": '5000',
    "unit": '5000000',
    "unitType": '17',
    "packUnitType": 'G (ดี)',
    "ownnwer": 'BOT',
    "customer": 'SCB',
    "quantity": '20'
},
{
    "code": '5000',
    "unit": '5000000',
    "unitType": '17',
    "packUnitType": 'G (ดี)',
    "ownnwer": 'BOT',
    "customer": 'SCB',
    "quantity": '20'
},
]


const ScanPallet = (props) => {
    const { t } = useTranslation()
    const [databar, setdatabar] = useState({});
    const [valueBarcode, setvalueBarcode] = useState();
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [isFullScreen, setIsFullScreen] = useState(false);
    //const { width, height } = useWindowWidth();
    const [area1, setarea1] = useState();
    const [data, setData] = useState()
    const [dataPallet, setDataPallet] = useState()
    const [palletCode, setpalletCode] = useState("");
    const [remark, setremark] = useState();
    const [dialogState, setDialogState] = useState({});


    useEffect(() => {
        // console.log(dashboard)

        let url = window.apipath + '/dashboard'
        let connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            //.configureLogging(signalR.LogLevel.Information)
            .build();

        const signalrStart = () => {

            connection.start()
                .then(() => {
                    connection.on('ReceiveHub', res => {
                        //console.log(res)
                        // console.log(JSON.parse(res))
                        setpalletCode(JSON.parse(res).code)
                        setDataPallet((JSON.parse(res)))
                        setData(JSON.parse(res).mapstos)
                    })
                })
                .catch((err) => {
                    // console.log(err);
                    setTimeout(() => signalrStart(), 5000);
                })
        };

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        signalrStart()

        return () => {
            connection.stop()
        }

    }, [])

    const HeadLock = () => {
        return <CardContent style={{ height: "80px", background: "#1769aa", textAlign: "center" }} >
            <Typography style={{ color: "#ffffff" }} variant="h3" component="h3">เลขที่ภาชนะ : {palletCode}</Typography>
        </CardContent>
    }


    const ComfirmRecive = () => {
        if (palletCode) {
            let postdata = {
                apiKey: "WCS_KEY",
                baseCode: palletCode,
                weight: 50.000,
                width: 1.200,
                length: 1.200,
                height: 1.000,
                warehouseCode: "1001",
                areaCode: "G01",
                locationCode: "G01",
                actualTime: moment().format("YYYY-MM-DDT00:00"),
                options: remark,
                mappingPallets: [{}]

            };
            // console.log(remark)
            // console.log(postdata)
            Axios.post(window.apipath + "/v2/register_wq_from_wms", postdata).then(
                res => {
                    if (res.data._result !== undefined) {
                        if (res.data._result.status === 1) {
                            setDialogState({ type: "success", content: "Success", state: true })
                            Clear()
                        } else {
                            setDialogState({ type: "error", content: res.data._result.message, state: true })
                            Clear()
                        }
                    }

                });

        }
    }
    const ComfirmCancel = () => {
        if (palletCode) {
            let postdata = {
                bstosID: dataPallet.id,
                remark: remark,
            };
            Axios.post(window.apipath + "/v2/cancel_wq_from_wms", postdata).then(
                res => {
                    if (res.data._result !== undefined) {
                        if (res.data._result.status === 1) {
                            setDialogState({ type: "success", content: "Success", state: true })
                            Clear()
                        } else {
                            setDialogState({ type: "error", content: res.data._result.message, state: true })
                            Clear()
                        }
                    }

                });

        }

    }
    const ComfirmPass = (adit) => {
        if (palletCode) {
            let postdata = {
                apiKey: "WCS_KEY",
                baseCode: palletCode,
                weight: 50.000,
                width: 1.200,
                length: 1.200,
                height: 1.000,
                warehouseCode: "1001",
                areaCode: "G01",
                locationCode: "G01",
                actualTime: moment().format("YYYY-MM-DDT00:00"),
                options: remark,
                bstosID: dataPallet.id,
                remark: remark,
                aditStatus: adit,
                mappingPallets: [{}]
            };
            Axios.post(window.apipath + "/v2/update_audit_register_wq", postdata).then(
                res => {
                    if (res.data._result !== undefined) {
                        if (res.data._result.status === 1) {
                            setDialogState({ type: "success", content: "Success", state: true })
                            Clear()
                        } else {
                            setDialogState({ type: "error", content: res.data._result.message, state: true })
                            Clear()
                        }
                    }

                });

        }

    }
    const Clear = () => {
        setpalletCode();
        setremark();
        setDataPallet([])
        setData([])
    };
    const GenButton = (type) => {
        if (type === "AUDIT") {
            return <div style={{
                paddingTop: '5%'
            }}>
                <div style={{
                    paddingBottom: '5%'
                }}> < AmButton
                    variant="contained"
                    style={{
                        width: "70%", height: "100%",
                        marginLeft: '20%', background: '#43a047',
                        color: '#ffffff', paddingBottom: '10%',
                        paddingTop: '10%'
                    }}
                    size="large"
                    onClick={() => { ComfirmPass("1") }}>
                        <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">  PASS </Typography>
                    </AmButton>
                </div>
                < AmButton
                    variant="contained"
                    style={{
                        width: "70%", height: "100%",
                        marginLeft: '20%', background: '#d50000',
                        color: '#ffffff', paddingBottom: '10%',
                        paddingTop: '10%',
                    }}
                    size="large"
                    onClick={() => { ComfirmPass("3") }}>
                    <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">
                        NOT PASS
            </Typography>
                </AmButton>
                <FormInline style={{
                    paddingBottom: '5%', marginLeft: '7%', paddingTop: '5%'
                }}>
                    <Typography
                        variant="h5" component="h3">REMARK : </Typography>
                    <AmInput style={{ width: "60%" }}
                        id="remark"
                        autoFocus={true}
                        value={valueBarcode}

                        onChange={(value, a, b, event) => {

                            if (value) {
                                setremark(value)
                            }
                        }}
                    >
                    </AmInput>
                </FormInline>
            </div>
        } else if (type === "RECIVE") {
            return <div style={{
                paddingTop: '5%'
            }}>
                <div style={{
                    paddingBottom: '5%'
                }}>  < AmButton
                    variant="contained"
                    style={{
                        width: "70%", height: "100%",
                        marginLeft: '20%', background: '#ffc107',
                        color: '#ffffff', paddingBottom: '10%',
                        paddingTop: '10%',
                    }}
                    size="large"
                    onClick={() => { ComfirmRecive() }}>
                        <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">
                            RECIVED
        </Typography>
                    </AmButton>
                </div>
                < AmButton
                    variant="contained"
                    style={{
                        width: "70%", height: "100%",
                        marginLeft: '20%', background: '#95a5a6',
                        color: '#ffffff', paddingBottom: '10%',
                        paddingTop: '10%',
                    }}
                    size="large"
                    onClick={() => { ComfirmCancel() }}>
                    <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">
                        CANCEL
            </Typography>
                </AmButton>
                <FormInline style={{
                    paddingBottom: '5%', marginLeft: '7%', paddingTop: '5%'
                }}>
                    <Typography
                        variant="h5" component="h3">REMARK : </Typography>
                    <AmInput style={{ width: "60%" }}
                        id="remark"
                        autoFocus={true}
                        value={valueBarcode}

                        onChange={(value, a, b, event) => {

                            if (value) {
                                setremark(value)
                            }
                        }}
                    >
                    </AmInput>
                </FormInline>
            </div>
        }
    }

    const column = [
        { Header: "สินค้า", accessor: "code", width: 80 },
        { Header: "ชนิดราคา", accessor: "skuTypeName", width: 100 },
        { Header: "แบบ", accessor: "ref2", width: 70, },
        { Header: "ประเภทธนบัตร", accessor: "ref3", width: 70 },
        { Header: "สถาบัน", accessor: "ref1", width: 80 },
        { Header: "ศูนย์เงินสด", accessor: "ref4", width: 100 },
        { Header: "จำนวน", accessor: "qty", width: 100 },
    ];
    return (

        <div>
            <AmDialogs
                typePopup={dialogState.type}
                onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
                open={dialogState.state}
                content={dialogState.content} />
            <div>
                <Grid item xs={12} >
                    <div>
                        <Card style={{ height: "90%", width: '90%', marginLeft: '5%', marginRight: '5%' }}>
                            <div>
                                <div>
                                    {palletCode ?
                                        <Flash>
                                            {HeadLock()}
                                        </Flash>
                                        : <div>{HeadLock()}</div>
                                    }
                                </div>

                            </div>
                            <FormInline>
                                <Grid item xs={8}>

                                    <div style={{ marginLeft: '5%' }}>
                                        <div style={{ paddingBottom: '1%' }}>
                                            <Typography variant="h4" component="h3">ข้อมูลพาเลท</Typography>
                                        </div>
                                        <AmTble
                                            dataSource={data}
                                            columns={column}
                                            pageSize={20}
                                            minRows={6}
                                            currentPage={0}
                                            style={{
                                                background: 'white',
                                                fontSize: 20,
                                            }}
                                            dataKey="ID"
                                        >
                                        </AmTble>
                                    </div>
                                </Grid>

                                <Grid item xs={4}>
                                    <div style={{
                                        paddingTop: '5%'
                                    }}>
                                        {/* {console.log(data)} */}

                                        {data !== undefined && data !== null ?
                                            data.length === 0 ? null :
                                                (data[0].eventStatus !== 14 ? GenButton("RECIVE") : GenButton("AUDIT"))
                                            : GenButton("RECIVE")}
                                    </div>


                                </Grid >
                            </FormInline>
                        </Card>

                    </div>
                </Grid>
            </div>
        </div >

    );
}
ScanPallet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScanPallet);
