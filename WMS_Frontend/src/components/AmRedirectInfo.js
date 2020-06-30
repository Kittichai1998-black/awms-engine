import React, { Component, useState, useEffect } from "react";
import SaveIcon from "@material-ui/icons/Help";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import AmDialogConfirm from "../components/AmDialogConfirm";
import ViewList from '@material-ui/icons/ViewList';
import AmButton from "../components/AmButton";

const AmRedirectInfo = props => {
  const { api, customApi, titleDialog, bodyDialog,
    textLink, type, customIcon, styleTypeBtn,
    startIcon, endIcon, textButton, appendIcon } = props;
  const [openDialogCon, setopenDialogCon] = useState(false);
  const PageDetail = () => {
    if (api) {
      window.open(api);
    }else if (customApi){
      customApi()
    }
  };

  const handleClickOpenDialog = () => {
    setopenDialogCon(true);
  };
  return (
    <div>
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
        <div>
          <IconButton
            size="small"
            aria-label="info"
            onClick={handleClickOpenDialog}
            style={{ marginLeft: "3px" }}
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
        </div>
      ) : type === "customdialog" ? (
        <div>
          <IconButton
            size="small"
            aria-label="info"
            onClick={handleClickOpenDialog}
            style={{ marginLeft: "3px" }}
          >
            {customIcon}
          </IconButton>
          <AmDialogConfirm
            titleDialog={titleDialog}
            open={openDialogCon}
            close={a => setopenDialogCon(a)}
            bodyDialog={bodyDialog}
            textCancel="Close"
          />
        </div>
      ) : type === "custom_button_dialog" ? (
        <div>
          <AmButton
            styleType={styleTypeBtn ? styleTypeBtn : 'default'}
            onClick={handleClickOpenDialog}
            style={{ marginLeft: "3px", lineHeight: 1.5 }}
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
        </div>
      ) : type === "custom_icon" ? (
        <IconButton
          size="small"
          aria-label="info"
          onClick={PageDetail}
          style={{ marginLeft: "3px" }}
        >
          {customIcon}
        </IconButton>
      ) : (
                  <IconButton
                    size="small"
                    aria-label="info"
                    onClick={PageDetail}
                    style={{ marginLeft: "3px" }}
                  >
                    <SaveIcon fontSize="small" style={{ color: "#1a237e" }} />
                  </IconButton>
                )}
    </div>
  );
};

export default AmRedirectInfo;
