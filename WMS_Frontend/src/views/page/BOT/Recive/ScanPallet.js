import * as signalR from '@aspnet/signalr';
import React, { useState, useEffect } from "react";
import Fullscreen from "react-full-screen";
import AmInput from '../../../components/AmInput';
import AmButton from '../../../components/AmButton';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components'
import { apicall, createQueryString } from '../../../components/function/CoreFunction2'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import AmDialogs from '../../../components/AmDialogs'
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

    const [data, setData] = useState([])


    useEffect(() => {
        // console.log(dashboard)

        let url = window.apipath + '/recive'
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
                    connection.on( res => {
                        console.log(JSON.parse(res));
                        //setCount(count + 1);
                        //data[0][0].table[0].headercol = headercol1
                        //data[0][0].table[0].data = JSON.parse(res)
                        //setData([...data])
                    })
                })
                .catch((err) => {
                    //console.log(err);
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

    }, [localStorage.getItem('Lang')])


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



    const HeadLock = (getGate) => {
        return <CardContent style={{ height: "60px", background: "#1769aa" }} >
            <Grid container spacing={12}>
                <Grid item xs={4}>
                </Grid> <Grid item xs={6}>
                    <FormInline>
                        <div style={{ marginRight: "20px" }}>                     
                        </div>
                        <Typography style={{ color: "#212121" }} variant="h4" component="h3">{getGate}</Typography>
                    </FormInline>
                </Grid>
            </Grid>
        </CardContent>
    }


    return (
        
          <div>
                <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
                <AmDialogs typePopup={"success"} content={msgDialogSuc} onAccept={(e) => { setStateDialogSuc(e) }} open={stateDialogSuc}></AmDialogs >
                <div>
                    <Grid container spacing={24}>
                        <Grid item xs={12} style={{ paddingLeft: "350px", paddingTop: "10px" }}>
                            <div style={{ paddingTop: "30px" }}>
                                <FormInline>
                                    <Typography variant="h4" component="h3">Pallet Code : </Typography>
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
                                            }
                                        }}
                                    >
                                    </AmInput></FormInline></div>
                        </Grid>
                
                        <Grid item xs={12} >
                        <div>
                            <Card style={{ height: "85%", width: '85%', marginLeft: '5%', marginRight: '5%' }}>
                                    <div>
                                      <div>{HeadLock(area1 ? area1 : "")}</div> 
                            
                                    </div>
                                <Card>
                                    <Card style={{ height: "60%", width: '60%', marginLeft: '2%', paddingBottom: '2%', paddingTop: '2%'}}>

                                        <Grid container spacing={12} style={{ paddingBottom: '2%', paddingTop: '2%' }} >
                                            <Grid item xs={12}></Grid><Grid item xs={6}>
                                                
                                            </Grid></Grid>
                              
                                            <div>

                                         
                                            </div>
                                        </Card>
                                    </Card>
                                </Card>
                            </div>
                        </Grid>

                    </Grid>
                </div>
            </div>
   
    );
}
ScanPallet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScanPallet);
