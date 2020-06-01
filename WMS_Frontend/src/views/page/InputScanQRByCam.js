import React, { useState, useEffect, useRef } from "react";
import AmScanQRByCam from "../../components/AmScanQRbyCamera";
import AmInput from "../../components/AmInput";
 
const ScanQRByCam = (props) => {

  const [result, setResult] = useState('');
   
  const showRes = data => {
    if (data) {
      console.log(data)
      let ele = document.getElementById("code");
            if (ele) {
              ele.value = data;
              ele.focus();
            }
      setResult(data)
    }
  }
  return (
    <div>
        <AmInput id="code" name="code" styleType="default" style={{ width: "330px" }} placeholder="code" type="input"  ></AmInput>

      <AmScanQRByCam
         returnResult={showRes}
      />
      
    </div>

  )

}

export default ScanQRByCam;
 