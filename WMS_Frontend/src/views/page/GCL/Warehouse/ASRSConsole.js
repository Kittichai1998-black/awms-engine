import React, { useState, useEffect, useRef, useMemo, } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TextField,TableRow,Snackbar,CircularProgress,Grid,FormControlLabel } from '@material-ui/core';
import {Button,IconButton, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment,Checkbox } from '@material-ui/core';
import {Alert, TreeView, TreeItem} from '@material-ui/lab';
import GCLService from '../../../../components/function/GCLService'
import {Sort,CloseSharp,BrightnessHigh,CheckCircleOutlineRounded,Save,ExpandMore, ChevronRight, Style, EmojiFoodBeverageOutlined} from '@material-ui/icons'
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import * as signalR from '@aspnet/signalr';
import "../../../../assets/css/TableCustom.css";
import Container from '@material-ui/core/Container';
import ViewListIcon from '@material-ui/icons/ViewList';
import { withStyles } from "@material-ui/core/styles";
import { object } from "prop-types";

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
  const [results, setResults] = useState("");
  // const [clear, setClear] = useState()
  const [open, setOpen] = React.useState(false);
  const [openadd,setOpenAdd] = React.useState(false);
  const textFieldCmd = useRef(null);

  const handleClickOpen = () => {
    setOpen(true);
    setResults("");
  };

  const handleClickadd = (event) => {
    setOpenAdd(true);
    setResults(event.target.textContent);
    console.log(event.target.textContent);
  }
  const handleCloseadd = () => {
    setOpenAdd(false);
  }
  const handleClose = () => {
    setOpen(false);
  };
  
  function createData(Comm,Name) {
    return { Comm,Name};
  }

  const rowsCommandSRM = [
    createData(1,'เริ่มทำงาน'),
    createData(2, 'กลับHome(เฉพาะSRM Inbound)'),
    createData(3, 'ทำงานคำสั่งล่าสุด'),
    createData(4, 'สลับทิศทางคำสั่งล่าสุด'),
    createData(5, 'อ่านข้อมูลPallet ID'),
    createData(7, 'ยกเลิกคำสั่งปัจจุบัน'),
    createData(8, 'Reset ระบบ'),
    createData(9, 'Clear Alarm (Status 100ขึ้นไป)'),
    createData(10, 'ไปตำแหน่งต้นทาง (Surwayแบบไม่ยื่นอาร์ม)'),
    createData(11, 'เริ่มทำงาน (ไม่สนใจBarcode)'),
  ];

  const rowCommandSHU = [
    createData(1,'เริ่มทำงาน'),                                createData(2, 'Home Inbound'),
    createData(3, 'ทำงานคำสั่งล่าสุด'),                         createData(7, 'ยกเลิกคำสั่งปัจจุบันของชัทเทิล'),
    createData(9, 'Clear Alarm (Status 100ขึ้นไป)'),          createData(12, 'Home Outbound'),
    createData(55, 'รับเข้าพาเลทจากInbound'),                 createData(56,'รับเข้าพาเลทจากOutbound'),
    createData(57, 'เบิกสินค้าไปยังStandby Inbound'),           createData(58, 'เบิกสินค้าไปยังStandby Outbound'),                  
    createData(60, 'ปิดการสั่งงาน(เบิก/รับเข้า)'),                createData(62,'ชัทเทิลวิ่งไปStandby Inbound'),        
    createData(63, 'จัดตำแหน่งพาเลทไปยังฝั่ง Inbound'),         createData(64, 'จัดตำแหน่งพาเลทไปยังฝั่ง Outbound'),          
    createData(72, 'ชัทเทิลวิ่งไปStandby Outbound'),            createData(90, 'หยุดชัทเทิลทันที'),                         
    createData(99, 'ยืนยันจบการทำงานให้ชัทเทิล'),

  ];
  const { classes } = props;
  const [souloc,setSouLoc]=useState("")
  const [desloc,setDesLoc]=useState("")
  const [unit,setUnit]=useState("")
  const [palletid,setPalletID]=useState("")
  const [weigh,setWeigh]=useState("")

  useEffect(() => {
    loadAppName()
  }, []);

  useEffect(() => {
    clearInterval(intervalGetSPReportAPI);
    let machinesString=""
    for (var key in machineChecked) {
      if (machineChecked.hasOwnProperty(key) && machineChecked[key]==true && appNameSelect.machines.indexOf(key)>=0)machinesString+=`${key},`;
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
  }, [machineChecked,appNameSelect]);

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

  const onChange = (event) => {
    setResults(event.target.value);
    setSouLoc(event.target.value);
    setDesLoc(event.target.value);
    setUnit(event.target.value);
    setPalletID(event.target.value);
    setWeigh(event.target.value);
  }

  const handleCellClick = (event) => {
    setResults(event.target.textContent);
    console.log(event.target.textContent);
  };

  const onPostCmd=()=>{
    if(!appNameSelect || !appNameSelect.app_name || !textFieldCmd.current.value) return;
    setIsCmdLoading(true)
    GCLService.post('/v2/WCS_Post_Command_Front',{app_name:appNameSelect.app_name, command:textFieldCmd.current.value}).then(res=>{
      setIsCmdLoading(false)
      textFieldCmd.current.focus()
      setCmdHistoryList([...cmdHistoryList,{app_name:appNameSelect.app_name, text:textFieldCmd.current.value, status:res.data._result.status}])
      textFieldCmd.current.value=""
      if(!res.data._result.status) {
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      setToast({msg:"Success",open:true,type:'success'})
    })
  }

  return (<>
  <Container maxWidth="xl">
    <Grid container spacing={1} style={{marginTop:10}}>
      <Grid item xs={2}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10}}>
          <p>🧿 App Name</p>
          {appNameList.map((item,key)=><Button key={key} variant={item.app_name==(appNameSelect?.app_name||'') ? 'contained' : 'text'} color='primary' fullWidth onClick={()=>{setAppNameSelect(item);}}>{item.app_name||''}</Button>)}
        </Paper>
      </Grid>
    
      <Grid item xs={10}>
        <Paper elevation={3} style={{width: '100%',height: 400, padding:10,overflowY:"scroll", maxHeight:400}}>
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
                  <TableCell style={{padding:"5px 10px",color: '#888'}}>Control</TableCell>
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
                    <TableCell>
                      <Button variant="contained"
                          color="primary"
                          size="medium"
                          onClick={()=>handleClickOpen(machine.machine)}
                          ><ViewListIcon></ViewListIcon></Button>
                    </TableCell>
                  </TableRow>
                )}                
              </TableBody>
            </Table>
          </TableContainer>
          : <Alert severity='info'>Please select machine</Alert>}
        </Paper>
        <Dialog open={open} onClose={handleClose} aria-labelledby="from-dialog-title" maxWidth='xl'>
          <DialogTitle id="alert-dialog-title"><center><b>{"Control Machine"}</b></center></DialogTitle>
            <DialogContent>
              <TableContainer className="tableCustom" cellSpacing={1}>
              
              <Table>
                <TableHead style={{backgroundColor:'#77ACF4'}}>
                  <TableRow>
                    <TableCell style={{padding:"5px 10px"}}>Machine&Command</TableCell>
                    <TableCell style={{padding:"5px 10px"}}><center>Name</center></TableCell>
                  </TableRow>
                </TableHead>
                
                
                {machinesList.map((machine,index) => {
                  const Item = machine.machine.slice(0,3);
                  
                  return (<TableBody style={{cursor:'pointer'}} key={index} variant="outlined">
                    {rowsCommandSRM.map((row,key) => {
                      const Command = row.Comm;
                    if(Item == "SRM" && Command == 1 ||Item == "SRM" && Command == 2 ||Item == "SRM" && Command == 10){
                      return(
                        <TableRow hover key={key} onClick={handleClose}>
                          <TableCell onClick={handleClickadd}>
                            {machine.machine}&nbsp;{row.Comm}
                          </TableCell>
                          <TableCell>
                            {row.Name}
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      return(
                        <TableRow hover key={key} onClick={handleClose}>
                          <TableCell onClick={handleCellClick}>
                            {machine.machine}&nbsp;{row.Comm}
                          </TableCell>
                          <TableCell>
                            {row.Name}
                          </TableCell>
                        </TableRow>
                      );
                    }
                      // console.log(Item)
                    }
                      )}
                      {rowCommandSHU.map((row,key) => {
                    if(Item == "SHU"){
                      return(
                        <TableRow hover key={key} onClick={handleClose}>
                          <TableCell onClick={handleClickadd}>
                            {machine.machine}&nbsp;{row.Comm}
                          </TableCell>
                          <TableCell>
                            {row.Name}
                          </TableCell>
                        </TableRow>
                      );
                      }
                      // console.log(Item)
                    }
                      )}
                      
                      </TableBody>
                    );
                    })}
                
              </Table>
            </TableContainer>
            </DialogContent>
          </Dialog>
          <Dialog open={openadd} onClose={handleCloseadd} aria-labelledby="form-dialog-title" maxWidth='lg'>
            <DialogTitle id="form-dialog-title"><center>Add Command</center></DialogTitle>
              <DialogContent>
                <DialogContentText>
                  ระหว่างคำสั่งที่ 1, 2, 10 จำเป็นต้องเซตคำสั่งเพิ่มเติม
                </DialogContentText>
                  <TextField type="text" margin="dense" value={results} style={{width:"150px",paddingRight: "20px",paddingTop:"16px"}} onChange={(event)=>setResults(event.target.value)}/>
                  <TextField type="text" margin="dense" label="Souloc" style={{width:"150px",paddingRight: "20px"}}  onChange={(event)=>setSouLoc(event.target.value)}/>
                  <TextField type="text" margin="dense" label="Desloc" style={{width:"150px",paddingRight: "20px"}}  onChange={(event)=>setDesLoc(event.target.value)}/>
                  <TextField type="text" margin="dense" label="Unit"   style={{width:"150px", paddingRight: "20px",}} onChange={(event)=>setUnit(event.target.value)}/>
                  <TextField type="text" margin="dense" label="Palletid"  style={{width:"150px",paddingRight: "20px"}} onChange={(event)=>setPalletID(event.target.value)}/>
                  <TextField type="text" margin="dense" label="Weigh" defaultValue="1500" style={{width:"150px", paddingRight: "20px"}} value={weigh} onChange={(event)=>setWeigh(event.target.value)}/>
              </DialogContent>
              <DialogActions>
                <Button onClick={onChange} color='#fff' style={{backgroundColor:'#2979ff'}}>
                  Submit
                </Button>
              </DialogActions>
          </Dialog>
      </Grid>
    </Grid>
                   
    <Grid container spacing={1} style={{marginTop:10}}>
      <Grid item xs={2}>
        <Paper elevation={3} style={{width: '100%',height: '100%', padding:10, overflowY:"scroll", maxHeight:270}}>
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
    
      <Grid item xs={10} style={{maxHeight:200, height:200}}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10, display:'flex', flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{height:'auto',width:'100%',flex:'none',marginBottom:10,overflowY:"scroll", maxHeight:120}}>
              {cmdHistoryList.map((item,key)=>
                <p style={{marginBottom:5, color:item.status ? '#1a9c30' : "#dc1212", cursor: 'pointer'}} onClick={()=>{textFieldCmd.current.value=item.text;textFieldCmd.current.focus();}} >{`${item.app_name}>> ${item.text}`}</p>
              )}
          </div>
          <div style={{display: 'flex', backgroundColor:"#EEE",justifyContent: 'space-between'}}>
            <div style={{flex:10,marginRight:5}}>
              <TextField
                // label="Command"
                value={results}
                fullWidth
                placeholder="Enter your command"
                inputRef={textFieldCmd}
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <OfflineBoltIcon />
                    </InputAdornment>
                    
                ),
                disableUnderline: true,
              }}
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
    </Container>
  </>)
}

export default ASRSConsole