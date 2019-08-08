import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    arrow: {
        position: "absolute",
        fontSize: 7,
        width: "3em",
        height: "3em",
        "&::before": {
            content: '""',
            margin: "auto",
            display: "block",
            width: 0,
            height: 0,
            borderStyle: "solid"
        }
    },
    bootstrapPopper: arrowGenerator(theme.palette.grey[700]),
    bootstrapTooltip: {
        backgroundColor: theme.palette.grey[700]
    },
    bootstrapPlacementLeft: {
        margin: "0 8px"
    },
    bootstrapPlacementRight: {
        margin: "0 8px"
    },
    bootstrapPlacementTop: {
        margin: "8px 0"
    },
    bootstrapPlacementBottom: {
        margin: "8px 0"
    }
});

function arrowGenerator(color) {
    return {
        '&[x-placement*="bottom"] $arrow': {
            top: 0,
            left: 0,
            marginTop: "-0.9em",
            width: "3em",
            height: "1em",
            "&::before": {
                borderWidth: "0 1em 1em 1em",
                borderColor: `transparent transparent ${color} transparent`
            }
        },
        '&[x-placement*="top"] $arrow': {
            bottom: 0,
            left: 0,
            marginBottom: "-0.9em",
            width: "3em",
            height: "1em",
            "&::before": {
                borderWidth: "1em 1em 0 1em",
                borderColor: `${color} transparent transparent transparent`
            }
        },
        '&[x-placement*="right"] $arrow': {
            left: 0,
            marginLeft: "-0.9em",
            height: "3em",
            width: "1em",
            "&::before": {
                borderWidth: "1em 1em 1em 0",
                borderColor: `transparent ${color} transparent transparent`
            }
        },
        '&[x-placement*="left"] $arrow': {
            right: 0,
            marginRight: "-0.9em",
            height: "3em",
            width: "1em",
            "&::before": {
                borderWidth: "1em 0 1em 1em",
                borderColor: `transparent transparent transparent ${color}`
            }
        }
    };
}

class AmTooltip extends React.Component {
    state = {
        arrowRef: null
    };

    handleArrowRef = node => {
        this.setState({
            arrowRef: node
        });
    };
    render() {
        const { children, classes, className, textTitle, placement, ...other } = this.props;

        return (
            <Tooltip
                title={
                    <React.Fragment>
                        {textTitle}
                        <span className={classes.arrow} ref={this.handleArrowRef} />
                    </React.Fragment>
                }
                classes={{
                    tooltip: classes.bootstrapTooltip,
                    popper: classes.bootstrapPopper,
                    tooltipPlacementLeft: classes.bootstrapPlacementLeft,
                    tooltipPlacementRight: classes.bootstrapPlacementRight,
                    tooltipPlacementTop: classes.bootstrapPlacementTop,
                    tooltipPlacementBottom: classes.bootstrapPlacementBottom
                }}
                PopperProps={{
                    popperOptions: {
                        modifiers: {
                            arrow: {
                                enabled: Boolean(this.state.arrowRef),
                                element: this.state.arrowRef
                            }
                        }
                    }
                }}
                placement={placement}
                {...other} >{children}
            </Tooltip>
        );
    }
}

AmTooltip.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    textTitle: PropTypes.string
}
export default withStyles(styles)(AmTooltip);