import React, { useState, useEffect } from "react";

import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';


const RadioButton = (props) => {

    const [Data, setData] = useState({});

    useEffect(() => {
        console.log(Data)
        if (Data == undefined) {
        } else {
            grtData()

        }
    })

    const grtData = () => {
        props.onChange(Data)

    }

    return (
        <div>
            <FormControl component="fieldset">
                <FormLabel component="legend"></FormLabel>
                <FormControlLabel value={props.value} label={props.label} onChange={(e) => {
                    setData({ checked: e.target.checked,value: e.target.value })
                }} control={<Radio color="primary" />}  ></FormControlLabel>
            </FormControl>
        </div>

    );
}


export default RadioButton;
