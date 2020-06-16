import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types"
import { withStyles, makeStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from "@material-ui/core/Typography";
import MuiExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AmButton from "../../components/AmButton";
import _ from 'lodash';
import cls from 'classnames';
const useStyles = makeStyles(theme => ({
    root: {
        width: "100%", 
    },

}));
const ExpansionPanel = withStyles({
    root: {

        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
            height: 'auto',
        },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: "30px !important",
        '&$expanded': {
            minHeight: "30px !important",
        }
    },
    content: {
        margin: "0 !important",
        '&$expanded': {
            margin: "0 !important",
        }
    },
    expandIcon: {
        padding: 0,
        '&$expanded': {
            padding: 0,
        }
    },
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles({
    root: {
        padding: '8px 8px 30px 8px',
        overflow: 'auto',
        minHeight: '100px',
    }
})(MuiExpansionPanelDetails);

const ExpansionPanelActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(0.4),
    },
    divleftright: {
        display: 'contents',
    },
    _right: {
        width: '50%',
        float: 'right',
        textAlign: 'right'
    },
    _left: {
        width: '50%',
        float: 'left',
        textAlign: 'left'
    }
}))(props => {
    const { classes, className, panelActions, ...other } = props;

    return (
        <MuiExpansionPanelActions
            className={cls(classes.root, className)}
            {...panelActions.panelActionsProps}
            {...other}
        >
            {panelActions.contentLeft || panelActions.contentRight ? <div className={classes.divleftright}>
                {panelActions.contentLeft ? <div className={cls(classes._left)}>{panelActions.contentLeft}</div> : null}
                {panelActions.contentRight ? <div className={cls(classes._right)}>{panelActions.contentRight}</div> : null}
            </div> : null}
            {panelActions.contentNormal ? panelActions.contentNormal : null}
        </MuiExpansionPanelActions>
    )
});
const ExpandMoreIcon = withStyles(theme => ({
    root: {
        padding: 4,
    },

}))(props => {
    const { classes, className, children, ...other } = props;
    return (
        <MuiExpandMoreIcon size="small" className={cls(classes.root)} />
    )
});

function useWindowSize(ref) {
    const [size, setSize] = useState(0);
    useLayoutEffect(() => {
        function updateSize() {
            if (ref !== undefined)
                setSize(window.innerHeight);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

const ControlledExpansionPanels = (props) => {
    const classes = useStyles();
    const {
        contents
    } = props;
    const containerRef = useRef();
    const divHeight = useRef();
    const countpanelshow = useRef(0);
    const [expanded, setExpanded] = useState([]);
    const [countPanels, setCountPanels] = useState(0);
    divHeight.current = useWindowSize(containerRef)

    useEffect(() => {
        let getdefaultExtended = _.filter(contents, function (o) {
            if (o.panelProps === undefined || o.panelProps.defaultExpanded === undefined || o.panelProps.defaultExpanded === true) { 
                return o; 
            }
        });
        let getExtended = [];
        getdefaultExtended.forEach((x) => {
            getExtended.push(x.panelName);
        })
        setExpanded([...getExtended])
        setCountPanels(getdefaultExtended.length);
        countpanelshow.current = getdefaultExtended.length;
    }, [contents])


    useEffect(() => {
        setCountPanels(expanded.length)
    }, [expanded])

    const MemoPanels = React.memo(({ settings }) => {
        return settings.map((content, idx) => {
            return <>
                <ContentsExpansion key={idx} settings={content} />
            </>
        });
    });

    const ContentsExpansion = (props) => {

        const onChangeExpansion = panel => (event, isExpanded) => {
            var newExp = expanded.filter(x => x !== panel)
            if (isExpanded) {
                newExp.push(panel)
                setExpanded([...newExp])
            } else {
                setExpanded([...newExp])
            }
        }
        const checkExpansion = () => {
            var exp = expanded.find(x => x === props.settings.panelName);
            if (exp !== undefined) {
                return true
            }
            else {
                return false;
            }
        }
        return <>
            <ExpansionPanel
                onChange={onChangeExpansion(props.settings.panelName)}
                expanded={checkExpansion()}
                defaultExpanded={true}
                square={true}
                {...props.settings.panelProps}
            >
                {props.settings.panelSummary ?
                    <ExpansionPanelSummary
                        expandIcon={props.settings.expandIcon ? props.settings.expandIcon : <ExpandMoreIcon />}
                        aria-controls={props.settings.panelName}
                        id={props.settings.panelName}
                        {...props.settings.panelSummary.panelSummaryProps}
                    >
                        {props.settings.panelSummary.content}
                    </ExpansionPanelSummary>
                    : null}
                {props.settings.panelDetails ?
                    <ExpansionPanelDetails {...props.settings.panelDetails.panelDetailsProps}
                        style={{ maxHeight: `calc(((${divHeight.current}px - 130px) / ${countPanels}) - 70px)` }}>
                        {props.settings.panelDetails.content}
                    </ExpansionPanelDetails>
                    : null}
                {props.settings.panelActions ?
                    <ExpansionPanelActions
                        panelActions={props.settings.panelActions} >
                    </ExpansionPanelActions>
                    : null}
            </ExpansionPanel>
        </>
    }
    return (
        <div id={"contents"} ref={containerRef} className={classes.root} style={{ height: `calc(${divHeight.current}px - 130px)` }}>
            <MemoPanels settings={contents} />
        </div>
    );
}

ControlledExpansionPanels.propTypes = {
    contents: PropTypes.array.isRequired
}
export default ControlledExpansionPanels;