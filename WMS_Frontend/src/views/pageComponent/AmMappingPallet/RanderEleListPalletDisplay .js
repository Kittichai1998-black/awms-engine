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
const Axios = new apicall();
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
  console.log(data)
  return null;
  // let postdata = {
  //   processType: data.processType,
  //   bstoCode: data.PalletCode,
  //   warehouseID: data.warehouseID,
  //   areaID: data.areaID,
  //   locationID: null,
  //   pstos: []
  // };
  // Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
  //   if (res.data.bsto !== undefined) {
  //     console.log(res.data.bsto);
  //     return <LabelH>Doc. No. :</LabelH>
  //   }
  // })
  //   return (<div>
  //     <Card>
  //       <CardContent>
  //         <div>
  //           <FormInline>
  //             <LabelH>Doc. No. :</LabelH>
  //             {res.data.bsto.code}
  //           </FormInline>
  //         </div>
  //       </CardContent>
  //     </Card>

  //   </div>
  //   )
  // }
  // return res.data.bsto.map((list, index) => {
  //   return (<div>
  //     <Card
  //       key={index}
  //     >
  //       <CardContent>
  //         <div>
  //           <FormInline>
  //             <LabelH>Doc. No. :</LabelH>
  //             {list.code}
  //           </FormInline>
  //         </div>
  //       </CardContent>
  //     </Card>

  //   </div>
  //   )
  // })
  //})
  return <LabelH>Doc. No. :</LabelH>
  //return null;
}

export { DataGenerateElePalletListDisplay }