import React from "react";
import styled from "styled-components";
import queryString from "query-string";
import Grid from '@material-ui/core/Grid';
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
const LabelHtemName = {
  fontWeight: "bold",
  width: "100px"
};
const LabelDQty = {
  width: "50px"
};
const LabelDPallet = {
  width: "120px"
};
const LabelHPallet = {
  fontWeight: "bold",
  width: "80px"
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
  const DataGenerateElePalletListItemDisplay = () => {
    if (data != undefined && data.listsCodeDisplay !== undefined) {
      return data.listsCodeDisplay.map((pt, index) => {
        var qryStr = queryString.parse(pt.options);

        var itemName_list = qryStr.codeNo.split(',');
        var qtyReceived_list = qryStr.qty.split(',');
        var unit = qryStr.unit.split(',');
        return <><Grid item xs={4} >
          <FormInline style={{ width: "150px" }}>
            <label style={LabelPallet}>{"Tag No. : "}</label>
            <label style={LabelPalletNo}>{qryStr.palletNo}</label>
          </FormInline>
        </Grid>
          <Grid item xs={4} >
            <label style={LabelDPallet}> {itemName_list.map(ele => <>{ele}<br /></>)}</label>
          </Grid>
          <Grid item xs={4} >
            <FormInline style={{ width: "150px" }}>
              <label style={LabelDQty}> {qtyReceived_list.map(ele => <>{ele}<br /></>)}</label>
              <label style={LabelDQty}> {unit.map(ele => <>{ele}<br /></>)}</label>
            </FormInline>
          </Grid>
        </>

      });
    }
  }
  return <Grid container spacing={0} style={{ width: "500px" }}>{DataGenerateElePalletListItemDisplay()}</Grid>
}


export { DataGenerateElePalletListDisplay }