import React, { Component } from 'react';
import img from '../../img/Home.jpg'
class Dashboard extends Component{
  componentDidMount(){
    var ff = document.getElementsByClassName("app-body")
    ff[0].style.background = "rgb(255,255,255)"

  }
  componentWillUnmount(){
    var ff = document.getElementsByClassName("app-body")
    ff[0].style.background = "none"

  }

  render(){

    return(
      
<div>
  <div className="Home-content">
    <div align="center"  className="Home-profile" style={{marginTop:"100px"}}>
    
        <img  src={img} height="400px"></img>
    </div>
  </div>
</div>
    )
  }
}

export default Dashboard;
