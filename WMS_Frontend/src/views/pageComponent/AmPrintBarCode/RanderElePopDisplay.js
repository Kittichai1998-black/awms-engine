import React from "react";
import styled from "styled-components";

const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 0px 0px 0px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LabelH = {
  fontWeight: "bold",
  width: "100px"
};
const LabelDD = {
  fontWeight: "bold",
  width: "100px"
};
const LabelD = {
  width: "150px"
};
const LabelDQty = {
  width: "60px"
};
const DataGenerateElePopDisplay = (data) => {

  return data.map((pack, index) => {
    console.log(pack)
    return (<div key={index}>
      <FormInline>
        <label style={LabelH}>{"Code : "}</label>
        <label style={LabelD}>{pack.Code}</label>
        <label style={LabelDQty}>{pack.Quantity}</label>
        <label style={LabelDQty}>{pack.UnitType_Code}</label>
      </FormInline>
      {/* <FormInline>
        <label style={{ width: "250px" }}></label>
        <label style={LabelDQty}>{(pack.Volume * pack.BaseQuantity)}</label>
        <label style={LabelDQty}>{"Volume"}</label>
      </FormInline>
      <FormInline>
        <label style={{ width: "250px" }}></label>
        <label style={LabelDQty}>{pack.Volume}</label>
        <label style={LabelDQty}>{"Qty/Volume"}</label>
      </FormInline> */}


    </div>
    )
  });

}


export { DataGenerateElePopDisplay }