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
                return <Dropdown.Item style={{cursor:"pointer"}} onClick={() => item.action(props.datas)}>{item.label}</Dropdown.Item>
            })}
        </Dropdown.Menu>
  </Dropdown>
}

export default AmDropdownMenu;