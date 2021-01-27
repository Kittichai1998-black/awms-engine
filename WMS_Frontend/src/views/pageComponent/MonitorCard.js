import React, { useState, useEffect ,useLayoutEffect} from "react";
import * as signalR from '@aspnet/signalr';
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import { red, green } from "@material-ui/core/colors";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import Fullscreen from "react-full-screen";
import Moment from "moment";
import styled from 'styled-components';
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import AmDropdown from '../../components/AmDropdown';
import { white } from "colorette";
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
  width: 50px;
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
const  styles = theme => ({
  avatar: {
    backgroundColor: red[500],
    paddingTop: "1px",
    paddingLeft: "1px",
  },
  color: {
    backgroundColor: white[400],
  },
  formControl: {
    //margin: theme.spacing(0),
    minWidth: 150,
    // marginBottom: 5,
    // marginTop: 5,
  },
});

// const useWindowWidth = () => {
//   const [width, setWidth] = useState(window.innerWidth);
//   const [height, setHeight] = useState(window.innerHeight);
//   const handleResize = () => {
//     setWidth(window.innerWidth);
//     setHeight(window.innerHeight);
//   };
//   useEffect(() => {
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   });

//   return { width, height };
// };


const MasterData = (props) => {
  const [date, setDate] = useState();
  const [data, setData] = useState([]);
  const [gridConfigs, setGridConfigs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const { width, height } = useWindowWidth();
  const [store, setStore] = useState(1);
  const { classes } = props;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const width_height = useWindowSize(isFullScreen);
    function useWindowSize(full) {
        
        useLayoutEffect(() => {
            function updateSize() {
                setSize({ width: window.innerWidth, height: window.innerHeight });
            }
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize)
        }, []);

        useEffect(() => {
            function updateSize() {
                setSize({ width: window.innerWidth, height: window.innerHeight });
            }
            updateSize();
        }, [full]);
        return size;
    }

    useEffect(() => {
        if (document.fullscreenElement === null && isFullScreen) {
            setIsFullScreen(false)
        }
    }, [document.fullscreenElement])

    function openFullscreen() {
      if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
          document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
          document.documentElement.msRequestFullscreen();
      }
  }

  function closeFullscreen() {
      if (window.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
          document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
          document.msExitFullscreen();
      }
  }

  const goFull = () => {
    setIsFullScreen(true);
    openFullscreen(); 
  };
  const goMin = () => {
    setIsFullScreen(false);
    closeFullscreen();
  
  };

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
                connection.on("WareHouse8", res => {
                    let list = JSON.parse(res);
                    console.log("xxxx",list)
                    setData([...list]); 
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

  },[localStorage.getItem('Lang')])

  useEffect(() => {
    if(data.length){
      let rowCut = [];
      for(let i = 0; i < data.length; i+=5){
        let sliceIt = data.slice(i,i+5)
        rowCut.push(sliceIt)
      }
      setGridConfigs(rowCut)
    } else {
      setGridConfigs([[
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "}],

        [{gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "},
        {gateCode:" ", allQty:" ", lot:"", qty:" "}]
      ]);
    }
  }, [data])


   useEffect(() => {
    setInterval(Timer, 1000);
    return () => clearInterval(Timer) 
  }, []);
 
  function Timer() {
    let start = new Date().getTime();
    let newDate1 = Moment(start).format("YYYY/MM/DD h:mm:ss");
    setDate(newDate1);
  }

  const HandleChange = (item) => {
    setStore(item.target.value);
    console.log("Age :>>>", store,data);
  };

  const onHandleDDLChange = (value) => {
    console.log(value)
    if (value === 3) {
        
    } else {
      
    }
};

const AreaMaster = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "AreaMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 20}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
};

  const SetGrid = () => {
    return gridConfigs.map((x, i) => {
      if (x.length) {
        return (
          <>
            <Grid container key={i}>
              {x.map((y, col) => {
                return (
                  <Grid item key={col}>
                    <Card
                      style={{
                        border: "2px solid powderblue",
                        paddingLeft: isFullScreen ? "10px" : "10px",
                        width: isFullScreen ? `${(size.width / 5) - 15}px` : "200px",
                        height: isFullScreen ? `${(size.height / 2) - 40}px` : "200px",
                      }}
                      className={classes.color}
                    >
                      <CardHeader
                        title={
                          <Typography variant="h4" align="center">
                            {y.gateCode}
                          </Typography>
                        }
                      />
                      <Typography>
                        SKU:{y.skuCode}
                      </Typography>
                      <Typography className="mb-5" >
                        LOT:{y.lot}
                      </Typography>
                      <Typography >                       
                        count:{y.qty ? y.qty + "/"+ y.allQty : ''}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        );
      }
    });
  };
  return (
    <>
    <div style={isFullScreen ? { overflow: "hidden", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 999999 } : {}}>
      {/* <Fullscreen
        enabled={isFullScreen}
        onChange={(isFull) => setIsFullScreen(isFull)}
      > */}
        <div
          style={
            isFullScreen
              ? {
                  backgroundColor: "#e4e7ea",
                  height: "100%",
                  width: "100%",
                  padding: "1em 1.8em 1.8em 2em",
                }
              : {}
          }
          className="fullscreen"
        >
          <Grid container>
            <Grid item xs={12} sm={6}>
              <h3>{date}</h3>
            </Grid>
            <Grid item xs={12} sm={2}>
              <h3>คลัง</h3>
              {/* <LabelH>{"คลัง"} : </LabelH> */}
            </Grid>
            <Grid item xs={12} sm={2}>
              
              <FormInline style={{ float: "right", marginRight: "50px", marginBottom: "20px" }}>
              {" "}
                <AmDropdown
                    id={"ID"}
                    placeholder={"กรุณาเลือกคลังสินค้า"}
                    fieldDataKey={"ID"}
                    fieldLabel={["Name"]}
                    labelPattern=" : "
                    width={200}
                    ddlMinWidth={200}
                    //returnDefaultValue={true}
                    //defaultValue={3}
                    zIndex={1000}
                    queryApi={AreaMaster}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value)}
                    disabled ={isFullScreen}
                />
              </FormInline>
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton
                style={{ marginLeft: 100, padding: 0 }}
                onClick={isFullScreen ? goMin : goFull}
              >
                {isFullScreen ? (
                  <FullscreenExitIcon fontSize="large" />
                ) : (
                  <FullscreenIcon fontSize="large" />
                )}
              </IconButton>
            </Grid>
          </Grid>
          <SetGrid />
        </div>
      </div>
      {/* </Fullscreen> */}
    </>
  );
};
export default  withStyles(styles)(MasterData);
