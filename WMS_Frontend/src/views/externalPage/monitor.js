import React, {useState, useEffect, useLayoutEffect} from 'react'
import * as signalR from '@aspnet/signalr';
import queryString from "query-string";
import styled from 'styled-components'

const FieldComponent = styled.div`
    background:${props => props.background};
    position:relative;
`
const NormalComponent = styled.div`
    background:${props => props.background};
    position:relative;
`
const TextComponent = styled.div`
    margin: 0;
    color:${props => props.color}
    font-weight:bold;
    display: block;
    position:absolute;
    top: 40%;
    left: 50%;
    color:black;
    text-align:center;
    font-size:4em;
    transform: translate(-50%, -50%);
`


const useWindowSize = () => {
    const [size, setSize] = useState({width:window.innerWidth, height:window.innerHeight})

    useLayoutEffect(() => {
        const changeSize = () => {
            setSize({height : window.innerHeight, width : window.innerWidth})
        }
        window.addEventListener('resize', changeSize);
        return () => window.removeEventListener('resize', changeSize);
    }, [])

    return size;
}



export default (props) => {
    const [area, setArea] = useState("LIF01")
    const [response, setResponse] = useState([])
    const {width, height} = useWindowSize();

    useEffect(() => {
        let url = queryString.parse(document.location.search);
        setArea(url["area"])
    }, [document.location.pathname])
    
    useEffect(() => {
        let url = 'https://localhost:44342/monitor';
        let connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .build();

        const signalrStart = () => {
            connection.start()
                .then(() => {
                    connection.on("DashboardMonitor", res => {
                        let filterArea = JSON.parse(res).filter(x=> x.r_mccode === area || x.r_mccode === "SRM01")
                        setResponse(filterArea);
                    })
                })
                .catch((err) => {
                    setTimeout(() => signalrStart(), 5000);
                })
        };

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        signalrStart()
        return () => {
            connection.stop()
        }
    }, [area])

    return <>
        <DisplayStatus response={response} area={area} height={height} width={width}/>
    </>
}

const DisplayStatus = React.memo(({response, area, height, width}) => {
    var findByAlert = response.find(x=> x.r_is_alert === "1")
    if(findByAlert !== undefined){
        return <FieldComponent background="#FB5D14" style={{width:width, height:height}}>
            <TextComponent color="white">{`${findByAlert.r_mccode}`}<br/>{`${findByAlert.r_desc_th}`}</TextComponent>
        </FieldComponent>
    }
    else{
        let findByArea = response.find(x=> x.r_mccode === area);
        if(findByArea !== undefined){
            return <FieldComponent background="#7BFF33" style={{width:width, height:height}}>
                <TextComponent color="black">{`${findByArea.r_mccode}`}<br/>{`${findByArea.r_desc_th}`}</TextComponent>
            </FieldComponent>
        }
    }
});