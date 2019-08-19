
import React, { useState, useEffect, useContext, Component } from "react";
import Fullscreen from "react-full-screen";
import AmInput from '../../../../components/AmInput'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components'
import Paper from "@material-ui/core/Paper";
import AmDropdown from "../../../../components/AmDropdown"
import AmCheckbox from '../../../../components/AmCheckBox'
import AmTable from '../../../../components/table/AmTable';
import AmButton from '../../../../components/AmButton'
import { apicall, createQueryString } from '../../../../components/function/CoreFunction2'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Flash from 'react-reveal/Flash';
import AmDialogs from '../../../../components/AmDialogs'
import logo from '../../../../assets/logo/logo.png'
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Flip from 'react-reveal/Flip';
import Divider from '@material-ui/core/Divider';


import { get } from "http";
import color from "@material-ui/core/colors/green";
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


const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return { width, height };
};

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
const Scanbarcode = (props) => {
  const { classes, location, history } = props;
  const [dataDDL, setdataDDL] = useState({});
  const [valueText, setValueText] = useState({});
  const [databar, setdatabar] = useState({});
  const [valueBarcode, setvalueBarcode] = useState();
  const [datas, setdatas] = useState({});
  const [gate, setGate] = useState();
  const [datacarton, setdatacarton] = useState();
  const [productCode, setproductCode] = useState();
  const [productName, setproductName] = useState();
  const [qty, setqty] = useState(0);
  const [qtyMax, setqtyMax] = useState(0);
  const [isFull, setisFull] = useState();
  const [areaGate, setareaGate] = useState();
  const [carton, setcarton] = useState();
  const [pallet, setpallet] = useState();
  const [orderNo, setorderNo] = useState();
  const [unitCode, setunitCode] = useState('PC');
  const [OpenError, setOpenError] = useState(false);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [calHeight, setCalHeight] = useState(0.25);
  const { width, height } = useWindowWidth();


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
    setdataDDL({
      ...valueText, [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey,

      }
    });
    let Area = value
    var databars = { ...databar }
    databars.areaID = Area
    setdatabar(databars)
  }

  useEffect(() => {
    if (databar.scanCode)
      if (databar.scanCode.length === 26)
        Scanbar()

    if (databar.areaID) {
      const queryEdit = AreaLocationMaster;
      queryEdit.q = '[{ "f": "AreaMaster_ID", "c":"=", "v": ' + databar.areaID + '}]';
      Axios.get(createQueryString(queryEdit)).then((res) => {

        setGate(res.data.datas)
      })
    }
  }, [databar])

  const Scanbar = () => {

    Axios.post(window.apipath + '/v2/ScanMapBaseReceiveAPI', databar).then((res) => {

      if (res.data._result.status = 1) {

        if (res.data.bsto != null) {

          setpallet(res.data.bsto.code)
          setareaGate(res.data.areaLocationID)
          var datass = res.data.bsto.mapstos[0]
          var dataQtyMax = res.data.bsto.objectSizeMaps[0]
          setproductCode(datass.code)
          setproductName(datass.name)
          setorderNo(datass.orderNo)
          setunitCode(datass.unitCode)
          setcarton(datass.options.split("=")[1].split("&")[0])

          if (datass.qty == null) {
            setqty(0)
          } else { setqty(datass.qty) }
          if (dataQtyMax.maxQuantity == null) {
            setqtyMax(0)
          } else {
            setqtyMax(dataQtyMax.maxQuantity)

          }
          if (datass.qty != null && dataQtyMax.maxQuantity != null) {

            var qtyIn = parseFloat(datass.qty)
            var qtyMaxIn = parseFloat(dataQtyMax.maxQuantity)

            var calQty = qtyMaxIn - qtyIn

            if (calQty < qtyMaxIn) {
              var MsgError = "Recive" + calQty + " is Empty";
              setMsgDialog(MsgError);
              setTypeDialog("success");
              setStateDialog(true);
            }
            else if (calQty == qtyMaxIn) {
              var MsgErrors = "Empty"
              setMsgDialog(MsgErrors);
              setTypeDialog("success");
              setStateDialog(true);
            } else {

            }

          }
        } else {

          setMsgDialog(res.data._result.message);
          setTypeDialog("error");
          setStateDialog(true);
        }


      } else {
        setMsgDialog(res.data._result.message);
        setTypeDialog("error");
        setStateDialog(true);
      }

    })


  }

  const goFull = () => {
    setIsFullScreen(true);
    setCalHeight(0.2);
  }
  const goMin = () => {
    setIsFullScreen(false);
    setCalHeight(0.25);
  }


  const closeFull = () => {
    setisFull(false)
  }



  const HeadGateA = (getGate) => {
    return <CardContent style={{ height: "60px", background: "#e91e63" }} >
      <Grid container spacing={12}>
        <Grid item xs={5}></Grid> <Grid item xs={4}>
          <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">  {getGate}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  }

  const HeadGateB = (getGate) => {
    return <CardContent style={{ height: "60px", background: "#3f51b5" }} >
      <Grid container spacing={12}>
        <Grid item xs={5}></Grid> <Grid item xs={4}>
          <Typography style={{ color: "#ffffff" }} variant="h4" component="h3">{getGate}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  }

  const FullScreens = () => {
    setisFull(true)
  }

  return (
    <Fullscreen
      enabled={isFullScreen}
      onChange={isFull => setIsFullScreen(isFull)}
    >
      <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: height, width: width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">
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
        <AmDialogs typePopup={typeDialog} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
        <div>

          <Grid container spacing={24}>
            <Grid item xs={12} style={{ paddingLeft: "350px", paddingTop: "10px" }}>
              <div style={{ paddingTop: "30px" }}>
                <FormInline>
                  <Typography variant="h4" component="h3">Barcode : </Typography>
                  <AmInput style={{ width: "300px" }}
                    autoFocus={true} value={valueBarcode}
                    onChange={(value) => {
                      let bar = value
                      var databarcode = { ...databar }
                      databarcode.scanCode = bar
                      //setdatabar(databarcode)
                      if (value.length !== 26) {

                        setMsgDialog("Barcode Invalid");
                        setTypeDialog("error");
                        setStateDialog(true);

                      } else { setdatabar(databarcode) }

                    }}>
                  </AmInput></FormInline></div>
            </Grid>
            <Grid item xs={6}>
              <div style={{ paddingTop: "30px" }} >
                <FormInline>
                  <Typography style={{ paddingLeft: "120px" }} variant="h4" component="h3">Area : </Typography>
                  <div style={{ marginRight:"10px" }}>
                    <AmDropdown
                      id="area"
                      placeholder="Select"
                      fieldDataKey="ID" //���촴Column ���ç�Ѻtable �db 
                      fieldLabel={["Code", "Name"]}
                      labelPattern=" : " //�ѭ�ѡɳ����ͧ��â�������ҧ����
                      width={300} //��˹��������ҧ�ͧ��ͧ input
                      ddlMinWidth={300} //��˹��������ҧ�ͧ���ͧ dropdown
                      valueData={valueText} //��� value ������͡
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
                  <Typography style={{ paddingLeft: "120px" }} variant="h4" component="h3">Time : </Typography>
                </FormInline>
              </div>
            </Grid>


            <Grid item xs={6} >
              <div style={{ paddingTop: "30px", marginRight: "5px" }}>
                <Card>
                  <div>
                    {gate != undefined ? areaGate === gate[0].ID ? <Flash>{HeadGateA(gate ? gate[0].Code : "")}</Flash> : <div>{HeadGateB(gate ? gate[0].Code : "")}</div> :
                      <div>{HeadGateB(gate ? gate[0].Code : "")}</div>}
                  </div>
                  <Card style={{ height: "500px" }}>
                    {gate != undefined ? areaGate === gate[0].ID ? < div > <Flash> <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
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
                          <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Orderno :</Typography >
                          <Typography variant="h5" component="h3">{orderNo}</Typography>
                        </FormInline>
                        <FormInline style={{ paddingTop: "10px" }}>
                          <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Carton :</Typography >
                          <Typography variant="h5" component="h3">{carton}</Typography>
                        </FormInline>
                      </Grid></Grid>
                      <Border style={{ paddingRight: "80px" }} >
                        <FormInline style={{ paddingTop: "10px" }}>
                          <Typography variant="h5" component="h3">Qty :</Typography >
                          <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax}</Typography>
                          <Typography style={{ paddingLeft: "50px" }} variant="h5" component="h3">{unitCode}</Typography>

                        </FormInline>
                      </Border>
                    </Card></Flash></div> : null : null}

                  </Card>
                </Card>
              </div>
            </Grid>


            <Grid item xs={6}>
              <div style={{ paddingTop: "30px", marginLeft: "5px" }}>
                <Card >
                  <div>
                    {gate != undefined ? areaGate === gate[1].ID ? <Flash>{HeadGateA(gate ? gate[1].Code : "")}</Flash> : <div>{HeadGateB(gate ? gate[1].Code : "")}</div> :
                      <div>{HeadGateB(gate ? gate[1].Code : "")}</div>}
                  </div>
                </Card>
                <Card style={{ height: "500px" }} >
                  {gate != undefined ? areaGate === gate[1].ID ? <div > <Flash> <Card style={{ height: "500px" }}><Grid container spacing={12} style={{ paddingTop: "10px" }} >
                    <Grid item xs={1}></Grid><Grid item xs={11}>
                      <FormInline style={{ paddingTop: "10px" }} >
                        <Typography style={{ paddingRight: "10px", }} variant="h5" component="h3">Pallet :</Typography >
                        <Typography>{pallet}</Typography>
                      </FormInline>
                      <FormInline style={{ paddingTop: "10px" }}>
                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Product :</Typography >
                        <Typography>{productCode}</Typography>
                      </FormInline>
                      <FormInline style={{ paddingTop: "10px" }}>
                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Orderno :</Typography >
                        <Typography>{orderNo}</Typography>
                      </FormInline>
                      <FormInline style={{ paddingTop: "10px" }}>
                        <Typography style={{ paddingRight: "10px" }} variant="h5" component="h3">Carton :</Typography >
                        <Typography>{carton}</Typography>
                      </FormInline>

                    </Grid></Grid>
                    <Border style={{ paddingRight: "80px" }} >
                      <FormInline style={{ paddingTop: "10px" }}>
                        <Typography variant="h5" component="h3">Qty :</Typography >
                        <Typography variant="h5" component="h3"> {qty === 0 ? "-" : qty} / {qtyMax === 0 ? "-" : qtyMax}</Typography>
                        <Typography style={{ paddingLeft: "50px" }} variant="h5" component="h3">{unitCode}</Typography>

                      </FormInline>
                    </Border>
                  </Card></Flash></div> : null : null}
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
