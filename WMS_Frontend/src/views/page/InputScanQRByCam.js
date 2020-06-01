import React, { useState, useEffect, useRef } from "react";
import ReactiveQR from "reactive-qr";

function App() {
  return (
    <div>
    <ReactiveQR onCode={code => console.log(code)} />
    </div>
  );
}
 
export default App;
