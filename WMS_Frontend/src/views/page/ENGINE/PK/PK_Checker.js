import React, { useState, useEffect, useContext } from "react";
import {
    apicall,
    createQueryString
  } from "../../../../components/function/CoreFunction";
  import AmPickingChecker from "../../../pageComponent/AmPickingChecker/AmPickingChecker";

  const Axios = new apicall();

  const PK_Checker =(props)=>{
    return (
        <div>
            <AmPickingChecker 
            
            />
        </div>
    )
  }
  export default PK_Checker;