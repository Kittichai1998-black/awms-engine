import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState, useEffect, useContext } from "react";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";
import amIcon from "./AmIconMenu";
import SvgIcon from "@material-ui/core/SvgIcon";
import AmPopup from "./AmPopup";

const styles = theme => ({
  close: {
    padding: theme.spacing(0.5)
  }
});

const AmDialogs = props => {
  const [type, setType] = useState(props.typePopup);
  const [icon, setIcon] = useState(props.icon);
  const [colorBlock, setColorBlock] = useState(props.colorBlock);
  const [width, setWidth] = useState(props.width);
  const [height, setHeight] = useState(props.height);
  const [colorIcon, setColorIcon] = useState(props.colorIcon);
  const [message, setMessage] = useState(props.content);
  const [open, setOpen] = useState(false);
  const [sentOpen, setSentOpen] = useState(props.open);
  const [queue, setQueue] = useState(false);
  const [messageInfo, setMessageInfo] = useState("");
  const [preview, setPreview] = useState(false);
  const [timeOut, setTimeOut] = useState(props.timeOut);

  useEffect(() => {
    setMessage(props.content);
    // console.log(props.content)
  }, [props.content]);

  // useEffect(() => {
  //     handleClick(message)
  // },[]);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  // const handleClick =  (message) => {

  //     setMessageInfo(message)
  //     // processQueue();

  // };

  // const processQueue = () => {

  //     setOpen(sentOpen)
  // };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    props.onAccept(false);
  };

  const handle = () => {
    setPreview(true);
  };

  function HomeIcon(icon) {
    return (
      <SvgIcon style={{ marginRight: "10px" }}>
        <path
          style={{
            color:
              type === "success"
                ? colorIcon
                  ? colorIcon
                  : "#A5D6A7"
                : type === "error"
                ? colorIcon
                  ? colorIcon
                  : "#EF9A9A"
                : colorIcon
                ? colorIcon
                : "#FFCC80"
          }}
          d={icon}
        />
      </SvgIcon>
    );
  }
  return (
    <MuiThemeProvider
      theme={createMuiTheme({
        overrides: {
          MuiSnackbarContent: {
            message: {
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden"
            },
            root: {
              flexWrap: "nowrap",
              backgroundColor:
                type === "success"
                  ? colorBlock
                    ? colorBlock
                    : "#2E7D32"
                  : type === "error"
                  ? colorBlock
                    ? colorBlock
                    : "#C62828"
                  : colorBlock
                  ? colorBlock
                  : "#EF6C00",
              opacity: 0.8,
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingInlineStart: "10px",
              paddingRight: "10px",
              width: width ? width : null,
              height: height ? height : null
            }
          },
          MuiIconButton: {
            root: {
              padding: "0px",
              paddingRight: "5px"
            }
          }
        },

        typography: {
          useNextVariants: true
        }
      })}
    >
      <div>
        {/* <Button onClick={(e) => handleClick("sss")}>Show message A</Button> 
        <Button onClick={(e) => handleClick("ssssssssssssccccccccccccccccccccccccccccccccccccccccccccccccccccdddddddddddddddddddddddddddddddddddddddddddddddddddd")}>Show message B</Button> */}

        {
          <AmPopup
            content={message}
            typePopup={type}
            open={preview}
            closeState={e => setPreview(e)}
          />
        }

        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          open={open}
          autoHideDuration={timeOut ? timeOut : 2000}
          onClose={handleClose}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          message={
            <div
              style={{
                display: "inline",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "inline", float: "left" }}>
                {" "}
                {HomeIcon(
                  type === "success"
                    ? amIcon[icon ? icon : "Success"]
                    : type === "error"
                    ? amIcon[icon ? icon : "Error"]
                    : amIcon[icon ? icon : "Warning"]
                )}
              </div>
              {message}
            </div>
          }
          action={[
            <IconButton
              key="preview"
              aria-label="Close"
              color="inherit"
              onClick={handle}
            >
              {HomeIcon(amIcon["Preview"])}
            </IconButton>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
    </MuiThemeProvider>
  );
};

export default withStyles(styles)(AmDialogs);
