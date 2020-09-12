import React from "react";
import PropTypes from "prop-types";
import { fade, makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import MailIcon from "@material-ui/icons/Mail";
import DeleteIcon from "@material-ui/icons/Delete";
import Label from "@material-ui/icons/Label";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import InfoIcon from "@material-ui/icons/Info";
import ForumIcon from "@material-ui/icons/Forum";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import SvgIcon from '@material-ui/core/SvgIcon';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    "&:hover > $content": {
      backgroundColor: theme.palette.action.hover
    },
    "&:focus > $content, &$selected > $content": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: "var(--tree-view-color)"
    },
    "&:focus > $content $label, &:hover > $content $label, &$selected > $content $label": {
      backgroundColor: "transparent"
    }
  },
  content: {
    color: theme.palette.text.primary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular
    }
  },
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 5,
    paddingLeft: 5,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    // "& $content": {
    //   paddingLeft: theme.spacing(2)
    // }
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: "inherit",
    color: "inherit"
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 0)
  },
  labelIcon: {
    marginRight: theme.spacing(1)
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1
  },
  labelTextRoot: {
    fontWeight: "bold",
    fontSize: 16,
    flexGrow: 1
  },
  labelInfo: {
    fontWeight: "bold",
  }
}));

function TransitionComponent(props) {
  const style = useSpring({
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};
function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    nodeId,
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      nodeId={nodeId}
      TransitionComponent={TransitionComponent}
      label={
        <div className={classes.labelRoot}>
          {LabelIcon !== undefined ?
            <LabelIcon color="inherit" className={classes.labelIcon} /> : null}
          {typeof labelText === "string" ?
            <Typography variant="body2" className={nodeId === "root" ? classes.labelTextRoot : classes.labelText} noWrap>
              {labelText}
            </Typography>
            : labelText}
          <Typography variant="body2" color="inherit" className={classes.labelInfo}>
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType,
  labelInfo: PropTypes.string,
  labelText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]),
};

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}
function Pallet(props) {
  return (
    <SvgIcon {...props} id="bold" enableBackground="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
      {/* tslint:disable-next-line: max-line-length */}
      <path d="m23.25 24h-4c-.414 0-.75-.336-.75-.75v-1.25h-3v1.25c0 .414-.336.75-.75.75h-5.5c-.414 0-.75-.336-.75-.75v-1.25h-3v1.25c0 .414-.336.75-.75.75h-4c-.414 0-.75-.336-.75-.75v-3.25h24v3.25c0 .414-.336.75-.75.75z" /><path d="m16 0h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" /><path d="m10 10h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" /><path d="m22 10h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" />
    </SvgIcon>
  );
}

const useStyles = makeStyles({
  root: {
    minHeight: 100,
    flexGrow: 1,
    maxWidth: 400
  }
});

export default function AmTreeView(props) {
  const classes = useStyles();
  const {
    dataTreeItems,
    defaultExpanded
  } = props;

  function ListTreeItems(row, i) {
    return <StyledTreeItem
      key={i}
      nodeId={row.nodeId}
      labelText={row.labelText}
      labelIcon={row.labelIcon}
      labelInfo={row.labelInfo}
      color={row.color}
      bgColor={row.bgColor}
      onIconClick={() => row.onIconClick ? row.onIconClick(row.dataItem) : null}
      onLabelClick={() => row.onLabelClick ? row.onLabelClick(row.dataItem) : null}
    >
      {row.treeItems && row.treeItems.length > 0 ?
        row.treeItems.map((row2, i2) => {
          return ListTreeItems(row2, i2);
        })
        : null}
    </StyledTreeItem>

  }
  return (
    <TreeView
      className={classes.root}
      defaultExpanded={defaultExpanded}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      {dataTreeItems && dataTreeItems.length > 0 ?
        dataTreeItems.map((x, idx) => {
          return ListTreeItems(x, idx)
        }) : null}
    </TreeView>
  );
}