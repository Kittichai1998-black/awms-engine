import React, { useState, useEffect } from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import amIcon from './AmIconMenu';
import SvgIcon from '@material-ui/core/SvgIcon';


const   AmPopup = (props) => {
    const [open, setOpen] = useState(props.open);
    const [width, setWidth] = useState(props.width);
    const [height, setHeight] = useState(props.height);
    const [icon, setIcon] = useState(props.icon);
    const [colorIcon, setColorIcon] = useState(props.colorIcon);
    const [colorBlock, setColorBlock] = useState(props.colorBlock);
    const [content, setContent] = useState(props.content);
    const [typePopup, setTypePopup] = useState(props.typePopup);
    const [titlePopup, setTitlePopup] = useState(props.titlePopup);
    const [defaultTitlePopup, setDefaultTitlePopup] = useState("");
    //const [openPreview, setOpenPreview] = useState(props.openPreview);
    useEffect(()=>{
      
       if(typePopup === "success") {
        setDefaultTitlePopup("SUCCESS")
       }else if(typePopup === "error"){
        setDefaultTitlePopup("ERROR")
       }else if(typePopup === "warning"){
        setDefaultTitlePopup("WARNING")
       }else{
        setDefaultTitlePopup("")
       }
   
    },[])

    useEffect(()=>{
      if(props.open)
        setOpen(true)
      else{
        setOpen(false)
      }
      
    },[props.open])
    
    useEffect(()=>{
      setContent(props.content)
    },[props.content])     

        const handleClickOpen = () => {
            setOpen(true)
          };
        
        const handleClose = () => {
            props.closeState(false)
            setOpen(false)
          };
        
        function HomeIcon(type) {
            return (
              <SvgIcon style={{color:typePopup === "success"?(colorIcon?colorIcon:"#C5E1A5"):(colorIcon === "error"?(colorIcon?colorIcon:"#EF9A9A"):(colorIcon?colorIcon:"#FFF59D"))}} >
                <path d={type}/>
              </SvgIcon>
            );
        } 
    
          return ( 
             
            <MuiThemeProvider
            theme={
                createMuiTheme({
                    overrides: {   
                        MuiPaper: {
                            root:{
                                borderStyle:"solid",
                                borderColor:typePopup==="success"?(colorBlock?colorBlock:"#4CAF50"):(typePopup === "error"?(colorBlock?colorBlock:"#F44336"):(colorBlock?colorBlock:"#FFA726")),
                                border:"5px",
                                width:width?width:"500px",
                                height:height?height:null
                            },
                            rounded:{
                                borderRadius:"20px"
                            }
                      },
                     
                      MuiTypography:{
                        h6:{
                              fontWeight:"0px"
                          }
                      }               
                   },
                   
                      typography: {
                        useNextVariants: true,
                      },
                  })
            }
          >
            <div>
            {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
              Open alert dialog
            </Button> */}
            <Dialog             
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              
            >
            
              <DialogTitle id="alert-dialog-title" 
              
                style={{
                    padding:"15px 15px 15px",
                    backgroundColor:typePopup === "success"?(colorBlock?colorBlock:"#4CAF50"):(typePopup === "error"?(colorBlock?colorBlock:"#F44336"):(colorBlock?colorBlock:"#FFA726"))

                }} > 
               {HomeIcon(typePopup === "success"?amIcon[icon?icon:"Success"]:(typePopup === "error"?amIcon[icon?icon:"Error"]:amIcon[icon?icon:"Warning"]))}
                    {' '} 
               {titlePopup?titlePopup:defaultTitlePopup} 
                
              
              </DialogTitle>
              <DialogContent style={{padding:"20px"}} >
                <DialogContentText id="alert-dialog-description" >
                {content}
                </DialogContentText>
              </DialogContent>
              <DialogActions>               
                <Button onClick={handleClose} color="primary" autoFocus>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          </MuiThemeProvider>
         
          );
}

export default AmPopup;
