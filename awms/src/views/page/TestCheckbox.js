import React, { useState, useEffect, useContext } from "react";
import AmCheckbox from "../../components/AmCheckBox";
import AmRadio from "../../components/AmRadio";
import AmRadioGroup from "../../components/AmRadioGroup";

const TestCheckbox = () => {
  const [datacheckbox, setdatacheckbox] = useState();
  const [dataRadio, setdataRadio] = useState();
  const [dataRadiosGroup, setdataRadiosGroup] = useState();

  useEffect(() => {
    console.log(datacheckbox);
  }, [datacheckbox]);

  useEffect(() => {
    console.log(dataRadio);
  }, [dataRadio]);

  useEffect(() => {
    console.log(dataRadiosGroup);
  }, [dataRadiosGroup]);

  return (
    <div>
      <AmCheckbox
        value="checkbox1"
        label="chckbox1"
        onChange={(e, v) => setdatacheckbox(e)}
      />
      <AmCheckbox
        value="checkbox2"
        label="chckbox2"
        onChange={(e, v) => setdatacheckbox(e)}
      />
      <AmRadio value="Radio" label="Radio" onChange={e => setdataRadio(e)} />
      <div>RadioGroup</div>
      <AmRadioGroup
        value={[
          { value: "Radio1", label: "Radio1" },
          { value: "Radio2", label: "Radio2" }
        ]}
        onChange={e => setdataRadiosGroup(e)}
      />
    </div>
  );
};

export default TestCheckbox;
