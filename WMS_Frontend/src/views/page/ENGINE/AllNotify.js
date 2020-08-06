import React, { useEffect, useState, useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import {
    apicall,
    createQueryString
} from "../../../components/function/CoreFunction";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { LayoutContext } from "../../../reducers/context";
import Typography from '@material-ui/core/Typography';
import AmInput from '../../../components/AmInput';
import AmButton from '../../../components/AmButton';
import moment from "moment";
import styled from "styled-components";
import ErrorIcon from '@material-ui/icons/Error';

const Axios = new apicall();

const type = {
    1:"success",
    2:"info",
    3:"error",
    4:"warning"
}

const priority = {
    1:"normal",
    2:"critical",
}

const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 5px 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const useStyles = makeStyles({
    root: {
      minWidth: 275,
      marginBottom:"5px"
    },
    success:{
        background:'rgba(197, 225, 160, 0.5)',
        border:'2px solid rgb(197, 225, 160)',
    },
    info:{
        background:'rgba(55, 71, 255, 0.5)',
        border:'2px solid rgb(55, 71, 255)',
    },
    error:{
        background:'rgba(239, 154, 154, 0.5)',
        border:'2px solid rgb(239, 154, 154)',
    },
    warning:{
        background:'rgba(255, 245, 157, 0.5) ',
        border:'2px solid rgb(255, 245, 157)',
    },
    normal:{
        //background:'rgba(255, 255, 255, 1)'
    },
    critical:{
        //background:'rgba(255, 0, 0, 0.5)'
    },
    bullet: {
      display: 'inline-block',
      margin: '0 3px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
      float:"left"
    },
    timestamp: {
      fontSize: 14,
      float:"right"
    },
    pos: {
      marginBottom: 12,
    },
});

const useNotifyData = (props) => {
    const [data, setData] = useState([]);
    const {notify} = useContext(LayoutContext);

    useEffect(()=> {
        if(props.filter !== '' && props.filter !== undefined){
            Axios.get(window.apipath + `/v2/get_notify?userId=${props.userID}&l=${props.limit}&sk=0&filter=${props.filter}`).then(res => {
                setData(res.data.messageDetails);
            }); 
        }
        else{
            Axios.get(window.apipath + `/v2/get_notify?userId=${props.userID}&l=${props.limit}&sk=0`).then(res => {
                setData(res.data.messageDetails);
            });            
        }
    },[props.userID, props.limit, props.filter]);

    useEffect(() => {
        let first = notify.notifyList.slice(0, 1);
        let firstOld = data.slice(0, 1);
        if(firstOld.ID !== first.ID){
            data.unshift(...first);
            setData([...data]);
        }
    }, [notify.notifyList, data])

    return data;
}


export default () => {
    const [limit, setLimit] = useState(5)
    const [filterText, setFilterText] = useState("");
    const [filter, setFilter] = useState("");
    const notiData = useNotifyData({userID:localStorage.User_ID, limit:limit, filter:filter});
    const classes = useStyles();
    
    return <div>
        <FormInline style={{marginBottom:5}}>
            <label>ค้นหา : </label>
            <AmInput onKeyPress={(value, v1, v2, v3) => {
                if(v3.key === "Enter"){
                    setFilter(value)
                }
            }}
            onChangeV2={(value, v1, v2, v3) => {
                if(v3.key === "Enter"){
                    setFilterText(value)
                }
            }}/>
            <AmButton styleType={"add"} style={{float:"right"}} onClick={() => setFilter(filterText)}>Find</AmButton>
        </FormInline>
        {notiData.map(noti => {
            return <Card className={[classes.root, classes[type[noti.NotifyType]], classes[priority[noti.Priority]]]}>
            <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {noti.Title}
                    </Typography>
                    {noti.NotifyType === 2 ? <ErrorIcon title="Critical"variant='Critical' aria-label="Critical"  style={{marginLeft:5,color:"red", float:"left", fontSize:20}}/> : null}
                    <Typography className={classes.timestamp} color="textSecondary" gutterBottom>{moment(noti.PostTime).format("HH:mm DD/MM/YYYY")}</Typography>
                    <div style={{clear:"both"}}></div>
                    <Typography variant="body2" component="p">{noti.Message}</Typography>
                </CardContent>
            </Card>
        })}
        <AmButton styleType={"add"} style={{float:"right"}} onClick={() => setLimit(limit+5)}>See More</AmButton>
        <div style={{clear:"both"}}></div>
    </div>
    
}