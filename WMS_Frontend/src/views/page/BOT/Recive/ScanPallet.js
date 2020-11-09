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
    const [data, setData] = useState(dataSource)
    const [palletCode, setpalletCode] = useState('KK00011');
    const [remark, setremark] = useState();


    useEffect(() => {
        // console.log(dashboard)

        let url = window.apipath + '/receive'
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
                    connection.on('', res => {
                        console.log(res)
                        //setCount(count + 1);
                        //data[0][0].table[0].headercol = headercol1
                        //data[0][0].table[0].data = JSON.parse(res)
                        //setData([...data])
                    })
                })
                .catch((err) => {
                    console.log(err);
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


    const StorageObjectQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "StorageObjectQuery",
        q: '',
        f: "ID,Code,Name, AreaMaster_ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 2,
        all: "",

    }



    const HeadLock = () => {
        return <CardContent style={{ height: "80px", background: "#1769aa" }} >
            <Grid container spacing={12}>
                <Grid item xs={4}>
                </Grid> <Grid item xs={6}>
                    <FormInline>
                        <div style={{ marginRight: "20px" }}>
                        </div>
                        {palletCode ?
                            <Typography style={{ color: "#ffffff" }} variant="h3" component="h3">เลขที่ภาชนะ : {palletCode}</Typography>
                            : null
                        }
                    </FormInline>
                </Grid>
            </Grid>
        </CardContent>
    }


    const ComfirmRecive = () => {
        let datas
        if (palletCode) {
            datas = {
                'palletCode': palletCode,
                'remark': remark ? remark : null
            }
            console.log(datas)
            if (datas) {

                setStateDialogSuc(true)
                setMsgDialogSuc('สำเร็จ')
                setpalletCode();
                setremark();
                setData([])

            }
        }


    }

    const ComfirmNotPass = () => {


    }

    const column = [
        { Header: "สินค้า", accessor: "code" },
        { Header: "ชนิดราคา", accessor: "unit" },
        { Header: "แบบ", accessor: "unitType", width: 100, },
        { Header: "ประเภทธนบัตร", accessor: "packUnitType" },
        { Header: "สถาบัน", accessor: "ownnwer" },
        { Header: "ศูนย์เงินสด", accessor: "customer" },
        { Header: "จำนวน", accessor: "quantity" },
    ];



    return (

        <div>
            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
            <AmDialogs typePopup={"success"} content={msgDialogSuc} onAccept={(e) => { setStateDialogSuc(e) }} open={stateDialogSuc}></AmDialogs >
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
                                            dataKey="ID"
                                            columns={column}
                                            pageSize={200}
                                            tableConfig={false}
                                            dataSource={data}

                                            //   height={200}
                                            rowNumber={true}
                                            style={{
                                                background: 'white',
                                                fontSize: 20,
                                                maxHeight:2000,
                                                // fontWeight: '700', 
                                                zIndex: 0
                                            }}
                                        >
                                        </AmTble>
                                    </div>


                                </Grid>

                                <Grid item xs={4}>
                                    <div style={{
                                        paddingTop: '5%'
                                    }}>
                                        < AmButton
                                            variant="contained"
                                            style={{
                                                width: "70%", height: "100%",
                                                marginLeft: '20%', background: '#43a047',
                                                color: '#ffffff', paddingBottom: '10%',
                                                paddingTop: '10%'
                                            }}
                                            size="large"
                                            onClick={() => { ComfirmRecive() }}>
                                            <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">  PASS </Typography>
                                            </AmButton>
                                    </div>
                                    <div style={{
                                        paddingBottom: '5%',
                                        paddingTop: '5%'
                                    }}>
                                        < AmButton
                                            variant="contained"
                                            style={{
                                                width: "70%", height: "100%",
                                                marginLeft: '20%', background: '#d50000',
                                                color: '#ffffff', paddingBottom: '10%',
                                                paddingTop: '10%',
                                            }}
                                            size="large"
                                            onClick={() => { ComfirmNotPass() }}>
                                            <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">
                                                NOT PASS
                                            </Typography>
                                            </AmButton>
                                    </div>
                                    <FormInline style={{ paddingBottom: '5%', marginLeft: '7%' }}>
                                        <Typography
                                            variant="h5" component="h3">REMARK : </Typography>
                                        <AmInput style={{ width: "60%"}}
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
                                </Grid >
                            </FormInline>
                        </Card>

                    </div>
                </Grid>
            </div>
        </div>

    );
}
ScanPallet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScanPallet);
