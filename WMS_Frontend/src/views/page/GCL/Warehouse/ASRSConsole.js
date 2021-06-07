import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TextField,TableRow,Snackbar,CircularProgress,Grid,FormControlLabel } from '@material-ui/core';
import {Button,IconButton, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment,Checkbox } from '@material-ui/core';
import {Alert, TreeView, TreeItem} from '@material-ui/lab';
import GCLService from '../../../../components/function/GCLService'
import {Sort,CloseSharp,BrightnessHigh,CheckCircleOutlineRounded,Save,ExpandMore, ChevronRight, Style} from '@material-ui/icons'
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import * as signalR from '@aspnet/signalr';
import "../../../../assets/css/TableCustom.css";


let intervalGetSPReportAPI=null
const ASRSConsole=(props)=>{
  // const [dataTable, setDataTable] = useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [isCmdLoading,setIsCmdLoading]=useState(false);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [appNameList, setAppNameList] = React.useState([]);
  const [appNameSelect,setAppNameSelect]= React.useState(null)
  const [machineChecked, setMachineChecked] = React.useState({});
  const [machinesList, setMachinesList] = React.useState([]);
  const [cmdHistoryList, setCmdHistoryList] = React.useState([]);

  const textFieldCmd = useRef(null);

  useEffect(() => {
    loadAppName()
  }, []);

  useEffect(() => {
    clearInterval(intervalGetSPReportAPI);
    let machinesString=""
    for (var key in machineChecked) {
      if (machineChecked.hasOwnProperty(key) && machineChecked[key]==true)machinesString+=`${key},`;
    }
    setIsLoading(true);
    GCLService.get('/v2/WCS_Monitor_Front',{machines:machinesString}).then(res=>{
        setIsLoading(false);
        if(!res.data._result.status) {
          setToast({msg:"Load machines fail : "+res.data._result.message ,open:true,type:'error'})
          return ;
        }
        setMachinesList(res.data.datas)
        //auto load data
        intervalGetSPReportAPI=setInterval(()=>{
            GCLService.get('/v2/WCS_Monitor_Front',{machines:machinesString}).then(res=>{
              if(!res.data._result.status) {
                setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
                return ;
              }
              setMachinesList(res.data.datas)
            })
        },1000)
    })
    
    //on component unmount
    return () => {
      clearInterval(intervalGetSPReportAPI);
    }
  }, [machineChecked]);

//   useEffect(() => {
//     console.log(machineChecked)
//     let url = window.apipath + '/dashboard'
//     let connection = new signalR.HubConnectionBuilder()
//         .withUrl(url, {
//             skipNegotiation: true,
//             transport: signalR.HttpTransportType.WebSockets
//         }).build();

//     const signalrStart=()=>{
//       connection.start().then(() => {
//           connection.on("monitor_mc", res => {
//               console.log(res)
//           })
//       }).catch((err) => {
//           setTimeout(() => signalrStart(), 5000);
//       })
//     };

//     connection.onclose((err) => {
//         if (err) {
//             signalrStart()
//         }
//     });

//     signalrStart()

//     return () => {
//         connection.stop()
//     }

// },[])

  const loadAppName=()=>{
    window.loading.onLoading();
    setAppNameSelect(null)
    GCLService.get('/v2/WCS_List_AppName_Front').then(res=>{
      window.loading.onLoaded();
      if(!res.data._result.status) {
        setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      setAppNameList(res.data.datas)
    });
  }

  const handleChangeMachineChecked = (event) => {
    setMachineChecked({ ...machineChecked, [event.target.name]: event.target.checked });
  };

  const onPostCmd=()=>{
    if(!appNameSelect || !appNameSelect.app_name || !textFieldCmd.current.value) return;
    setIsCmdLoading(true)
    GCLService.post('/v2/WCS_Post_Command_Front',{app_name:appNameSelect.app_name, command:textFieldCmd.current.value}).then(res=>{
      setIsCmdLoading(false)
      textFieldCmd.current.focus()
      setCmdHistoryList([...cmdHistoryList,{text:`${appNameSelect.app_name} >> ${textFieldCmd.current.value}`,status:res.data._result.status}])
      textFieldCmd.current.value=""
      if(!res.data._result.status) {
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      setToast({msg:"Success",open:true,type:'success'})
    })
  }

  return (<>
    <Grid container spacing={1} style={{marginTop:10}}>
      <Grid item xs={2}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10}}>
          <p>🧿 App Name</p>
          {appNameList.map((item,key)=><Button key={key} variant={item.app_name==(appNameSelect?.app_name||'') ? 'contained' : 'text'} color='primary' fullWidth onClick={()=>{setAppNameSelect(item);setMachineChecked({})}}>{item.app_name||''}</Button>)}
        </Paper>
      </Grid>
    
      <Grid item xs={10}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10,overflowY:"scroll", maxHeight:500}}>
          {isLoading && <center><CircularProgress color='primary' size={50} style={{position: 'absolute'}}/></center>}
          {machinesList.length>0 ?
          <TableContainer className="tableCustom">
            <Table>
              <TableHead style={{backgroundColor:'#CCC'}}>
                <TableRow>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Machine</TableCell>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Comm</TableCell>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Status</TableCell>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Arg1</TableCell>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Arg2</TableCell>
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Arg3</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machinesList.map((machine,key)=>
                  <TableRow hover key={key}>
                    <TableCell>{machine.machine}</TableCell>
                    <TableCell>{machine.command}</TableCell>
                    <TableCell style={{backgroundColor: machine.status_color || null}}>{machine.status}</TableCell>
                    <TableCell>{machine.arg1}</TableCell>
                    <TableCell>{machine.arg2}</TableCell>
                    <TableCell>{machine.arg3}</TableCell>
                  </TableRow>
                )}                
              </TableBody>
            </Table>
          </TableContainer>
          : <Alert severity='info'>Please select machine</Alert>}
        </Paper>
      </Grid>
    </Grid>

    <Grid container spacing={1}>
      <Grid item xs={2}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10, overflowY:"scroll", maxHeight:450}}>
          <p>🧿 Machine Name</p>
          {appNameSelect?.machines?.map((item,key)=>
            <FormControlLabel
              checked={!!machineChecked[item]}
              style={{marginBottom: -5,width: '100%'}}
              key={key+"machines"}
              control={
                <Checkbox
                  onChange={handleChangeMachineChecked}
                  name={item}
                  color="primary"
                />
              }
              label={item}
            />
          )}
          {!appNameSelect && <Alert severity='info'>Empty Machine</Alert>}
        </Paper>
      </Grid>
    
      <Grid item xs={10}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10, display:'flex', flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{height:'auto',width:'100%',flex:'none',marginBottom:10,overflowY:"scroll", maxHeight:290}}>
              {cmdHistoryList.map((item,key)=>
                <p style={{marginBottom:5, color:item.status ? '#1a9c30' : "#dc1212"}}>{item.text}</p>
              )}
          </div>
          <div style={{display: 'flex', backgroundColor:"#EEE",justifyContent: 'space-between'}}>
            <div style={{flex:10,marginRight:5}}>
              <TextField
                // label="Command"
                fullWidth
                placeholder="Enter your command"
                inputRef={textFieldCmd}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <OfflineBoltIcon />
                    </InputAdornment>
                )}}
                disabled={isCmdLoading || !appNameSelect || !appNameSelect.app_name}
                onKeyPress={(event)=>{if(event.key === "Enter")onPostCmd()}}
              />
            </div>
            <div><Button variant='contained' disabled={isCmdLoading} onClick={onPostCmd}>{isCmdLoading ? <CircularProgress color='primary' size={20} /> :'Enter'}</Button></div>
          </div>
        </Paper>
        {toast.open &&
        <Snackbar anchorOrigin={{ vertical:'top', horizontal:'center' }} open={toast.open} autoHideDuration={5000} onClose={()=>setToast({msg:"",open:false,type:""})}>
          <Alert elevation={6} variant="filled" onClose={()=>setToast({msg:"",open:false,type:""})} severity={toast.type}>
            {toast.msg}
          </Alert>
        </Snackbar>
        }
      </Grid>
    </Grid>
  </>)
}

export default ASRSConsole