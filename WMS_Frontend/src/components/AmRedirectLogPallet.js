import React, { Component, useState, useEffect } from "react";
import SaveIcon from "@material-ui/icons/Dns";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import AmDialogConfirm from "./AmDialogConfirm";
import AmToolTip from "./AmToolTip";

const AmRedirectLogPallet = props => {
  const { api, titleDialog, bodyDialog, textLink, type, title } = props;
  const [openDialogCon, setopenDialogCon] = useState(false);
  const PageDetail = () => {
    if (api) {
      window.open(api);
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
          <AmToolTip title={title} placement={"top"}>
            <IconButton
              size="small"
              aria-label="info"
              onClick={handleClickOpenDialog}
              style={{ marginLeft: "3px" }}
            >
              <SaveIcon fontSize="small" style={{ color: "#4E342E" }} />
            </IconButton>
            <AmDialogConfirm
              titleDialog={titleDialog}
              open={openDialogCon}
              close={a => setopenDialogCon(a)}
              bodyDialog={bodyDialog}
              textCancel="Close"
            />
          </AmToolTip>
        </div>
      ) : (
            <AmToolTip title={title} placement={"top"}>
              <IconButton
                size="small"
                aria-label="info"
                onClick={PageDetail}
                style={{ marginLeft: "3px" }}
              >
                <SaveIcon fontSize="small" style={{ color: "#4E342E" }} />
              </IconButton>
            </AmToolTip>
          )}
    </div>
  );
};

export default AmRedirectLogPallet;
