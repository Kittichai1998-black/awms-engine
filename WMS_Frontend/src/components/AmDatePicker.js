import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CloseIcon from "@material-ui/icons/Close";
import InputAdornment from "@material-ui/core/InputAdornment";
import { grey, red } from "@material-ui/core/colors";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 'auto'
    },
    iconCloseButton: {
        // display: 'none',
        padding: 0,
        color: grey[400],
        fontSize: 16,
        "&:hover": {
            color: grey[800],
            cursor: "pointer"
        }
    },
    required: {
        color: red[600],
        fontSize: "18px"
    }
}));

export default function DateAndTimePickers(props) {
    const classes = useStyles();
    const {
        fieldID,
        TypeDate = "datetime-local",
        disabled,
        required,
        defaultValue,
        onChange,
        onBlur,
        setTimeZero,
        ...other
    } = props;
    const [value, setValue] = useState("");
    useEffect(() => {

        if (defaultValue) {
            let datetime = "";
            if (typeof defaultValue === "string") {
                datetime = defaultValue;
            } else {
                if (setTimeZero) {
                    if (TypeDate === "time") {
                        datetime = moment().format("00:00");
                    } else {
                        datetime = moment().format("YYYY-MM-DDT00:00");
                    }
                } else {

                    if (TypeDate === "time") {
                        datetime = moment().format("HH:mm");
                    } else if (TypeDate === "date") {
                        datetime = moment().format("YYYY-MM-DD");
                    } else if (TypeDate === "datetime-local") {
                        datetime = moment().format("YYYY-MM-DDTHH:mm");
                    } else {
                        datetime = ""
                    }
                }
            }
            setValue(datetime)
            let dataReturn = {
                fieldID: fieldID,
                fieldDataKey: datetime,
                fieldDataObject: datetime
            }

            if (!onBlur) {
                onChange(dataReturn)
            } else {
                onBlur(dataReturn)
            }

        } else {
            setValue("");
        }

    }, [defaultValue]);
    const handleDateonBlur = (e) => {
        if (e && e.target.value) {
            setValue(e.target.value);
            if (onBlur) {


                let newDate = getFormatDateTime(e.target.value);
                let dataReturn = {
                    fieldID: fieldID,
                    fieldDataKey: newDate,
                    fieldDataObject: newDate
                }
                console.log("onBlur")
                onBlur(dataReturn);
            }
        }
    };
    const handleDateonChange = (e) => {
        if (e && e.target.value) {
            setValue(e.target.value);
            if (onChange) {

                let newDate = getFormatDateTime(e.target.value);
                let dataReturn = {
                    fieldID: fieldID,
                    fieldDataKey: newDate,
                    fieldDataObject: newDate
                }
                console.log("onChange")
                onChange(dataReturn);
            }
        }
    };
    const getFormatDateTime = (val) => {
        if (val) {
            if (TypeDate === "time") {
                return moment(val).format("HH:mm");
            } else if (TypeDate === "date") {
                return moment(val).format("YYYY-MM-DD");
            } else if (TypeDate === "datetime-local") {
                return moment(val).format("YYYY-MM-DDTHH:mm:ss");
            } else {
                return ""
            }
        } else {
            if (TypeDate === "time") {
                return moment().format("HH:mm");
            } else if (TypeDate === "date") {
                return moment().format("YYYY-MM-DD");
            } else if (TypeDate === "datetime-local") {
                return moment().format("YYYY-MM-DDTHH:mm:ss");
            } else {
                return ""
            }
        }

    }
    const handleClear = () => {
        setValue("");
        let newDate = "";
        let dataReturn = {
            fieldID: fieldID,
            fieldDataKey: newDate,
            fieldDataObject: newDate
        }
        if (onBlur) {
            console.log(dataReturn)
            onBlur(dataReturn);
        } else {
            console.log(dataReturn)
            onChange(dataReturn);
        }
    }
    return (
        <form className={classes.container} noValidate>
            <TextField
                id={fieldID}
                type={TypeDate}
                disabled={disabled ? disabled : false}
                size={"small"}
                value={value}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CloseIcon
                                className={classes.iconCloseButton}
                                size="small"
                                aria-label="Close"
                                onClick={disabled ? null : handleClear}
                            />
                        </InputAdornment>
                    )
                }}
                onChange={handleDateonChange}
                onBlur={handleDateonBlur}
                {...other}
            />
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                }}
            >
                {required ? <label className={classes.required}>*</label> : null}
            </div>
        </form>
    );
}