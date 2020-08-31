import React, {useRef} from "react";
import {Dropdown} from "react-bootstrap";

const AmDropdownMenu = (props) => {
    const ref = useRef();
    return <Dropdown style={{...props.style}}>
        <Dropdown.Toggle as={props.customToggle ? props.customToggle : undefined} id={props.id ? 'dropdownMenu' : props.id}>
            {props.title}
        </Dropdown.Toggle>
        <Dropdown.Menu ref={ref} as={props.customItems ? props.customItems : undefined}>
            {props.items.map(item => {
                if(item.divider)
                    return <Dropdown.Divider/>
                if(item.action === undefined){
                    if(item.selectable)
                    return <Dropdown.ItemText disabled={props.disabled} style={{cursor:"pointer"}}>{item.label}</Dropdown.ItemText>
                    else
                    return <Dropdown.Item disabled={props.disabled} style={{cursor:"pointer"}}>{item.label}</Dropdown.Item>
                }
                else{
                    
                    if(item.selectable)
                    return <Dropdown.ItemText disabled={props.disabled} onClick={() => item.action(props.datas)}>{item.label}</Dropdown.ItemText>
                    else
                    return <Dropdown.Item disabled={props.disabled} style={{cursor:"pointer"}} onClick={() => item.action(props.datas)}>{item.label}</Dropdown.Item>

                }
            })}
        </Dropdown.Menu>
  </Dropdown>
}

export default AmDropdownMenu;