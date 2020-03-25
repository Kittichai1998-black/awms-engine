import React, { useState, useEffect } from "react";
import AmWave from "../pageComponent/AmWaveManagement/AmWaveManagement";

const colWave = [
  {"accessor":"Code", "Header":"Code", "sortable":false, "width":200},
  {"accessor":"SKUMaster_Name", "Header":"Name", "sortable":false},
  {"accessor":"Quantity", "Header":"Qty", "sortable":false, "width":80},
  {"accessor":"UnitType_Name", "Header":"Unit", "sortable":false, "width":80},
];
const colDetail = [
  {"accessor":"Code", "Header":"CodeV2", "sortable":false, "width":200},
  {"accessor":"SKUMaster_Name", "HeaderV2":"Name", "sortable":false},
  {"accessor":"Quantity", "Header":"QtyV2", "sortable":false, "width":80},
  {"accessor":"UnitType_Name", "HeaderV2":"Unit", "sortable":false, "width":80},
];

const AmWaveManagement = () => {
  return <AmWave waveColumns={colWave} detailColumns={colDetail}/>
}

export default AmWaveManagement;