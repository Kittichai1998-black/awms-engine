import React, { Component } from 'react';
import img from '../../img/Home.jpg'
class Dashboard extends Component{
  render(){
    return(
      
<div>
  <div class="Home-content">
    <div align="center"  className="Home-profile" style={{marginTop:"100px"}}>
    
        <img  src={img} height="400px"></img>
    </div>
  </div>
</div>
    )
  }
}

export default Dashboard;
