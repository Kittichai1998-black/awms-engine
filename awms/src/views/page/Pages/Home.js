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
    if (window.project === "ENGINE") { Img =require('../../../assets/logo/home.png')}
    else if (window.project === "STA") {Img =require('../../../assets/logo/stalogo.png')}
    else if (window.project === "MRK") {Img =require('../../../assets/logo/mrklogo-new.png')}
    else if (window.project === "TAP") {Img =require('../../../assets/logo/taplogo.png')}
   
    return (
        <Container>
                    <img src={Img} width="40%" style={{marginTop:'5%'}}></img>
        </Container>
    );
}
export default Home;