import React from 'react';
import img from '../../../assets/logo/home.png'
import styled from 'styled-components'
import Assignment from "@material-ui/icons/Assignment";
import IconButton from "@material-ui/core/IconButton";
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

  return (

    <Container>
      <IconButton
        size="small"
        aria-label="info"
        style={{ padding: "0px" }}
      >
        <Assignment
          fontSize="small"
          style={{ color: "#e74c3c" }}
        // onClick={() => { onClickDeletePallet(listDatas[indexName], listDatas, indexName) }}
        />
      </IconButton>
      <div align="center">

        {ContentImg}

      </div>
    </Container>

  );
}
export default Home;