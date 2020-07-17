import React from "react";
import styled from "styled-components";
import queryString from "query-string";
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
const LabelDPallet = {
  width: "120px"
};
const LabelHPallet = {
  fontWeight: "bold",
  width: "100px"
};
const LabelPallet = {
  fontWeight: "bold",
  width: "80px"
};
const LabelPalletNo = {
  fontWeight: "bold",
  width: "50px"
};
const DataGenerateElePalletListDisplay = (data) => {
  // console.log(data.listsCode)
  if (data.listsCode !== undefined) {
    return data.listsCode.map((pt, index) => {
      var qryStr = queryString.parse(pt.options);
      return (<div key={index}>
        <FormInline>
          <label style={LabelPallet}>{"Pallet No. : "}</label>
          <label style={LabelPalletNo}>{qryStr.palletNo}</label>
          <label style={LabelHPallet}>{"Item Name : "}</label>
          <label style={LabelDPallet}>{qryStr.itemName}</label>
          <label style={LabelHPallet}>{"Volume : "}</label>
          <label style={LabelDPallet}>{qryStr.qtyReceived}</label>
        </FormInline>
      </div>
      )
    });
  }
}


export { DataGenerateElePalletListDisplay }