
import React from "react";
import Grid from '@material-ui/core/Grid';
import styled from "styled-components";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 5px 5px 0;
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
  width: "200px"
};
const LabelDD = {
  fontWeight: "bold",
  width: "100px"
};
const LabelD = {
  //width: "120px"
};
const DataGenerateElePopMove = (data) => {

  return <div> <Grid container spacing={3} >
    <Grid item xs={6} style={{ padding: "5px" }}>
      <FormInline>
        <Grid item xs={6} >
          <FormInline>
            <label style={LabelH}>{"Warehouse : "}</label>
          </FormInline>
        </Grid>
        <Grid item xs={6} >
          <FormInline>
            <label style={LabelD}>{data.Warehouse}</label>
          </FormInline>
        </Grid>
      </FormInline>
    </Grid>
    <Grid item xs={6} style={{ padding: "5px" }}>
      <FormInline>
        <Grid item xs={6} >
          <FormInline>
            <label style={LabelH}>{"Current Area : "}</label>
          </FormInline>
        </Grid>
        <Grid item xs={6} >
          <FormInline>
            <label style={LabelD}>{data.Area}</label>
          </FormInline>
        </Grid>
      </FormInline>
    </Grid>
  </Grid>
    {/* == */}
    <Grid container spacing={3}>
      <Grid item xs={6} style={{ padding: "5px" }}>
        <FormInline>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelH}>{"Pallet : "}</label>
            </FormInline>
          </Grid>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelD}>{data.Pallet}</label>
            </FormInline>
          </Grid>
        </FormInline>
      </Grid>
      <Grid item xs={6} style={{ padding: "5px" }}>
        <FormInline>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelH}>{"Current Location : "}</label>
            </FormInline>
          </Grid>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelD}>{data.Location}</label>
            </FormInline>
          </Grid>
        </FormInline>
      </Grid>
    </Grid>
    {/* == */}
    <Grid container spacing={3} >
      <Grid item xs={6} style={{ padding: "5px", paddingBottom: "10px" }}>
        <FormInline>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelH}>{"Status : "}</label>
            </FormInline>
          </Grid>
          <Grid item xs={6} >
            <FormInline>
              <label style={LabelD}>{getStatus(data.PackStatus)}</label>
            </FormInline>
          </Grid>
        </FormInline>
      </Grid>
    </Grid>
  </div>
}
const getStatus = value => {
  if (value === "RECEIVED") {
    return <AmStorageObjectStatus key={"RECEIVED"} statusCode={12} />;
  } else if (value === "AUDITED") {
    return <AmStorageObjectStatus key={"AUDITED"} statusCode={14} />;
  } else if (value === "COUNTED") {
    return <AmStorageObjectStatus key={"COUNTED"} statusCode={16} />;
  } else if (value === "CONSOLIDATED") {
    return <AmStorageObjectStatus key={"CONSOLIDATED"} statusCode={36} />;
  } else {
    return null;
  }
}

export { DataGenerateElePopMove }