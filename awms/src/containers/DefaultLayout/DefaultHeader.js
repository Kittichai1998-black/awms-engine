import React, { Component } from 'react';
import { Nav, NavLink, Dropdown, Button, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import img from '../../img/logout.png'

import { AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/Logo-AMW.png'
import sygnet from '../../assets/img/brand/sygnet.svg'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};
const imguser = <img style={{ width: "auto", height: "auto" }}src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU1IDU1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NSA1NTsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiPgo8cGF0aCBkPSJNNTUsMjcuNUM1NSwxMi4zMzcsNDIuNjYzLDAsMjcuNSwwUzAsMTIuMzM3LDAsMjcuNWMwLDguMDA5LDMuNDQ0LDE1LjIyOCw4LjkyNiwyMC4yNThsLTAuMDI2LDAuMDIzbDAuODkyLDAuNzUyICBjMC4wNTgsMC4wNDksMC4xMjEsMC4wODksMC4xNzksMC4xMzdjMC40NzQsMC4zOTMsMC45NjUsMC43NjYsMS40NjUsMS4xMjdjMC4xNjIsMC4xMTcsMC4zMjQsMC4yMzQsMC40ODksMC4zNDggIGMwLjUzNCwwLjM2OCwxLjA4MiwwLjcxNywxLjY0MiwxLjA0OGMwLjEyMiwwLjA3MiwwLjI0NSwwLjE0MiwwLjM2OCwwLjIxMmMwLjYxMywwLjM0OSwxLjIzOSwwLjY3OCwxLjg4LDAuOTggIGMwLjA0NywwLjAyMiwwLjA5NSwwLjA0MiwwLjE0MiwwLjA2NGMyLjA4OSwwLjk3MSw0LjMxOSwxLjY4NCw2LjY1MSwyLjEwNWMwLjA2MSwwLjAxMSwwLjEyMiwwLjAyMiwwLjE4NCwwLjAzMyAgYzAuNzI0LDAuMTI1LDEuNDU2LDAuMjI1LDIuMTk3LDAuMjkyYzAuMDksMC4wMDgsMC4xOCwwLjAxMywwLjI3MSwwLjAyMUMyNS45OTgsNTQuOTYxLDI2Ljc0NCw1NSwyNy41LDU1ICBjMC43NDksMCwxLjQ4OC0wLjAzOSwyLjIyMi0wLjA5OGMwLjA5My0wLjAwOCwwLjE4Ni0wLjAxMywwLjI3OS0wLjAyMWMwLjczNS0wLjA2NywxLjQ2MS0wLjE2NCwyLjE3OC0wLjI4NyAgYzAuMDYyLTAuMDExLDAuMTI1LTAuMDIyLDAuMTg3LTAuMDM0YzIuMjk3LTAuNDEyLDQuNDk1LTEuMTA5LDYuNTU3LTIuMDU1YzAuMDc2LTAuMDM1LDAuMTUzLTAuMDY4LDAuMjI5LTAuMTA0ICBjMC42MTctMC4yOSwxLjIyLTAuNjAzLDEuODExLTAuOTM2YzAuMTQ3LTAuMDgzLDAuMjkzLTAuMTY3LDAuNDM5LTAuMjUzYzAuNTM4LTAuMzE3LDEuMDY3LTAuNjQ4LDEuNTgxLTEgIGMwLjE4NS0wLjEyNiwwLjM2Ni0wLjI1OSwwLjU0OS0wLjM5MWMwLjQzOS0wLjMxNiwwLjg3LTAuNjQyLDEuMjg5LTAuOTgzYzAuMDkzLTAuMDc1LDAuMTkzLTAuMTQsMC4yODQtMC4yMTdsMC45MTUtMC43NjQgIGwtMC4wMjctMC4wMjNDNTEuNTIzLDQyLjgwMiw1NSwzNS41NSw1NSwyNy41eiBNMiwyNy41QzIsMTMuNDM5LDEzLjQzOSwyLDI3LjUsMlM1MywxMy40MzksNTMsMjcuNSAgYzAsNy41NzctMy4zMjUsMTQuMzg5LTguNTg5LDE5LjA2M2MtMC4yOTQtMC4yMDMtMC41OS0wLjM4NS0wLjg5My0wLjUzN2wtOC40NjctNC4yMzNjLTAuNzYtMC4zOC0xLjIzMi0xLjE0NC0xLjIzMi0xLjk5M3YtMi45NTcgIGMwLjE5Ni0wLjI0MiwwLjQwMy0wLjUxNiwwLjYxNy0wLjgxN2MxLjA5Ni0xLjU0OCwxLjk3NS0zLjI3LDIuNjE2LTUuMTIzYzEuMjY3LTAuNjAyLDIuMDg1LTEuODY0LDIuMDg1LTMuMjg5di0zLjU0NSAgYzAtMC44NjctMC4zMTgtMS43MDgtMC44ODctMi4zNjl2LTQuNjY3YzAuMDUyLTAuNTIsMC4yMzYtMy40NDgtMS44ODMtNS44NjRDMzQuNTI0LDkuMDY1LDMxLjU0MSw4LDI3LjUsOCAgcy03LjAyNCwxLjA2NS04Ljg2NywzLjE2OGMtMi4xMTksMi40MTYtMS45MzUsNS4zNDYtMS44ODMsNS44NjR2NC42NjdjLTAuNTY4LDAuNjYxLTAuODg3LDEuNTAyLTAuODg3LDIuMzY5djMuNTQ1ICBjMCwxLjEwMSwwLjQ5NCwyLjEyOCwxLjM0LDIuODIxYzAuODEsMy4xNzMsMi40NzcsNS41NzUsMy4wOTMsNi4zODl2Mi44OTRjMCwwLjgxNi0wLjQ0NSwxLjU2Ni0xLjE2MiwxLjk1OGwtNy45MDcsNC4zMTMgIGMtMC4yNTIsMC4xMzctMC41MDIsMC4yOTctMC43NTIsMC40NzZDNS4yNzYsNDEuNzkyLDIsMzUuMDIyLDIsMjcuNXoiIGZpbGw9IiMwMDY2Y2MiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;
//const imguser = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU1IDU1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NSA1NTsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiPgo8cGF0aCBkPSJNNTUsMjcuNUM1NSwxMi4zMzcsNDIuNjYzLDAsMjcuNSwwUzAsMTIuMzM3LDAsMjcuNWMwLDguMDA5LDMuNDQ0LDE1LjIyOCw4LjkyNiwyMC4yNThsLTAuMDI2LDAuMDIzbDAuODkyLDAuNzUyICBjMC4wNTgsMC4wNDksMC4xMjEsMC4wODksMC4xNzksMC4xMzdjMC40NzQsMC4zOTMsMC45NjUsMC43NjYsMS40NjUsMS4xMjdjMC4xNjIsMC4xMTcsMC4zMjQsMC4yMzQsMC40ODksMC4zNDggIGMwLjUzNCwwLjM2OCwxLjA4MiwwLjcxNywxLjY0MiwxLjA0OGMwLjEyMiwwLjA3MiwwLjI0NSwwLjE0MiwwLjM2OCwwLjIxMmMwLjYxMywwLjM0OSwxLjIzOSwwLjY3OCwxLjg4LDAuOTggIGMwLjA0NywwLjAyMiwwLjA5NSwwLjA0MiwwLjE0MiwwLjA2NGMyLjA4OSwwLjk3MSw0LjMxOSwxLjY4NCw2LjY1MSwyLjEwNWMwLjA2MSwwLjAxMSwwLjEyMiwwLjAyMiwwLjE4NCwwLjAzMyAgYzAuNzI0LDAuMTI1LDEuNDU2LDAuMjI1LDIuMTk3LDAuMjkyYzAuMDksMC4wMDgsMC4xOCwwLjAxMywwLjI3MSwwLjAyMUMyNS45OTgsNTQuOTYxLDI2Ljc0NCw1NSwyNy41LDU1ICBjMC43NDksMCwxLjQ4OC0wLjAzOSwyLjIyMi0wLjA5OGMwLjA5My0wLjAwOCwwLjE4Ni0wLjAxMywwLjI3OS0wLjAyMWMwLjczNS0wLjA2NywxLjQ2MS0wLjE2NCwyLjE3OC0wLjI4NyAgYzAuMDYyLTAuMDExLDAuMTI1LTAuMDIyLDAuMTg3LTAuMDM0YzIuMjk3LTAuNDEyLDQuNDk1LTEuMTA5LDYuNTU3LTIuMDU1YzAuMDc2LTAuMDM1LDAuMTUzLTAuMDY4LDAuMjI5LTAuMTA0ICBjMC42MTctMC4yOSwxLjIyLTAuNjAzLDEuODExLTAuOTM2YzAuMTQ3LTAuMDgzLDAuMjkzLTAuMTY3LDAuNDM5LTAuMjUzYzAuNTM4LTAuMzE3LDEuMDY3LTAuNjQ4LDEuNTgxLTEgIGMwLjE4NS0wLjEyNiwwLjM2Ni0wLjI1OSwwLjU0OS0wLjM5MWMwLjQzOS0wLjMxNiwwLjg3LTAuNjQyLDEuMjg5LTAuOTgzYzAuMDkzLTAuMDc1LDAuMTkzLTAuMTQsMC4yODQtMC4yMTdsMC45MTUtMC43NjQgIGwtMC4wMjctMC4wMjNDNTEuNTIzLDQyLjgwMiw1NSwzNS41NSw1NSwyNy41eiBNMiwyNy41QzIsMTMuNDM5LDEzLjQzOSwyLDI3LjUsMlM1MywxMy40MzksNTMsMjcuNSAgYzAsNy41NzctMy4zMjUsMTQuMzg5LTguNTg5LDE5LjA2M2MtMC4yOTQtMC4yMDMtMC41OS0wLjM4NS0wLjg5My0wLjUzN2wtOC40NjctNC4yMzNjLTAuNzYtMC4zOC0xLjIzMi0xLjE0NC0xLjIzMi0xLjk5M3YtMi45NTcgIGMwLjE5Ni0wLjI0MiwwLjQwMy0wLjUxNiwwLjYxNy0wLjgxN2MxLjA5Ni0xLjU0OCwxLjk3NS0zLjI3LDIuNjE2LTUuMTIzYzEuMjY3LTAuNjAyLDIuMDg1LTEuODY0LDIuMDg1LTMuMjg5di0zLjU0NSAgYzAtMC44NjctMC4zMTgtMS43MDgtMC44ODctMi4zNjl2LTQuNjY3YzAuMDUyLTAuNTIsMC4yMzYtMy40NDgtMS44ODMtNS44NjRDMzQuNTI0LDkuMDY1LDMxLjU0MSw4LDI3LjUsOCAgcy03LjAyNCwxLjA2NS04Ljg2NywzLjE2OGMtMi4xMTksMi40MTYtMS45MzUsNS4zNDYtMS44ODMsNS44NjR2NC42NjdjLTAuNTY4LDAuNjYxLTAuODg3LDEuNTAyLTAuODg3LDIuMzY5djMuNTQ1ICBjMCwxLjEwMSwwLjQ5NCwyLjEyOCwxLjM0LDIuODIxYzAuODEsMy4xNzMsMi40NzcsNS41NzUsMy4wOTMsNi4zODl2Mi44OTRjMCwwLjgxNi0wLjQ0NSwxLjU2Ni0xLjE2MiwxLjk1OGwtNy45MDcsNC4zMTMgIGMtMC4yNTIsMC4xMzctMC41MDIsMC4yOTctMC43NTIsMC40NzZDNS4yNzYsNDEuNzkyLDIsMzUuMDIyLDIsMjcuNXoiIGZpbGw9IiNmZjUxMDAiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;
const imgprof = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDM1MCAzNTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM1MCAzNTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8cGF0aCBkPSJNMTc1LDE3MS4xNzNjMzguOTE0LDAsNzAuNDYzLTM4LjMxOCw3MC40NjMtODUuNTg2QzI0NS40NjMsMzguMzE4LDIzNS4xMDUsMCwxNzUsMHMtNzAuNDY1LDM4LjMxOC03MC40NjUsODUuNTg3ICAgQzEwNC41MzUsMTMyLjg1NSwxMzYuMDg0LDE3MS4xNzMsMTc1LDE3MS4xNzN6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8cGF0aCBkPSJNNDEuOTA5LDMwMS44NTNDNDEuODk3LDI5OC45NzEsNDEuODg1LDMwMS4wNDEsNDEuOTA5LDMwMS44NTNMNDEuOTA5LDMwMS44NTN6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8cGF0aCBkPSJNMzA4LjA4NSwzMDQuMTA0QzMwOC4xMjMsMzAzLjMxNSwzMDguMDk4LDI5OC42MywzMDguMDg1LDMwNC4xMDRMMzA4LjA4NSwzMDQuMTA0eiIgZmlsbD0iIzAwMDAwMCIvPgoJPHBhdGggZD0iTTMwNy45MzUsMjk4LjM5N2MtMS4zMDUtODIuMzQyLTEyLjA1OS0xMDUuODA1LTk0LjM1Mi0xMjAuNjU3YzAsMC0xMS41ODQsMTQuNzYxLTM4LjU4NCwxNC43NjEgICBzLTM4LjU4Ni0xNC43NjEtMzguNTg2LTE0Ljc2MWMtODEuMzk1LDE0LjY5LTkyLjgwMywzNy44MDUtOTQuMzAzLDExNy45ODJjLTAuMTIzLDYuNTQ3LTAuMTgsNi44OTEtMC4yMDIsNi4xMzEgICBjMC4wMDUsMS40MjQsMC4wMTEsNC4wNTgsMC4wMTEsOC42NTFjMCwwLDE5LjU5MiwzOS40OTYsMTMzLjA4LDM5LjQ5NmMxMTMuNDg2LDAsMTMzLjA4LTM5LjQ5NiwxMzMuMDgtMzkuNDk2ICAgYzAtMi45NTEsMC4wMDItNS4wMDMsMC4wMDUtNi4zOTlDMzA4LjA2MiwzMDQuNTc1LDMwOC4wMTgsMzAzLjY2NCwzMDcuOTM1LDI5OC4zOTd6IiBmaWxsPSIjMDAwMDAwIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;
const imgpass = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDM3LjMzMywxOTJoLTMydi00Mi42NjdDNDA1LjMzMyw2Ni45OSwzMzguMzQ0LDAsMjU2LDBTMTA2LjY2Nyw2Ni45OSwxMDYuNjY3LDE0OS4zMzNWMTkyaC0zMiAgICBDNjguNzcxLDE5Miw2NCwxOTYuNzcxLDY0LDIwMi42Njd2MjY2LjY2N0M2NCw0OTIuODY1LDgzLjEzNSw1MTIsMTA2LjY2Nyw1MTJoMjk4LjY2N0M0MjguODY1LDUxMiw0NDgsNDkyLjg2NSw0NDgsNDY5LjMzMyAgICBWMjAyLjY2N0M0NDgsMTk2Ljc3MSw0NDMuMjI5LDE5Miw0MzcuMzMzLDE5MnogTTI4Ny45MzgsNDE0LjgyM2MwLjMzMywzLjAxLTAuNjM1LDYuMDMxLTIuNjU2LDguMjkyICAgIGMtMi4wMjEsMi4yNi00LjkxNywzLjU1Mi03Ljk0OCwzLjU1MmgtNDIuNjY3Yy0zLjAzMSwwLTUuOTI3LTEuMjkyLTcuOTQ4LTMuNTUyYy0yLjAyMS0yLjI2LTIuOTktNS4yODEtMi42NTYtOC4yOTJsNi43MjktNjAuNTEgICAgYy0xMC45MjctNy45NDgtMTcuNDU4LTIwLjUyMS0xNy40NTgtMzQuMzEzYzAtMjMuNTMxLDE5LjEzNS00Mi42NjcsNDIuNjY3LTQyLjY2N3M0Mi42NjcsMTkuMTM1LDQyLjY2Nyw0Mi42NjcgICAgYzAsMTMuNzkyLTYuNTMxLDI2LjM2NS0xNy40NTgsMzQuMzEzTDI4Ny45MzgsNDE0LjgyM3ogTTM0MS4zMzMsMTkySDE3MC42Njd2LTQyLjY2N0MxNzAuNjY3LDEwMi4yODEsMjA4Ljk0OCw2NCwyNTYsNjQgICAgczg1LjMzMywzOC4yODEsODUuMzMzLDg1LjMzM1YxOTJ6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
const imglogout = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDEyMi43NzUgMTIyLjc3NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTIyLjc3NSAxMjIuNzc2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTg2LDI4LjA3NHYtMjAuN2MwLTMuMy0yLjY5OS02LTYtNkg2Yy0zLjMsMC02LDIuNy02LDZ2My45djc4LjJ2Mi43MDFjMCwyLjE5OSwxLjMsNC4yOTksMy4yLDUuMjk5bDQ1LjYsMjMuNjAxICAgYzIsMSw0LjQtMC4zOTksNC40LTIuN3YtMjNIODBjMy4zMDEsMCw2LTIuNjk5LDYtNnYtMzIuOEg3NHYyMy44YzAsMS43LTEuMywzLTMsM0g1My4zdi0zMC44di0xOS41di0wLjZjMC0yLjItMS4zLTQuMy0zLjItNS4zICAgbC0yNi45LTEzLjhINzFjMS43LDAsMywxLjMsMywzdjExLjhoMTJWMjguMDc0eiIgZmlsbD0iIzAwMDAwMCIvPgoJPHBhdGggZD0iTTEwMS40LDE4LjI3M2wxOS41LDE5LjVjMi41LDIuNSwyLjUsNi4yLDAsOC43bC0xOS41LDE5LjVjLTIuNSwyLjUtNi4zMDEsMi42MDEtOC44MDEsMC4xMDEgICBjLTIuMzk5LTIuMzk5LTIuMS02LjQsMC4yMDEtOC44bDguNzk5LTguN0g2Ny41Yy0xLjY5OSwwLTMuNC0wLjctNC41LTJjLTIuOC0zLTIuMS04LjMsMS41LTEwLjNjMC45LTAuNSwyLTAuOCwzLTAuOGgzNC4xICAgYzAsMC04LjY5OS04LjctOC43OTktOC43Yy0yLjMwMS0yLjMtMi42MDEtNi40LTAuMjAxLTguN0M5NSwxNS42NzQsOTguOSwxNS43NzMsMTAxLjQsMTguMjczeiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />;
class DefaultHeader extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }
  Logout(){
    sessionStorage.clear();
    localStorage.clear();
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    return (
      <React.Fragment> 
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand          
          full={{ src: logo, width: 70, height: 70 }}
          minimized={{ src: sygnet, width: 30, height: 30 }}
         
        />
        <AppSidebarToggler className="d-md-down-none" display="lg"/>

        {/* <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink href="/">Dashboard</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#">Users</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#">Settings</NavLink>
          </NavItem>
        </Nav> */}
        <Nav className="ml-auto" pills >
          {/*<NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-bell"></i><Badge pill color="danger">5</Badge></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-list"></i></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-location-pin"></i></NavLink>
          </NavItem>*/}
          <AppHeaderDropdown direction="down" >
            {/*<span style={{ paddingRight: '40px' }}><NavLink href="/Login" onClick={this.Logout.bind(this)}><img src={img} height="30px"></img>
              <span className="heading"> Logout  </span>
              </NavLink></span>*/}
            <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
              {/*<Button id="caret" color="primary">{this.props.text}Profile</Button>*/}
              <DropdownToggle nav caret style={{color: "black"}}>
                {imguser} {localStorage.getItem("Username")}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem nav href="/profile">{imgprof} Profile</DropdownItem>
                <DropdownItem nav href="/changepassword">{imgpass} Change Password</DropdownItem>
                <DropdownItem nav href="/Login" onClick={this.Logout.bind(this)}>{imglogout} Log Out</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {/*<DropdownToggle nav>
            
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
              <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
              <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>
              <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
              <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
              <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem>
              <DropdownItem><i className="fa fa-lock"></i> Logout</DropdownItem>
            </DropdownMenu>*/}
          </AppHeaderDropdown>
        </Nav>
        {/*<AppAsideToggler className="d-md-down-none" />*/}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}


DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
