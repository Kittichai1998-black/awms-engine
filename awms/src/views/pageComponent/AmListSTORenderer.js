import React, { useState, useEffect, useReducer } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components'
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AmToolTip from "../../components/AmToolTip";
import Divider from '@material-ui/core/Divider';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
import AmEntityStatus from "../../components/AmEntityStatus";

const styles = theme => ({
    root: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    avatarStatus: {
        width: '25px',
        height: '25px',
    },
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
    },
    divLevel1: { display: "block" },
    chip: {
        margin: '2px 2px',
        height: '24px',
        // padding: '1px',
        borderRadius: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },
    avatar: {
        width: 24,
        height: 24,
        color: '#fff',
        fontSize: '95%',
        backgroundColor: grey[500]
    },
    listRoot: {
        width: '100%',
        padding: '5px 5px'
    },
    listItemAvatarRoot: {
        minWidth: '30px',
        maxWidth: '30px',
    },
    inline: {
        display: 'inline',
    },
    gutters: {
        padding: '0px 5px 0px 35px',
    },
    guttersHead: {
        padding: '0px 5px 0px 5px',
    },
    bgFocus: {
        // backgroundColor: red[50],
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 224, 0, 0.3)'
    }
});
const EntityEventStatus = [
    { status: 'INACTIVE', code: 0, label: 'I' }, //เเดง
    { status: 'ACTIVE', code: 1, label: 'A' }, //เขียว
    { status: 'REMOVE', code: 2, label: 'R' }, //เทา
    { status: 'DONE', code: 3, label: 'D' }, //
]

const AmListSTORenderer = (props) => {
    const { classes,
        dataSrc,
        showOptions = false,
        customOptions,
        chipRenderer = customOptionsRender } = props;

    const showDataPalletRenderer = (row) => {
        return <List className={classnames({ root: classnames(classes.listRoot, classes.root) })} component="div" disablePadding>
            <ListItem alignItems="center" divider disableGutters className={classnames(classes.guttersHead, row.isFocus ? classes.bgFocus : null)}>
                <ListItemAvatar className={classnames(classes.listItemAvatarRoot)}>
                    {_.find(EntityEventStatus, function (o) { return o.code === row.eventStatus; }) != null ?
                        <AmEntityStatus statusCode={row.eventStatus} className={classes.avatarStatus} />
                        : <AmStorageObjectStatus statusCode={row.eventStatus} className={classes.avatarStatus} />
                    }
                </ListItemAvatar>
                <ListItemText disableTypography
                    primary={<div className={classnames(classes.divLevel1)}><label className={classes.textNowrap}><span className={classes.labelHead}>{row.code}</span></label></div>}
                    secondary={
                        <div className={classnames(classes.inline)}>
                            {row.objectSizeName ? oriChipRenderer({
                                text: row.objectSizeName,
                                textAvatar: 'S',
                                textToolTip: 'Size Name',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.qty && row.unitCode ? oriChipRenderer({
                                text: row.qty + " " + row.unitCode,
                                textAvatar: 'Q',
                                textToolTip: 'Quantity',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                        </div>
                    }
                />
            </ListItem>
            {row.mapstos.length > 0 ?
                <List className={classnames({ root: classes.listRoot })} component="div" disablePadding>
                    {row.mapstos.map((sto, key) => {
                        return ListPackRenderer(sto, key)
                    })}
                </List>
                : null}
        </List>
    }

    const ListPackRenderer = (row, i) => {
        return <div key={i}>
            <ListItem key={i} alignItems="flex-start" disableGutters className={classnames(classes.gutters, row.isFocus ? classes.bgFocus : null)}>
                <ListItemAvatar className={classnames(classes.listItemAvatarRoot)}>
                    <AmStorageObjectStatus statusCode={row.eventStatus} className={classes.avatarStatus} />
                </ListItemAvatar>
                <ListItemText disableTypography
                    primary={<div className={classnames(classes.divLevel1)}><label className={classes.textNowrap}><span className={classes.labelHead}>{row.code}</span>{" : " + row.name}</label></div>}
                    secondary={
                        <div className={classnames(classes.inline)}>
                            {row.objectSizeName ? oriChipRenderer({
                                text: row.objectSizeName,
                                textAvatar: 'S',
                                textToolTip: 'Size Name',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.orderNo ? oriChipRenderer({
                                text: row.orderNo,
                                textAvatar: 'ON',
                                textToolTip: 'Order No.',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.batch ? oriChipRenderer({
                                text: row.batch,
                                textAvatar: 'B',
                                textToolTip: 'Batch',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.lot ? oriChipRenderer({
                                text: row.lot,
                                textAvatar: 'L',
                                textToolTip: 'Lot',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.qty && row.unitCode ? oriChipRenderer({
                                text: row.qty + " " + row.unitCode,
                                textAvatar: 'Q',
                                textToolTip: 'Quantity',
                                className: classes.chip,
                                classNameAvatar: classnames(classes.avatar)
                            }) : null}
                            {row.options && showOptions ? customOptions ? optionsRenderer(row.options)
                                : oriChipRenderer({
                                    text: row.options,
                                    textAvatar: 'OP',
                                    textToolTip: 'Options',
                                    className: classes.chip,
                                    classNameAvatar: classnames(classes.avatar)
                                }) : null}
                        </div>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            {row.mapstos.length > 0 ?
                <List style={{ paddingLeft: '35px' }} component="div" disablePadding>
                    {row.mapstos.map((sto, key) => {
                        return ListPackRenderer(sto, key)
                    })}
                </List>
                : null}
        </div>
    }
    const optionsRenderer = (value) => {
        var resOptions = customOptions(value);
        if (resOptions) {
            return resOptions.map((x, i) => {
                return chipRenderer({
                    text: x.value,
                    textAvatar: x.text,
                    textToolTip: x.textToolTip ? x.textToolTip : 'Options',
                    className: classes.chip,
                    classNameAvatar: classnames(classes.avatar), //, x.styleAvatar ? null : classes.optAvatar
                    styleAvatar: x.styleAvatar ? x.styleAvatar : null
                }, i)
            })
        } else {
            return null;
        }
    }

    const oriChipRenderer = ({ text, textAvatar, textToolTip, className, classNameAvatar }) => (
        <AmToolTip textTitle={textToolTip} placement={"top"}><Chip
            className={className}
            avatar={<Avatar className={classNameAvatar}>{textAvatar}</Avatar>}
            label={text}
            variant="outlined"
        /></AmToolTip>
    )
    return showDataPalletRenderer(dataSrc)
}
AmListSTORenderer.propTypes = {
    classes: PropTypes.object.isRequired,
    customOptions: PropTypes.func,
    showOptions: PropTypes.bool,
    chipRenderer: PropTypes.func,
};

export default withStyles(styles)(AmListSTORenderer);

export const customOptionsRender = ({ value, text, textAvatar, textToolTip, className, classNameAvatar, styleAvatar }, key) => (
    <AmToolTip key={key} textTitle={textToolTip} placement={"top"}>
        <Chip
            key={key}
            className={className}
            avatar={<Avatar className={classNameAvatar} style={styleAvatar}>{textAvatar}</Avatar>}
            label={text}
            variant="outlined"
        />
    </AmToolTip>
)

