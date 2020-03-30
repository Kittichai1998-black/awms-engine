import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSelect, { components } from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import { colors } from 'react-select/lib/theme';
import AmInput from "./AmInput";
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { grey, red } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AsyncSelect from 'react-select/lib/Async';
import { apicall, createQueryString } from './function/CoreFunction2'
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

const Axios = new apicall();

const styles = theme => ({
    root: {
        // width: 'auto',
    },
    // input: {
    //     display: 'flex',
    //     // padding: '7px 0 6px',
    // },
    input2: {
        display: 'flex',
        // padding: '5px 8px',
        '&:hover': {
            cursor: 'pointer'
        },
    },
    valueContainer: {
        // display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
    },
    noOptionsMessage: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 0,
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.38)',
    },
    placeholderDisabled: {
        position: 'absolute',
        left: 0,
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.18)',
    },
    iconCloseButton: {
        display: 'none',
        padding: 0,
        color: red[500]
    },
    required: {
        color: red[600]
    }
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
            menuPortal: base => ({ ...base, zIndex: zIndex })
        })
};

const Dropdown = (props) => {
    const { children, isOpen, target, onClose, zIndex, ddlMinWidth, ddlMaxWidth } = props;
    return (<div style={{ position: 'relative' }}>
        {target}
        {isOpen ? <Menu zindexval={zIndex} ddlminwidth={ddlMinWidth} ddlmaxwidth={ddlMaxWidth}>{children}</Menu> : null}
        {isOpen ? <Blanket onClick={onClose} /> : null}
    </div>
    );
};

const Menu = props => {
    const shadow = 'hsla(218, 50%, 10%, 0.1)';
    return (
        <div
            style={{
                minWidth: props.ddlminwidth,
                maxWidth: props.ddlmaxwidth,
                backgroundColor: 'white',
                borderRadius: '4px 4px 0 0',
                boxShadow: `0 0 0 1px ${shadow}`,
                marginTop: 8,
                marginBottom: 0,
                // padding: '1px 0px',
                // position: 'relative',
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
const DropdownSearch = () => (
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

const DropDownInputs = withStyles(theme => ({
    iconCloseButton: {
        // display: 'none',
        padding: 0,
        color: grey[400],
        fontSize: 16,
        '&:hover': {
            color: grey[800],
            cursor: 'pointer'
        },
    },
    input: {
        display: 'flex',
        marginLeft: 0, //8
        flex: 1,
        '&:hover': {
            cursor: 'pointer'
        },
        width: '100%',
        // padding: '8px 0 5px'
    },
    iconButton: {
        padding: 4,
    },
    required: {
        color: red[600],
    }
}))(props => {
    const { classes, id, placeholder, styleType, valueKey, onHandleClickClear,
        toggleOpen, onHandleDelete, disabled, required, width, ...other } = props;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }} >
            <AmInput
                //fullWidth 
                id={id} readOnly={true} autoComplete="off"
                disabled={disabled}
                required={required}
                placeholder={placeholder} value={valueKey}
                style={{ width: width }}
                styleType={styleType}
                // className={classes.input}
                onFocus={disabled ? null : valueKey ? null : (val, obj, element, event) => element.blur()}
                onClick={disabled ? null : (val, obj, ele, event) => {
                    event.cancelBubble = true;
                    toggleOpen();
                }}
                InputProps={{
                    inputProps: {
                        className: classes.input,
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            {disabled ? null : valueKey ?
                                <CloseIcon className={classes.iconCloseButton}
                                    style={{ zIndex: 900 }}
                                    size="small" aria-label="Close" onClick={onHandleClickClear} />
                                : null}
                            <IconButton className={classes.iconButton} disabled={disabled} size="small" aria-label="Search" onClick={toggleOpen}>
                                <ArrowDropDownIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                {...other}
            />
        </div>
    );
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AmInput
                fullWidth
                styleType={props.selectProps.styleType}
                disabled={props.isDisabled}
                required={props.selectProps.required}
                InputProps={{
                    inputComponent,
                    inputProps: {
                        className: props.selectProps.classes.input2,
                        inputRef: props.innerRef,
                        children: props.children,
                        ...props.innerProps,
                    },
                }}
                {...props.selectProps.textFieldProps}
            />
        </div>
    );
}
function Placeholder(props) {
    return (
        <Typography
            // color="textSecondary"
            className={props.isDisabled ? props.selectProps.classes.placeholderDisabled : props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

const DropdownIndicator1 = withStyles(theme => ({
    root: {
        marginTop: 2,
        marginBottom: 2
    },
    iconButton: {
        padding: 4,
    },
}))(props => {
    const { classes, ...other } = props;
    return (
        // <components.DropdownIndicator {...other}>
        <div className={classes.root} >
            <IconButton className={classes.iconButton} size="small" aria-label="select">
                <ArrowDropDownIcon fontSize="small" />
            </IconButton>
        </div>
        // </components.DropdownIndicator>
    );
});

const CustomClearText = withStyles(theme => ({
    iconCloseButton: {
        color: grey[400],
        fontSize: 16,
        '&:hover': {
            color: grey[800],
            cursor: 'pointer'
        },
    },
}))(props => {
    return (
        <CloseIcon className={props.classes.iconCloseButton} size="small" aria-label="Close" />
    )
});
const ClearIndicator = (props) => {
    const { children = <CustomClearText />, getStyles, innerProps: { ref, ...restInnerProps } } = props;
    return (
        <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
            {/* <div style={{ padding: '0px 0px', display: 'inline-block' }}> */}
            {children}
            {/* </div> */}
        </div>
    );
};
const MenuCustom = props => {
    // const { children, getStyles, innerProps: { ref, ...restInnerProps } } = props;
    // return (
    //     <div {...restInnerProps} ref={ref} style={getStyles('menu', props)}>
    //         {children}
    //     </div>
    // );
};

const componentNormal = {
    Control,
    Placeholder,
    SingleValue,
    // Menu: MenuCustom,
    ValueContainer,
    NoOptionsMessage,
    DropdownIndicator: DropdownIndicator1,
    ClearIndicator,
    IndicatorSeparator: null
};
const componentSearch = {
    DropdownIndicator: DropdownSearch,
    IndicatorSeparator: null
};
const DropdownComponent = (props) => {
    const {
        id,
        disabled,
        required,
        classes,
        theme,
        zIndex,
        placeholder,
        styleType,
        value,
        defaultValue,
        returnDefaultValue,
        fieldDataKey,
        queryApi,
        data,
        width,
        ddlMinWidth,
        ddlMaxWidth,
        fieldLabel,
        labelPattern,
        onChange,
        ddlType } = props;
    const [isOpen, setOpen] = useState(false);
    const [valueData, setValueData] = useState(null);
    const [optionList, setOptionList] = useState([]);
    const [valueKey, setValueKey] = useState("");
    const [defaultVal, setDefaultVal] = useState(null);
    const [upreturnDefaultValue, setReturnDefaultValue] = useState(returnDefaultValue);

    const toggleOpen = () => {
        setOpen(!isOpen)
    }
    const onSelectChange = (e) => {
        setOpen(!isOpen)
        if (e) {
            setReturnDefaultValue(false)
            setDefaultVal(null);
            setValueData(e);
            getValueKey(e);
            onChange(e.value, e, id, fieldDataKey);
        } else {
            setReturnDefaultValue(false)
            setValueData(null);
            setDefaultVal(null);
            setValueKey("");
            onChange(null, null, id, fieldDataKey)
        }
    };
    const onHandleClickClear = (e) => {
        setReturnDefaultValue(false)
        setValueData(null);
        setDefaultVal(null);
        setValueKey("");
        onChange(null, null, id, fieldDataKey)
    }

    useEffect(() => {
        if (queryApi) {
            if (optionList === null || optionList === undefined) {
                // queryApi.l = 0;
                getData(createQueryString(queryApi));
            } else {
                if (optionList.length === 0) {
                    // queryApi.l = 0;
                    getData(createQueryString(queryApi));
                }
            }
        } else if (data) {
            //console.log(data)
            var dataOptions = data;
            dataOptions.forEach(datas => {
                datas.value = datas[fieldDataKey];
                datas.label = getLabel(datas);
            });
            setOptionList(dataOptions);
            if (data.length === 0) {
                if (defaultValue && returnDefaultValue) {
                    setReturnDefaultValue(false)
                    setValueData(null);
                    setDefaultVal(null);
                    setValueKey("");
                    onChange(null, null, id, fieldDataKey)
                }
            } else {
                setValueData(null);
                if (defaultValue && returnDefaultValue) {
                    setReturnDefaultValue(true)
                    setDefaultVal(defaultValue);

                }
            }

        } else {
            setOptionList([]);
        }
    }, [queryApi, data]);

    useEffect(() => {
        // console.log(defaultValue)
        if (defaultValue) {
            setDefaultVal(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        if (defaultVal && upreturnDefaultValue) {
            if (valueData) {
                onChange(defaultVal, valueData, id, fieldDataKey);
            } else {
                onChange(null, null, id, fieldDataKey);
            }
        }
    }, [valueKey, valueData]);
    useEffect(() => {
        // console.log(value)
        setValueData(value)

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

    function getValueKey(showValueData) {
        let str = "";
        if (!isEmpty(showValueData)) {
            if (fieldLabel) {
                if (labelPattern) {
                    fieldLabel.forEach((value, index) => {
                        if (index === fieldLabel.length - 1) {
                            str = str.concat(showValueData[value]);
                        } else {
                            str = str.concat(showValueData[value], labelPattern);
                        }
                    })

                } else {
                    fieldLabel.forEach((value) => {
                        str = str.concat(showValueData[value]);
                    })
                }

            }
        }
        // console.log(str)
        setValueKey(str);
    }

    async function getData(qryString) {
        try {
            const resData = await Axios.get(qryString).then(res => {
                if (res.data.datas) {
                    var dataOptions = res.data.datas;
                    dataOptions.forEach(datas => {
                        datas.value = datas[fieldDataKey];
                        datas.label = getLabel(datas);
                    });
                    return (dataOptions);
                }
            });
            setOptionList(resData);
        } catch (err) {
            setOptionList([]);
        }
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    const getDefaultByValue = (value) => {
        if (optionList.length > 0) {
            let valuearray = null;
            var dataoption = optionList;
            dataoption.forEach((val, index) => {

                if (String(value) === String(val[fieldDataKey])) {
                    valuearray = ({
                        ...val,
                        value: val[fieldDataKey],
                        label: getLabel(val),
                    })
                }
            })
            setValueData(valuearray);
            getValueKey(valuearray);
        }
    }
    const getLabel = (datas) => {
        var str = "";
        if (fieldLabel) {
            if (labelPattern) {
                fieldLabel.forEach((value, index) => {
                    if (index === fieldLabel.length - 1) {
                        str = str.concat(datas[value]);
                    } else {
                        str = str.concat(datas[value], labelPattern);
                    }
                })
            } else {
                fieldLabel.forEach((value) => {
                    str = str.concat(datas[value]);
                })
            }
        }
        return str;
    }

    const selectStyles2 = (zIndex) => {
        return (
            {
                input: (base) => ({
                    ...base,
                    color: theme.palette.text.primary,//rgba(0, 0, 0, 0.87)
                    '& input': {
                        font: 'inherit',
                    },
                }),
                clearIndicator: (base, state) => ({
                    ...base,
                    padding: '2px 0 0 0',
                }),
                menuPortal: base => ({ ...base, zIndex: zIndex })
            })
    };
    return (
        <>
            <div className={classes.root} >

                {ddlType === "search" ?
                    <Dropdown
                        isOpen={isOpen}
                        onClose={toggleOpen}
                        zIndex={zIndex}
                        ddlMinWidth={ddlMinWidth}
                        ddlMaxWidth={ddlMaxWidth}
                        target={
                            <DropDownInputs
                                id={id}
                                disabled={disabled}
                                styleType={styleType}
                                placeholder={placeholder}
                                toggleOpen={toggleOpen}
                                valueKey={valueKey}
                                width={width}
                                onHandleClickClear={onHandleClickClear}
                                required={required}
                            />
                        }
                    >
                        <div style={{ width: width }}>
                            <ReactSelect
                                autoFocus
                                name={id}
                                backspaceRemovesValue={false}
                                components={componentSearch}
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
                                menuPortalTarget={document.body}
                                maxMenuHeight={150}
                                // menuPosition={'fixed'}
                                menuPlacement={'auto'}
                            />
                        </div>
                    </Dropdown>
                    : ddlType === "normal" ?
                        <div style={{ width: width }}>
                            <NoSsr>
                                <ReactSelect
                                    name={id}
                                    styleType={styleType}
                                    value={valueData}
                                    isDisabled={disabled ? true : false}
                                    required={required}
                                    classes={classes}
                                    options={optionList}
                                    styles={selectStyles2(zIndex)}
                                    components={componentNormal}
                                    onChange={onSelectChange}
                                    placeholder={placeholder}
                                    isClearable
                                    maxMenuHeight={150}
                                    menuPortalTarget={document.body}
                                    // menuPosition={'fixed'} 
                                    menuPlacement={'auto'}
                                />
                            </NoSsr>
                        </div>
                        : null
                }
            </div>

        </>
    );
}
DropdownComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    // id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    data: PropTypes.array,
    queryApi: PropTypes.object,
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
    ddlType: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    zIndex: PropTypes.number,
    returnDefaultValue: PropTypes.bool,
}
DropdownComponent.defaultProps = {
    fieldDataKey: "value",
    fieldLabel: ["label"],
    ddlType: "normal",
    zIndex: 9999,
    ddlMinWidth: 'auto',
    ddlMaxWidth: 'auto',
    width: 'auto',
    returnDefaultValue: false
}
export default withStyles(styles, { withTheme: true })(DropdownComponent);