import React, { Component, useState, useEffect } from "react";
import SaveIcon from "@material-ui/icons/Launch";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import AmDialogConfirm from "../components/AmDialogConfirm";
import ViewList from '@material-ui/icons/ViewList';
import AmButton from "../components/AmButton";
import { withStyles } from '@material-ui/core/styles';

const GlobalBtnBaseCss = withStyles({
    '@global': {
        '.MuiButtonBase-root': {
            position: 'unset',
        },
        '.MuiLink-button': {
            position: 'unset',
        }
    },
})(() => null);
const AmRedirectInfo = props => {
    const { api, customApi, titleDialog, bodyDialog,
        textLink, type, customIcon, styleTypeBtn,
        startIcon, endIcon, textButton, appendIcon } = props;
    const [openDialogCon, setopenDialogCon] = useState(false);
    const PageDetail = () => {
        if (api) {
            window.open(api);
        } else if (customApi) {
            customApi()
        }
    };

    const handleClickOpenDialog = () => {
        setopenDialogCon(true);
    };
    return (
        <>
            <GlobalBtnBaseCss />
            {type === "link" ? (
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                        PageDetail();
                    }}
                >
                    {textLink}
                </Link>
            ) : type === "dialog" ? (
                <>
                    <IconButton
                        size="small"
                        aria-label="info"
                        onClick={handleClickOpenDialog}
                        style={{ marginLeft: "3px", position: 'relative' }}
                    >
                        <SaveIcon fontSize="small" style={{ color: "#1a237e" }} />
                    </IconButton>
                    <AmDialogConfirm
                        titleDialog={titleDialog}
                        open={openDialogCon}
                        close={a => setopenDialogCon(a)}
                        bodyDialog={bodyDialog}
                        textCancel="Close"
                    />
                </>
            ) : type === "customdialog" ? (
                <>
                    <IconButton
                        size="small"
                        aria-label="info"
                        onClick={handleClickOpenDialog}
                                style={{ marginLeft: "3px",  position: 'relative' }}
                    >
                        {customIcon}
                    </IconButton>
                    <AmDialogConfirm
                        titleDialog={titleDialog}
                        open={openDialogCon}
                        close={a => setopenDialogCon(a)}
                        bodyDialog={bodyDialog}
                        textCancel="Close"
                        styleDialog={{ padding: "5px 15px" }}
                        styleDialogTitle={{ padding: "4px" }}
                    />
                </>
            ) : type === "custom_button_dialog" ? (
                <>
                    <AmButton
                        styleType={styleTypeBtn ? styleTypeBtn : 'default'}
                        onClick={handleClickOpenDialog}
                                    style={{ marginLeft: "3px", lineHeight: 1.5, position: 'relative'  }}
                        startIcon={startIcon}
                        endIcon={endIcon}
                        append={appendIcon}
                    >
                        {textButton}
                    </AmButton>
                    <AmDialogConfirm
                        titleDialog={titleDialog}
                        open={openDialogCon}
                        close={a => setopenDialogCon(a)}
                        bodyDialog={bodyDialog}
                        textCancel="Close"
                    />
                </>
            ) : type === "custom_icon" ? (
                <IconButton
                    size="small"
                    aria-label="info"
                    onClick={PageDetail}
                                    style={{ marginLeft: "3px", position: 'relative'  }}
                >
                    {customIcon}
                </IconButton>
            ) : (
                                    <IconButton
                                        size="small"
                                        aria-label="info"
                                        onClick={PageDetail}
                                        style={{ marginLeft: "3px", position: 'relative'  }}
                                    >
                                        <SaveIcon fontSize="small" style={{ color: "#1a237e" }} />
                                    </IconButton>
                                )}
        </>
    );
};

export default AmRedirectInfo;
