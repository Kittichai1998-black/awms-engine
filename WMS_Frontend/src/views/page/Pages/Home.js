import React from 'react';
import img from '../../../assets/logo/home.png'
import styled from 'styled-components'


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
    else if (window.project === "STA") {Img =require('../../../assets/logo/stalogo.png'); ContentImg = <img src={Img} width="60%" style={{marginTop:'-5%'}}></img>}
    else if (window.project === "MRK") {Img =require('../../../assets/logo/mrklogo-new.png');ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}
    else if (window.project === "TAP") {Img =require('../../../assets/logo/taplogo.png');ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}
    else {ContentImg = <img src={Img} width="40%" style={{marginTop:'5%'}}></img>}

    return (
        <Container>
          {ContentImg}
        </Container>
    );
}
export default Home;