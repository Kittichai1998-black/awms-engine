import React from 'react';
import img from '../../../assets/logo/home.png'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import Paper from '@material-ui/core/Paper';
const Container = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    `;

const Home = (props) => {
    let Img =require('../../../assets/logo/home.png')
    let ContentImg ;
    if (window.project === "ENGINE") { Img =require('../../../assets/logo/home.png');ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}
    else if (window.project === "STA" || window.project === "STGT") {Img =require('../../../assets/logo/stalogo.png'); ContentImg = <img src={Img} width="35%" style={{marginTop:'3%'}}></img>}
    else if (window.project === "MRK") {Img =require('../../../assets/logo/mrklogo-new.png');ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}
    else if (window.project === "TAP") {Img =require('../../../assets/logo/taplogo.png');ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}
    else {ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}

    return (
        
        <Container>
          <div align="center">
            {ContentImg}
            <Typography variant="h1" component="h1">{(window.project === "STGT" ?<h1>สาขาตรัง</h1>:'')} </Typography>
          </div> 
        </Container>
         
    );
}
export default Home;