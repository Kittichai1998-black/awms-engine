import React from "react";
import styled from "styled-components";
import queryString from "query-string";
import Grid from '@material-ui/core/Grid';
import {
  apicall,
  createQueryString,
  Clone
} from "../../../components/function/CoreFunction";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
const LabelH2 = styled.label`
  font-weight: bold;
  width: 70px;
  paddingleft: 20px;
`;
const InputDiv = styled.div`

`;
const LabelH1 = styled.label`
font-weight: bold;
width: 100px;
paddingleft: 20px;
`;
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const DataGenerateEleDocDisplay = (dataDoc) => {
  return <Card>
    <CardContent>
      <div>
        <FormInline>
          <LabelH2>GR Doc :</LabelH2>
          {dataDoc.grCode}
        </FormInline>
        <FormInline>
          <LabelH2>PA Doc :</LabelH2>
          {dataDoc.putawayCode}
        </FormInline>
        {dataDoc.datas === null ? null : dataDoc.datas.map((x, index) => {
          return (
            <div key={index}>
              <FormInline>
                <LabelH2>Item :</LabelH2>
                {x.pstoCode}
              </FormInline>
              <FormInline>
                <LabelH2>Lot :</LabelH2>
                {x.lot}
              </FormInline>
              <FormInline>
                <LabelH2>Qty : </LabelH2>{x.addQty} {x.unitTypeCode}
              </FormInline>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
}
const DataGenerateEleManaulDisplay = (valueManual, columnsManual) => {
  return <Card>
    <CardContent>
      <div>

        {columnsManual === null ? null : columnsManual.map((x, index) => {
          return (
            <div key={index}>
              <FormInline>
                <LabelH1>{x.name + ":"}</LabelH1>
                <InputDiv>  {valueManual[x.field]}</InputDiv>
              </FormInline>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
}

export { DataGenerateEleDocDisplay, DataGenerateEleManaulDisplay }