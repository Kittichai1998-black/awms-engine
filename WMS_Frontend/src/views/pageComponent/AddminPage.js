import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
function ManualInput() {
  const [code, setCode] = useState("");
  const searchInput = useRef(null);
  useEffect(() => {
    searchInput.current.focus();  
  }, [])
  const addInput = () => {
      if(!code){
        searchInput.current.focus();  
      }
    // Axios.post("", {
    //   code: code,
    // }).then(() => {
    // });
  };
  return (
    <div className="App container">
      <div className="information">
        {/* <form action=""> */}
        <div className="mb-4">
          <label className="form-label" htmlFor="name">
           <h1>เลขที่ภาชนะ</h1>
          </label>
          <input
           ref={searchInput}
            type="text"
            className="form-control"
            placeholder="เลขที่ภาชนะ"
            onChange={(event) => {
                setCode(event.target.value);
            }}
          />
        </div>
        <button onClick={addInput} class="btn btn-success">
          Add Input
        </button>
        {/* </form> */}
      </div>
      <hr />
    </div>
  );
}

export default ManualInput;
