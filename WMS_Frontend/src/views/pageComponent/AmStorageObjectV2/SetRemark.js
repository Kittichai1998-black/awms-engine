import styled from "styled-components";
import AmInput from "../../../components/AmInput";
import React from "react";
const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div``;
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
const columns = [
  {
    field: "Option",
    type: "input",
    name: "Remark",
    placeholder: "Remark",
    required: true
  }
];

const DataGenerateRemark = () => {

  return columns.map(y => {
    return {
      field: y.field,
      component: (data = null, cols, key) => {
        return (
          <div key={key}>
            {FuncTestSetEle(
              y.name,
              data,
              cols,
              y.placeholder,
            )}
          </div>
        );
      }
    };
  });
};
const FuncTestSetEle = (
  name,
  data,
  cols,
  placeholder,
) => {
  return (
    <FormInline>
      {" "}
      <LabelH>{name} : </LabelH>
      <InputDiv>
        <AmInput
          id={cols.field}
          style={{ width: "270px", margin: "0px" }}
          placeholder={placeholder}
          type="input"
          onChange={val => {
            onChangeEditor(val);
          }}
        />
      </InputDiv>
    </FormInline>
  );
};
const onChangeEditor = (value) => {

  //setRemark(value);
  console.log(value)
  return value;
};

export { DataGenerateRemark }