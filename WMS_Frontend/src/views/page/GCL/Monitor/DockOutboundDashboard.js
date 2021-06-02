import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Card ,CardHeader ,CardContent ,Snackbar,CircularProgress,Grid } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment,Select,MenuItem,InputLabel } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import GCLService from '../../../../components/function/GCLService'
import {AddCircleOutpne,CloseSharp,BrightnessHigh,Extension,Save} from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    bgColor1:{
        backgroundColor:'#FFF'
    },
    bgColor2:{
        backgroundColor:'#AED6F1'
    },
    bgColor3:{
        backgroundColor:'#F5B7B1'
    }
}));

const warehousepst=["W01","W02","W03","W04","W05","W06","W07","W08"]

let intervalGetSPReportAPI=null
const DockOutboundDashboard=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingdataTable, setIsLoadingdataTable] = useState(true);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [warehouse,setWarehouse]=useState("W01")

  useEffect(() => {
    setIsLoadingdataTable(true)
    clearInterval(intervalGetSPReportAPI);
    GCLService.get('/v2/GetSPReportAPI',{spname:'Dock_Outbound_Dashboard',warehouse:warehouse}).then(res=>{
        setIsLoadingdataTable(false)
        if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.DockOutboundDashboard)
        if(!res.data._result.status) {
            setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
            return ;
        }
        setDataTable(res.data.datas)
        //auto load data
        intervalGetSPReportAPI=setInterval(()=>{
            GCLService.get('/v2/GetSPReportAPI',{spname:'Dock_Outbound_Dashboard',warehouse:warehouse}).then(res=>{
                if(!res.data._result.status) {
                    setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
                    return ;
                }
                setDataTable(res.data.datas)
            })
        },5000)
    })
    //on component unmount
    return () => {
        clearInterval(intervalGetSPReportAPI);
    }
  }, [warehouse])

  return (
    <Paper elevation={0} style={{width: '100%',height:'100%', padding:10}}>
        {/* <InputLabel id="demo-simple-select-label">Warehouse</InputLabel> */}
        <center>
        <Select 
          labepd="demo-simple-select-label"
          id="demo-simple-select"
          value={warehouse}
          onChange={(event)=>{setWarehouse(event.target.value)}}
          style={{minWidth:150}}
        >
            <MenuItem value="" disabled>- Warehouse -</MenuItem>
            {warehousepst.map((value,key)=><MenuItem key={key} value={value}>{ value }</MenuItem>)}
        </Select>
        </center>
        <Grid style={{marginTop:20}}>
            <Grid container justify="left" spacing={2}>
                {!isLoadingdataTable&& dataTable.map((dataItem,key) => (
                    <Grid key={key} item style={{width:'19%'}}>
                        {/* <Paper elevation={3} className={classes.paper}/> */}
                        <Card elevation={3} style={{width: '100%'}} className={dataItem.bg_color==2 ? classes.bgColor2 : (dataItem.bg_color==3 ? classes.bgColor3 : classes.bgColor1)}>
                            <CardHeader title={<h5 style={{fontWeight: 'bold',margin:0,fontSize:'1.2em'}}>{dataItem.head}</h5>} style={{borderBottom:'1px dashed #999', padding:'8px 10px'}}/>
                            <CardContent style={{padding:8,fontSize:'2em'}}>
                                {/* <ul style={{padding:0}}> */}
                                    <p style ={{fontSize:'0.6em'}}><b>{dataItem.title}</b></p>
                                    <p style ={{fontSize:'0.6em'}}>{dataItem.detail1}</p>
                                    <p style ={{fontSize:'0.6em'}}>{dataItem.detail2}</p>   
                                    <p style ={{fontSize:'0.6em'}}>{dataItem.detail3}</p>                             
                                  
                                {/* </ul> */}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                
                {(!isLoadingdataTable && dataTable.length<=0) && <Grid xs={8} item><Alert severity='info'>Empty Data</Alert></Grid>}
                {isLoadingdataTable && <Grid xs={8} item style={{backgroundColor:'rgb(232, 244, 253)'}}><center><CircularProgress color='inherit' size={30}/></center></Grid>}
            </Grid>
        </Grid>
    
        {toast.open &&
        <Snackbar anchorOrigin={{ vertical:'top', horizontal:'center' }} open={toast.open} autoHideDuration={5000} onClose={()=>setToast({msg:"",open:false,type:""})}>
            <Alert elevation={6} variant="filled" onClose={()=>setToast({msg:"",open:false,type:""})} severity={toast.type}>
            {toast.msg}
            </Alert>
        </Snackbar>
        }
    </Paper>
  )
}

export default DockOutboundDashboard