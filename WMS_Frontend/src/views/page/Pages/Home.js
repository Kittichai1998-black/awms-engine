import React from 'react';
import img from '../../../assets/logo/home.png'
import Assignment from "@material-ui/icons/Assignment";
import { apicall } from '../../../components/function/CoreFunction'
import IconButton from "@material-ui/core/IconButton";
import styled from 'styled-components'
const Axios = new apicall();
const Container = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    `;

const Home = (props) => {
  let Img = require('../../../assets/logo/home.png')
  let ContentImg;
  if (window.project === "ENGINE") { Img = require('../../../assets/logo/home.png'); ContentImg = <img src={Img} width="50%" style={{ marginTop: '5%' }}></img> }
  else if (window.project === "STA" || window.project === "STGT") { Img = require('../../../assets/logo/stalogo.png'); ContentImg = <img src={Img} width="35%" style={{ marginTop: '3%' }}></img> }
  else if (window.project === "MRK") { Img = require('../../../assets/logo/mrklogo-new.png'); ContentImg = <img src={Img} width="40%" style={{ marginTop: '5%' }}></img> }
  else if (window.project === "TAP") { Img = require('../../../assets/logo/taplogo.png'); ContentImg = <img src={Img} width="40%" style={{ marginTop: '5%' }}></img> }
  else if (window.project === "BOT") { Img = require('../../../assets/logo/botlogo.jpg'); ContentImg = <img src={Img} width="100%" style={{ marginTop: '5%' }}></img> }
  else { ContentImg = <img src={Img} width="50%" style={{ marginTop: '5%' }}></img> }

  const sentReport = () => {

    Axios.post(window.apipath + "/v2/stock_daily_report", []).then(res => {
      console.log(res)
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          // setDialogState({ type: "success", content: "Success", state: true })
          // if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
          //   getData(queryViewData)
        } else {
          // setDialogState({ type: "error", content: res.data._result.message, state: true })
          // if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
          //   getData(queryViewData)
        }
      }

    })
  }


  return (

    <Container>
      <div align="center">

        {ContentImg}
        <br />
        <IconButton
          size="Large"
          aria-label="info"
          style={{ marginLeft: "3px" }}
        >
          <Assignment
            size="Large"
            onClick={() => { sentReport() }}
          />
        </IconButton >
        <label style={{

          color: "#535c68",
          fontSize: "18px",
          textAlign: "center",
          marginTop: "10px"
        }}>
          รายงานประจำวัน</label>
      </div>
    </Container >

  );
}
export default Home;