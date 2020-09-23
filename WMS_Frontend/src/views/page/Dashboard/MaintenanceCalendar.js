import React, { useEffect, useRef, useState } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import { withStyles } from '@material-ui/core/styles';
import interactionPlugin from "@fullcalendar/interaction";
import { useTranslation } from "react-i18next";
import timeGridPlugin from '@fullcalendar/timegrid'
import queryString from "query-string";
import moment from "moment";
const Axios = new apicall();

const styles = theme => ({
    container: {
        height: 'inherit'
    }

})

const MaintenanceCalendar = (props) => {

    const { classes } = props;
    const { t } = useTranslation();
    const [dataEvents, setDataEvents] = useState([]);
    const query = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI",
        t: "MaintenanceResult",
        q: '[{ "f": "Status", "c":"!=", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: 100,
        all: "",
    };

    useEffect(() => {
        Axios.get(createQueryString(query)).then(res => {
            if (res.data.datas) {
                let _dataevents = []
                res.data.datas.map(x => {
                    let backgroundColor = "";
                    let borderColor = "";
                    let textColor = "#2f353a";
                    if (x.EventStatus === 10) {
                        backgroundColor = "#fff";
                        borderColor = "#c8ced3";
                    } else if (x.EventStatus === 11 || x.EventStatus === 12) {
                        backgroundColor = "#ffc107";
                        borderColor = "#ffc107";
                    } else if (x.EventStatus === (31)) {
                        backgroundColor = "#f0f3f5";
                        borderColor = "#3d6dff";
                    } else if (x.EventStatus === 32) {
                        backgroundColor = "#3d6dff";
                        borderColor = "#3d6dff";
                        textColor = '#fff';
                    }
                    _dataevents.push({
                        id: x.ID,
                        title: x.Name,
                        start: moment(x.MaintenanceDate).format("YYYY-MM-DD"),
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        textColor: textColor,
                        ...x
                    });
                });
                setDataEvents(_dataevents)
            } else {
                setDataEvents([])
            }
        });
    }, [])

    const handleEventClick = (clickInfo) => {
        window.open("/warehouse/managemtnplan?maintenanceID=" + clickInfo.event.id)
    }
    function renderEventContent(eventInfo) {
        return (
            <div style={{ cursor: 'pointer' }}>
                {/* <b>{eventInfo.timeText}</b> */}
                <b style={{ marginLeft: '2px' }}>{eventInfo.event.title}</b>
            </div>
        )
    }
     
    return (
        <FullCalendar
            style={{maxHeight: props.height}}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            // headerToolbar={{
            //     left: 'prev,next today',
            //     center: 'title',
            //     right: 'dayGridMonth,timeGridWeek' //,timeGridDay
            // }}
            initialView="dayGridMonth"
            selectable={true}
            events={dataEvents}
            eventClick={handleEventClick}
            eventContent={renderEventContent} // custom render function
        />
    );
};

export default withStyles(styles)(MaintenanceCalendar);
