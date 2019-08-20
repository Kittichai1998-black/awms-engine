import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import { colors } from 'react-select/lib/theme';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { grey, red } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AsyncSelect from 'react-select/lib/Async';
import { apicall, createQueryString } from './function/CoreFunction'
import AmChipInput from './AmChipInput';

const Axios = new apicall()

const styles = theme => ({
    root: {
        width: 'auto', 
    },
    chipContainer: {
        display: 'flex',
        flexFlow: 'row wrap',
        cursor: 'text',
        marginBottom: -2,
        // minHeight: 40,
        marginTop: 10,
        minWidth: 400
    },

});
const selectStyles = (ddlMinWidth, ddlMaxWidth, zIndex) => {
    const shadow = 'hsla(218, 50%, 10%, 0.1)';
    return (
        {
            control: provided => ({
                ...provided,
                margin: 4,
            }),
            menu: provided => ({
                ...provided, borderRadius: '0 0 4px 4px', backgroundColor: 'white',
                margin: '4px 0 0 -4px', minWidth: ddlMinWidth, maxWidth: ddlMaxWidth,
                boxShadow: `0 0 0 1px ${shadow}, 0 4px 11px ${shadow}`
            }),
            menuList: base => ({ ...base, maxHeight: '150px' }),
            menuPortal: base => ({ ...base, zIndex: zIndex })
        })
};

const Dropdown = (props) => {
    const { children, isOpen, target, onClose, zIndex } = props;
    return (<div style={{ position: 'relative' }}>
        {target}
        {isOpen ? <Menu zindexval={zIndex}>{children}</Menu> : null}
        {isOpen ? <Blanket onClick={onClose} /> : null}
    </div>
    );
};

const Menu = props => {
    const shadow = 'hsla(218, 50%, 10%, 0.1)';
    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '4px 4px 0 0',
                boxShadow: `0 0 0 1px ${shadow}`,
                marginTop: 8,
                marginBottom: 0,
                position: 'absolute',
                zIndex: props.zindexval,
            }}
            {...props}
        />
    );
};
const Blanket = props => (
    <div
        style={{
            bottom: 0,
            left: 0,
            top: 0,
            right: 0,
            position: 'fixed',
            zIndex: 1,
        }}
        {...props}
    />
);

const Svg = p => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        focusable="false"
        role="presentation"
        {...p}
    />
);
const DropdownIndicator = () => (
    <div style={{ color: colors.neutral20, height: 24, width: 32 }}>
        <Svg>
            <path
                d="M16.436 15.085l3.94 4.01a1 1 0 0 1-1.425 1.402l-3.938-4.006a7.5 7.5 0 1 1 1.423-1.406zM10.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </Svg>
    </div>
);

const ChipInputs = withStyles(theme => ({
    iconCloseButton: {
        // display: 'none',
        marginTop: '-2px',
        padding: '0 0 2px 0',
        color: grey[400],
        fontSize: 18,
        '&:hover': {
            color: grey[800],
            cursor: 'pointer'
        },
    },
    iconButton: {
        padding: 4,
        marginBottom: 5
    },
    inputAdor: {
        position: 'absolute',
        float: 'right',
        top: 0,
        right: 0,
        justifyContent: 'middle',
        alignItems: 'baseline'
    },
    input: {
        // display: 'flex',
        // marginLeft: 0, //8
        // flex: 1,
        '&:hover': {
            cursor: 'pointer'
        },
        // width: '100%',
        // padding: '8px 0 5px'
    },
    required: {
        color: red[600]
    }
}))(props => {
    const { classes, id, placeholder, valueKey, onHandleClickClear,
        toggleOpen, onHandleDelete, disabled, required, width, ...other } = props;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}   >
            <AmChipInput
                id={id} readOnly={true}
                disabled={disabled}
                placeholder={placeholder}
                onFocus={disabled ? null : valueKey === null || valueKey.length === 0 ? null : (e) => e.target.blur()}
                onClick={disabled ? null : (e) => { e.cancelBubble = true; toggleOpen(); }}
                value={valueKey}
                onDelete={disabled ? null : (e) => onHandleDelete(e)}
                style={{ width: width }}
                // fullWidth
                InputProps={{
                    inputProps: {
                        className: classes.input,
                    },
                    endAdornment: (
                        <InputAdornment position="end" className={classes.inputAdor} >
                            {disabled ? null : valueKey === null || valueKey.length === 0 ? null :
                                <CloseIcon className={classes.iconCloseButton}
                                    style={{ zIndex: 900 }}
                                    size="small" aria-label="Close" onClick={onHandleClickClear} />
                            }
                            <IconButton className={classes.iconButton} disabled={disabled} size="small" aria-label="Search" onClick={toggleOpen}>
                                <ArrowDropDownIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),

                }}
                {...other}
            />
            {required ? <label className={classes.required}>*</label> : null}
        </div>
    );
});

const MultiDropdown = (props) => {
    const { id,
        disabled,
        required,
        classes,
        value,
        zIndex,
        defaultValue,
        returnDefaultValue,
        fieldDataKey,
        fieldLabel,
        labelPattern,
        data,
        queryApi,
        width,
        ddlMinWidth,
        ddlMaxWidth,
        onChange,
        placeholder } = props;
    const [isOpen, setOpen] = useState(false);
    const [valueData, setValueData] = useState([]);
    const [optionList, setOptionList] = useState([]);
    const [valueChips, setValueChips] = useState([]);
    const [defaultVal, setDefaultVal] = useState([]);
    const [upreturnDefaultValue, setReturnDefaultValue] = useState(returnDefaultValue);

    const toggleOpen = () => {
        setOpen(!isOpen)
    }
    const onSelectChange = (valueSel, e) => {
        // console.log(valueSel)
        setDefaultVal([])
        setReturnDefaultValue(false)
        setValueData(valueSel);
        var temp = [];
        var tempLabel = [];
        valueSel.forEach((value) => {
            temp.push(value.value);
            tempLabel.push(value.label);
        });
        setValueChips(tempLabel);

        onChange(temp, valueSel, id, fieldDataKey);
    };
    const onHandleClickClear = (e) => {
        setReturnDefaultValue(false)
        setValueData([]);
        setDefaultVal([])
        setValueChips([])
        onChange(null, null, id, fieldDataKey)
    }
    const onHandleDelete = (labelDel) => {
        var chipData = [...valueData];
        chipData.forEach((value, index) => {
            if (value.label === labelDel) {
                var chipToDelete = chipData.indexOf(chipData[index]);
                chipData.splice(chipToDelete, 1);
            }
        });
        var temp = [];
        var tempLabel = [];
        chipData.forEach((value, index) => {
            temp.push(value.value);
            tempLabel.push(value.label);
        });
        setReturnDefaultValue(false)
        setValueData(chipData);
        setValueChips(tempLabel);
        onChange(temp, chipData, id, fieldDataKey);
    }

    useEffect(() => {
        if (queryApi) {
            if (optionList === null || optionList === undefined) {
                // queryApi.l = 0;
                getData(createQueryString(queryApi))
            } else {
                if (optionList.length === 0) {
                    // queryApi.l = 0;
                    getData(createQueryString(queryApi))
                }
            }
        } else if (data) {
            var dataOptions = data;
            dataOptions.forEach(datas => {
                datas.value = datas[fieldDataKey]
                datas.label = getLabel(datas)
            });
            setOptionList(dataOptions)
        } else {
            setOptionList([])
        }
    }, [queryApi, data]);

    useEffect(() => {
        if (defaultValue) {
            setDefaultVal(defaultValue);
        }
    }, [defaultValue]);
    useEffect(() => {
        if (defaultVal.length > 0 && upreturnDefaultValue) {
            onChange(defaultVal, valueData, id, fieldDataKey);
        }
    }, [valueChips, valueData]);
    useEffect(() => {
        if (optionList) {
            if (optionList.length > 0) {
                if (value) {
                    getDefaultByValue(value);
                }
                else if (defaultVal) {
                    getDefaultByValue(defaultVal);
                }
            }
        }
    }, [optionList, value]);

    const getDefaultByValue = (valuekey) => {
        if (optionList.length > 0) {
            var arrayLabel = [];
            var dataoption = optionList;
            valuekey.forEach((val1) => {
                dataoption.forEach((val2) => {
                    if (String(val1) === String(val2[fieldDataKey])) {
                        arrayLabel.push({
                            ...val2,
                            value: val2[fieldDataKey],
                            label: getLabel(val2),
                        })
                    }
                })
            })
            // console.log(arrayLabel)
            setValueData(arrayLabel)
            var temp = [];
            arrayLabel.forEach((value) => {
                temp.push(value.label);
            });
            // console.log(temp)
            setValueChips(temp);
        }
    }
    async function getData(qryString) {
        try {
            const resData = await Axios.get(qryString).then(res => {
                if (res.data.datas) {
                    var dataOptions = res.data.datas;
                    dataOptions.forEach(datas => {
                        datas.value = datas[fieldDataKey]
                        datas.label = getLabel(datas)
                    });
                    return (dataOptions)
                }
            });
            setOptionList(resData)
        } catch (err) {
            setOptionList([])
        }
    }
    const getLabel = (datas) => {
        var str = "";
        if (fieldLabel) {
            if (labelPattern) {
                fieldLabel.forEach((value, index) => {
                    if (index === fieldLabel.length - 1) {
                        str = str.concat(datas[value])
                    } else {
                        str = str.concat(datas[value], labelPattern)
                    }
                })
            } else {
                fieldLabel.forEach((value) => {
                    str = str.concat(datas[value])
                })
            }
        }
        return str;
    }

    return (
        <div className={classNames(classes.root)}>
            <Dropdown
                isOpen={isOpen}
                onClose={toggleOpen}
                zIndex={zIndex}
                target={
                    <ChipInputs
                        id={id}
                        disabled={disabled}
                        width={width}
                        placeholder={placeholder}
                        toggleOpen={toggleOpen}
                        valueKey={valueChips}
                        onHandleClickClear={onHandleClickClear}
                        onHandleDelete={onHandleDelete}
                        required={required}
                    />
                }
            >
                <div style={{ width: width }}>
                    <ReactSelect
                        name={id}
                        autoFocus
                        backspaceRemovesValue={false}
                        components={{ DropdownIndicator, IndicatorSeparator: null }}
                        controlShouldRenderValue={false}
                        hideSelectedOptions={false}
                        isClearable={false}
                        menuIsOpen={isOpen}
                        onChange={onSelectChange}
                        options={optionList}
                        placeholder="Search..."
                        styles={selectStyles(ddlMinWidth, ddlMaxWidth, zIndex)}
                        tabSelectsValue={false}
                        value={valueData}
                        closeMenuOnSelect={false}
                        isMulti
                        maxMenuHeight={150}
                        menuPortalTarget={document.body}
                        // menuPosition={'fixed'}
                        menuPlacement={'auto'}
                    />
                </div>
            </Dropdown>
        </div >
    );
}
MultiDropdown.propTypes = {
    classes: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.array,
    defaultValue: PropTypes.array,
    queryApi: PropTypes.object,
    data: PropTypes.array,
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    ddlMinWidth: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    ddlMaxWidth: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    fieldDataKey: PropTypes.string.isRequired,
    labelPattern: PropTypes.string,
    fieldLabel: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    chipputRenderer: PropTypes.func,
    disabled: PropTypes.bool,
    returnDefaultValue: PropTypes.bool,
    zIndex: PropTypes.number
}
MultiDropdown.defaultProps = {
    fieldDataKey: "value",
    fieldLabel: ["label"],
    zIndex: 9999,
    ddlMinWidth: 'auto',
    ddlMaxWidth: 'auto',
    returnDefaultValue: false,
    width: 'auto'
}
export default withStyles(styles)(MultiDropdown);