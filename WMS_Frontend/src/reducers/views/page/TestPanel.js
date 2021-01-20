import React, { useState, useEffect, useRef } from "react";
import AmContentPanel from "../pageComponent/AmContentPanel";
import AmInput from "../../components/AmInput";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AmButton from "../../components/AmButton";
import cls from 'classnames';
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  position: {
    alignContent: 'left',
    // justifyContent: 'flex-end'
  },
  root2: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    justifyContent: 'flex-start'
  },
  root3: {
    padding: theme.spacing(0.5),

  }
}));
const ExpandMoreIcon = withStyles(theme => ({
  root: {
    padding: 4,
  },

}))(props => {
  const { classes, className, children, ...other } = props;
  return (
    <IconButton
      aria-label="ExpandMore"
      size="small"
      className={classes.root}
      {...other}
    >
      <MuiExpandMoreIcon size="small" className={classes.root} />
    </IconButton>
  )
});
const Content = (props) => {
  const classes = useStyles();

  const panelSummary = () => {
    return <Typography className={classes.heading}>General settings</Typography>
  }
  const panelDetails = () => {
    return <Typography>
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      Aliquam eget maximus est, id dignissim quam.
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      Aliquam eget maximus est, id dignissim quam.
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      Aliquam eget maximus est, id dignissim quam.
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      Aliquam eget maximus est, id dignissim quam.
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      Aliquam eget maximus est, id dignissim quam.
      Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
      The container is 100% in height. This content area needs to be as high as it,
      with its own overflow rule. We could make it 100% high, but then it would be
      too tall because there is a header above it. We know the header size, so we
      can make this content area calc(100% - 70px).
      The container is 100% in height. This content area needs to be as high as it,
      with its own overflow rule. We could make it 100% high, but then it would be
      too tall because there is a header above it. We know the header size, so we
      can make this content area calc(100% - 70px).
      The container is 100% in height. This content area needs to be as high as it,
      with its own overflow rule. We could make it 100% high, but then it would be
      too tall because there is a header above it. We know the header size, so we
      can make this content area calc(100% - 70px).
  </Typography>
  }
  const panelActions = () => {
    return <div>
      <AmButton
        styleType="confirm_clear" className="float-left"
      >OK</AmButton>
      <AmButton
        styleType="delete_clear" className="float-left"
      >Cancel</AmButton>
    </div>
  }
  const customContent = () => {
    return <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <Typography className={classes.heading}>General settingsss</Typography>
    </ExpansionPanelSummary>
  }

  const Contents = [
    {
      // expandIcon: <ExpandMoreIcon/>,
      panelName: 'Header',
      // panelProps: {   defaultExpanded: false, square: false },
      panelSummary: {
        content: panelSummary(),
        // panelSummaryProps: null
      },
      panelDetails: {
        content: panelDetails(),
        // panelDetailsProps: null
      },
      panelActions: {
        contentRight: <AmButton styleType="delete_clear" >Cancel</AmButton>,
        contentLeft: <AmButton styleType="confirm_clear">OK</AmButton>
      }
    }
    , {
      panelName: 'Header2',
      panelProps: {   defaultExpanded: false, square: true },
      panelSummary: { content: <Typography>xxxxx2</Typography> },
      panelDetails: { content: panelDetails() },
      panelActions: {
        contentNormal: panelActions(),
        // panelActionsProps: { className: cls(classes.root2, classes.root3) }
      },
    }
    , {
      panelName: 'Header3',
      panelProps: { defaultExpanded: false, square: true },
      // panelCustom:  customContent()//=> custom content
      panelSummary: { content: <Typography>xxxxx3</Typography> },
      panelDetails: { content: panelDetails() },
      panelActions: {
        contentNormal: panelActions(),
        // panelActionsProps: { className: cls(classes.root2, classes.root3) }
      },
    }
  ]
  return (
    <div>
      <AmContentPanel contents={Contents} />
    </div>

  )

}

export default Content;
