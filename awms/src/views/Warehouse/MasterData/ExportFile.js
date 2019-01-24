import React, { Component } from 'react';
import _ from 'lodash'
import Workbook from 'react-excel-workbook'
import { apicall, createQueryString, Clone } from '../ComponentCore'
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import moment from 'moment';
const Axios = new apicall()

const iconprint = <img style={{ width: "17px", height: "inherit" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJCSURBVHhe7dq9rwxRHMbxJRHxEkKiEAn/gERPIfEXqCWiEwrRuQoUIqiIjqCgErXOH6BU0bgd8ZLce2lQEHx/m3OScfLsntm7szPnnvye5FPs3HNmTp6dfbmzM/J41pWtWCrIcfSa3fhbkFvoNV4A4sHvYs9Aiiig94M34gUEXsD4UY/xAuAFBF6AbRgoXkDgBYwf9RgvAF5A4AXYhoHS+Ro24RzeYG2Kr4gH/xm2DaHtGr7gOQ5hau4h7rRG9sQdhMwR/IGaWJNnkLkANaE29nKQuQw1oTbfIOMFQE3YKD7hOq7gXdimVFnACvYjZieWocZWWcBDpLkKNbbKAp4izQ2osVUW8B2HEXMAn6HGVvsmaCXYmfAIq2GbUm0BbXkBkPECoCbUxguAjBcANaE2nRdQwg0Ss+i8gBIuis7CC4BMlwXsgDpl57EZadR6chZewHks4uKqXeTYhmbUuJyFF3Afaty8fqN50cOixuUsvIBdsLNA3dG5XpdwFGnUenImFmAHUhNyqnkTPAU1IWejFfAWMvaD53uoSdOkBZzGD6ixbb2E/U6Zi5qbcxETcwwfoSZOkhbwGGrcLH5hO3JRc6extamP0/+yF2dxE7cnsK+/cadpAftg1+bVvDZsfyfQJnENr6D2Fdl67MntLH6DBLyAID34SXyAulFhHi+wBc0UWcATxL91Lb25IW4vqgC7DeUOHnTsDNIUWUCf8QICL2D8qMc0C3gN9ZrtQxEFlKD3Aux/fvVZPZRr8Hg8s2Y0+gdjHjQ2tEQyPwAAAABJRU5ErkJggg==" />;
// const iconpdf = <img style={{ width: "17px", height: "inherit" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6I0U5RTlFMDsiIGQ9Ik0zNi45ODUsMEg3Ljk2M0M3LjE1NSwwLDYuNSwwLjY1NSw2LjUsMS45MjZWNTVjMCwwLjM0NSwwLjY1NSwxLDEuNDYzLDFoNDAuMDc0ICAgYzAuODA4LDAsMS40NjMtMC42NTUsMS40NjMtMVYxMi45NzhjMC0wLjY5Ni0wLjA5My0wLjkyLTAuMjU3LTEuMDg1TDM3LjYwNywwLjI1N0MzNy40NDIsMC4wOTMsMzcuMjE4LDAsMzYuOTg1LDB6Ii8+Cgk8cG9seWdvbiBzdHlsZT0iZmlsbDojRDlEN0NBOyIgcG9pbnRzPSIzNy41LDAuMTUxIDM3LjUsMTIgNDkuMzQ5LDEyICAiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDQzRCNEM7IiBkPSJNMTkuNTE0LDMzLjMyNEwxOS41MTQsMzMuMzI0Yy0wLjM0OCwwLTAuNjgyLTAuMTEzLTAuOTY3LTAuMzI2ICAgYy0xLjA0MS0wLjc4MS0xLjE4MS0xLjY1LTEuMTE1LTIuMjQyYzAuMTgyLTEuNjI4LDIuMTk1LTMuMzMyLDUuOTg1LTUuMDY4YzEuNTA0LTMuMjk2LDIuOTM1LTcuMzU3LDMuNzg4LTEwLjc1ICAgYy0wLjk5OC0yLjE3Mi0xLjk2OC00Ljk5LTEuMjYxLTYuNjQzYzAuMjQ4LTAuNTc5LDAuNTU3LTEuMDIzLDEuMTM0LTEuMjE1YzAuMjI4LTAuMDc2LDAuODA0LTAuMTcyLDEuMDE2LTAuMTcyICAgYzAuNTA0LDAsMC45NDcsMC42NDksMS4yNjEsMS4wNDljMC4yOTUsMC4zNzYsMC45NjQsMS4xNzMtMC4zNzMsNi44MDJjMS4zNDgsMi43ODQsMy4yNTgsNS42Miw1LjA4OCw3LjU2MiAgIGMxLjMxMS0wLjIzNywyLjQzOS0wLjM1OCwzLjM1OC0wLjM1OGMxLjU2NiwwLDIuNTE1LDAuMzY1LDIuOTAyLDEuMTE3YzAuMzIsMC42MjIsMC4xODksMS4zNDktMC4zOSwyLjE2ICAgYy0wLjU1NywwLjc3OS0xLjMyNSwxLjE5MS0yLjIyLDEuMTkxYy0xLjIxNiwwLTIuNjMyLTAuNzY4LTQuMjExLTIuMjg1Yy0yLjgzNywwLjU5My02LjE1LDEuNjUxLTguODI4LDIuODIyICAgYy0wLjgzNiwxLjc3NC0xLjYzNywzLjIwMy0yLjM4Myw0LjI1MUMyMS4yNzMsMzIuNjU0LDIwLjM4OSwzMy4zMjQsMTkuNTE0LDMzLjMyNHogTTIyLjE3NiwyOC4xOTggICBjLTIuMTM3LDEuMjAxLTMuMDA4LDIuMTg4LTMuMDcxLDIuNzQ0Yy0wLjAxLDAuMDkyLTAuMDM3LDAuMzM0LDAuNDMxLDAuNjkyQzE5LjY4NSwzMS41ODcsMjAuNTU1LDMxLjE5LDIyLjE3NiwyOC4xOTh6ICAgIE0zNS44MTMsMjMuNzU2YzAuODE1LDAuNjI3LDEuMDE0LDAuOTQ0LDEuNTQ3LDAuOTQ0YzAuMjM0LDAsMC45MDEtMC4wMSwxLjIxLTAuNDQxYzAuMTQ5LTAuMjA5LDAuMjA3LTAuMzQzLDAuMjMtMC40MTUgICBjLTAuMTIzLTAuMDY1LTAuMjg2LTAuMTk3LTEuMTc1LTAuMTk3QzM3LjEyLDIzLjY0OCwzNi40ODUsMjMuNjcsMzUuODEzLDIzLjc1NnogTTI4LjM0MywxNy4xNzQgICBjLTAuNzE1LDIuNDc0LTEuNjU5LDUuMTQ1LTIuNjc0LDcuNTY0YzIuMDktMC44MTEsNC4zNjItMS41MTksNi40OTYtMi4wMkMzMC44MTUsMjEuMTUsMjkuNDY2LDE5LjE5MiwyOC4zNDMsMTcuMTc0eiAgICBNMjcuNzM2LDguNzEyYy0wLjA5OCwwLjAzMy0xLjMzLDEuNzU3LDAuMDk2LDMuMjE2QzI4Ljc4MSw5LjgxMywyNy43NzksOC42OTgsMjcuNzM2LDguNzEyeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NDNEI0QzsiIGQ9Ik00OC4wMzcsNTZINy45NjNDNy4xNTUsNTYsNi41LDU1LjM0NSw2LjUsNTQuNTM3VjM5aDQzdjE1LjUzN0M0OS41LDU1LjM0NSw0OC44NDUsNTYsNDguMDM3LDU2eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0xNy4zODUsNTNoLTEuNjQxVjQyLjkyNGgyLjg5OGMwLjQyOCwwLDAuODUyLDAuMDY4LDEuMjcxLDAuMjA1ICAgIGMwLjQxOSwwLjEzNywwLjc5NSwwLjM0MiwxLjEyOCwwLjYxNWMwLjMzMywwLjI3MywwLjYwMiwwLjYwNCwwLjgwNywwLjk5MXMwLjMwOCwwLjgyMiwwLjMwOCwxLjMwNiAgICBjMCwwLjUxMS0wLjA4NywwLjk3My0wLjI2LDEuMzg4Yy0wLjE3MywwLjQxNS0wLjQxNSwwLjc2NC0wLjcyNSwxLjA0NmMtMC4zMSwwLjI4Mi0wLjY4NCwwLjUwMS0xLjEyMSwwLjY1NiAgICBzLTAuOTIxLDAuMjMyLTEuNDQ5LDAuMjMyaC0xLjIxN1Y1M3ogTTE3LjM4NSw0NC4xNjh2My45OTJoMS41MDRjMC4yLDAsMC4zOTgtMC4wMzQsMC41OTUtMC4xMDMgICAgYzAuMTk2LTAuMDY4LDAuMzc2LTAuMTgsMC41NC0wLjMzNWMwLjE2NC0wLjE1NSwwLjI5Ni0wLjM3MSwwLjM5Ni0wLjY0OWMwLjEtMC4yNzgsMC4xNS0wLjYyMiwwLjE1LTEuMDMyICAgIGMwLTAuMTY0LTAuMDIzLTAuMzU0LTAuMDY4LTAuNTY3Yy0wLjA0Ni0wLjIxNC0wLjEzOS0wLjQxOS0wLjI4LTAuNjE1Yy0wLjE0Mi0wLjE5Ni0wLjM0LTAuMzYtMC41OTUtMC40OTIgICAgYy0wLjI1NS0wLjEzMi0wLjU5My0wLjE5OC0xLjAxMi0wLjE5OEgxNy4zODV6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMi4yMTksNDcuNjgyYzAsMC44MjktMC4wODksMS41MzgtMC4yNjcsMi4xMjZzLTAuNDAzLDEuMDgtMC42NzcsMS40NzdzLTAuNTgxLDAuNzA5LTAuOTIzLDAuOTM3ICAgIHMtMC42NzIsMC4zOTgtMC45OTEsMC41MTNjLTAuMzE5LDAuMTE0LTAuNjExLDAuMTg3LTAuODc1LDAuMjE5QzI4LjIyMiw1Mi45ODQsMjguMDI2LDUzLDI3Ljg5OCw1M2gtMy44MTRWNDIuOTI0aDMuMDM1ICAgIGMwLjg0OCwwLDEuNTkzLDAuMTM1LDIuMjM1LDAuNDAzczEuMTc2LDAuNjI3LDEuNiwxLjA3M3MwLjc0LDAuOTU1LDAuOTUsMS41MjRDMzIuMTE0LDQ2LjQ5NCwzMi4yMTksNDcuMDgsMzIuMjE5LDQ3LjY4MnogICAgIE0yNy4zNTIsNTEuNzk3YzEuMTEyLDAsMS45MTQtMC4zNTUsMi40MDYtMS4wNjZzMC43MzgtMS43NDEsMC43MzgtMy4wOWMwLTAuNDE5LTAuMDUtMC44MzQtMC4xNS0xLjI0NCAgICBjLTAuMTAxLTAuNDEtMC4yOTQtMC43ODEtMC41ODEtMS4xMTRzLTAuNjc3LTAuNjAyLTEuMTY5LTAuODA3cy0xLjEzLTAuMzA4LTEuOTE0LTAuMzA4aC0wLjk1N3Y3LjYyOUgyNy4zNTJ6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zNi4yNjYsNDQuMTY4djMuMTcyaDQuMjExdjEuMTIxaC00LjIxMVY1M2gtMS42NjhWNDIuOTI0SDQwLjl2MS4yNDRIMzYuMjY2eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />;
// const iconxls = <img style={{ width: "17px", height: "inherit" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik00MzguNTU3LDUxMkgxOS43ODVjLTguMjE2LDAtMTQuODc2LTYuNjYtMTQuODc2LTE0Ljg3NlYyNTYuOTE2YzAtOC4yMTYsNi42Ni0xNC44NzYsMTQuODc2LTE0Ljg3NiAgczE0Ljg3Niw2LjY2LDE0Ljg3NiwxNC44NzZ2MjI1LjMzMmgzODkuMDIxdi0zMi44MzNjMC04LjIxNiw2LjY2MS0xNC44NzYsMTQuODc2LTE0Ljg3NmM4LjIxNSwwLDE0Ljg3Niw2LjY2LDE0Ljg3NiwxNC44NzZ2NDcuNzA5ICBDNDUzLjQzMyw1MDUuMzQsNDQ2Ljc3Miw1MTIsNDM4LjU1Nyw1MTJ6Ii8+CjxnPgoJPHBvbHlnb24gc3R5bGU9ImZpbGw6I0NGRjA5RTsiIHBvaW50cz0iMTkuNzg1LDE3Ny4xMjIgMTkuNzg1LDE3Mi4zMzIgMTc1LjU4MSwxNC44NzYgMTc1LjU4MSwxNzcuMTIyICAiLz4KCTxyZWN0IHg9IjE5Ni4xNTQiIHk9IjIxOS40MzUiIHN0eWxlPSJmaWxsOiNDRkYwOUU7IiB3aWR0aD0iMjk2LjA2MSIgaGVpZ2h0PSIxNjMuNjUiLz4KPC9nPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiM1MDdDNUM7IiBkPSJNNDkyLjIxNSwyMDQuNTU5aC0zOC43ODJWMTQuODc2QzQ1My40MzMsNi42Niw0NDYuNzcyLDAsNDM4LjU1NywwSDE3NS41ODEgICBjLTAuMTgzLDAtMC4zNjMsMC4wMjEtMC41NDYsMC4wMjdjLTAuMTY3LDAuMDA2LTAuMzMyLDAuMDEzLTAuNDk4LDAuMDI1Yy0wLjY0MywwLjA0Ni0xLjI4MiwwLjExOC0xLjkwOSwwLjI0NSAgIGMtMC4wMTMsMC4wMDMtMC4wMjcsMC4wMDctMC4wNDIsMC4wMWMtMC42MTcsMC4xMjYtMS4yMiwwLjMwNS0xLjgxNSwwLjUwOWMtMC4xNTUsMC4wNTQtMC4zMDksMC4xMDktMC40NjMsMC4xNjcgICBjLTAuNTg1LDAuMjIyLTEuMTU5LDAuNDY5LTEuNzExLDAuNzYyYy0wLjAxOSwwLjAxLTAuMDQyLDAuMDE4LTAuMDYxLDAuMDNjLTAuNTY4LDAuMzA1LTEuMTA4LDAuNjYtMS42MzUsMS4wNCAgIGMtMC4xMzUsMC4wOTgtMC4yNjgsMC4xOTYtMC40LDAuMjk5Yy0wLjUyMiwwLjQwMi0xLjAyOCwwLjgyNy0xLjQ5NywxLjNMOS4yMSwxNjEuODY4Yy0wLjM1LDAuMzUzLTAuNjc4LDAuNzIxLTAuOTg4LDEuMTA0ICAgYy0wLjIwNywwLjI1NC0wLjM4OCwwLjUyMS0wLjU3NiwwLjc4NGMtMC4wOTIsMC4xMzEtMC4xOTUsMC4yNTYtMC4yODMsMC4zODhjLTAuMjE0LDAuMzI0LTAuNDA1LDAuNjYtMC41OTIsMC45OTggICBjLTAuMDQ2LDAuMDgzLTAuMSwwLjE2Mi0wLjE0MywwLjI0NWMtMC4xODMsMC4zNDctMC4zNDIsMC43MDEtMC40OTUsMS4wNTZjLTAuMDM3LDAuMDg2LTAuMDgyLDAuMTY4LTAuMTE2LDAuMjU2ICAgYy0wLjE0LDAuMzQxLTAuMjU2LDAuNjg5LTAuMzY5LDEuMDM4Yy0wLjAzNiwwLjExMi0wLjA4LDAuMjE5LTAuMTEzLDAuMzNjLTAuMDk1LDAuMzIxLTAuMTcsMC42NDYtMC4yNDIsMC45NzEgICBjLTAuMDMzLDAuMTQ3LTAuMDc2LDAuMjkzLTAuMTA2LDAuNDQyYy0wLjA1OCwwLjMtMC4wOTUsMC42MDQtMC4xMzQsMC45MDdjLTAuMDI0LDAuMTc3LTAuMDU3LDAuMzUxLTAuMDc0LDAuNTMgICBjLTAuMDI4LDAuMzAzLTAuMDM0LDAuNjA3LTAuMDQ1LDAuOTEyYy0wLjAwNiwwLjE2Ny0wLjAyNCwwLjMzMi0wLjAyNCwwLjQ5OHY0Ljc5MmMwLDguMjE2LDYuNjYsMTQuODc2LDE0Ljg3NiwxNC44NzZoMTU1Ljc5NiAgIGM4LjIxNiwwLDE0Ljg3Ni02LjY2LDE0Ljg3Ni0xNC44NzZWMjkuNzUyaDIzMy4yMjV2MTc0LjgwN0gxOTYuMTU2Yy04LjIxNiwwLTE0Ljg3Niw2LjY2LTE0Ljg3NiwxNC44NzZ2MTYzLjY0NCAgIGMwLDguMjE2LDYuNjYsMTQuODc2LDE0Ljg3NiwxNC44NzZoMjk2LjA1OWM4LjIxNSwwLDE0Ljg3Ni02LjY2LDE0Ljg3Ni0xNC44NzZWMjE5LjQzNSAgIEM1MDcuMDkxLDIxMS4yMTksNTAwLjQzLDIwNC41NTksNDkyLjIxNSwyMDQuNTU5eiBNNTAuNjkxLDE2Mi4yNDZMMTYwLjcwNSw1MS4wNnYxMTEuMTg2SDUwLjY5MXogTTQ3Ny4zMzksMzY4LjIwM0gyMTEuMDMyICAgVjIzNC4zMTFoMjY2LjMwOFYzNjguMjAzeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik0yNTUuNjkyLDMxMy44NzVsLTE2LjA3MywyNy4zMDJjLTAuNzcxLDEuMjExLTIuMzEyLDEuNzYxLTQuMDczLDEuNzYxICAgYy00LjczNCwwLTExLjQ1LTMuNzQzLTExLjQ1LTguNDc2YzAtMC45OTEsMC4zMy0xLjk4MSwwLjk5Mi0zLjA4MmwxOS4wNDYtMjkuMzkzbC0xOC4yNzUtMjkuMjgzICAgYy0wLjc3MS0xLjIxMS0xLjEwMS0yLjMxMi0xLjEwMS0zLjQxM2MwLTQuNjIzLDYuMjc1LTguMTQ4LDExLjEyLTguMTQ4YzIuNDIyLDAsNC4wNzMsMC44ODEsNS4xNzQsMi44NjJsMTQuNjQyLDI1LjU0ICAgbDE0LjY0MS0yNS41NGMxLjEwMS0xLjk4MSwyLjc1NC0yLjg2Miw1LjE3NS0yLjg2MmM0Ljg0NCwwLDExLjEyLDMuNTIzLDExLjEyLDguMTQ4YzAsMS4xMDEtMC4zMzIsMi4yMDItMS4xMDEsMy40MTMgICBsLTE4LjI3NSwyOS4yODNsMTkuMDQ2LDI5LjM5M2MwLjY2LDEuMTAxLDAuOTkxLDIuMDkyLDAuOTkxLDMuMDgyYzAsNC43MzQtNi43MTUsOC40NzYtMTEuNDQ5LDguNDc2ICAgYy0xLjc2MSwwLTMuNDEzLTAuNTUtNC4wNzMtMS43NjFMMjU1LjY5MiwzMTMuODc1eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik0zMDEuNTk1LDM0Mi4yNzdjLTMuNzQ0LDAtNy40ODctMS43NjEtNy40ODctNS4yODR2LTcwLjAxN2MwLTMuNjMzLDQuMjk1LTUuMTc0LDguNTg2LTUuMTc0ICAgYzQuMjk1LDAsOC41ODYsMS41NDEsOC41ODYsNS4xNzR2NjAuMzI5aDI1LjFjMy4zMDQsMCw0Ljk1NSwzLjc0NCw0Ljk1NSw3LjQ4N2MwLDMuNzQzLTEuNjUxLDcuNDg2LTQuOTU1LDcuNDg2aC0zNC43ODZWMzQyLjI3N3oiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiM1MDdDNUM7IiBkPSJNMzgxLjI5NCwzMjAuN2MwLTEzLjMyMS0zNC44OTktMTEuMDEtMzQuODk5LTM2Ljc3YzAtMTYuNTE0LDE0LjQyMi0yMi43ODgsMjguMTgyLTIyLjc4OCAgIGM1LjgzNiwwLDIxLjkwOSwxLjEwMSwyMS45MDksOS42ODljMCwyLjk3Mi0xLjk4MSw5LjAyNy02LjgyNyw5LjAyN2MtMy45NjMsMC02LjA1NS00LjE4My0xNS4wODMtNC4xODMgICBjLTcuODE2LDAtMTEuMDA4LDMuMTkyLTExLjAwOCw2LjYwNWMwLDExLjAxLDM0Ljg5OSw4LjkxOCwzNC44OTksMzYuNjZjMCwxNS44NTMtMTEuNTYsMjQuNDQtMjcuNTIzLDI0LjQ0ICAgYy0xNC40MjEsMC0yNi41MzEtNy4wNDUtMjYuNTMxLTE0LjMxMmMwLTMuNzQ0LDMuMzA0LTkuMjQ4LDcuNDg2LTkuMjQ4YzUuMTc1LDAsOC40NzYsOC4xNDgsMTguNzE1LDguMTQ4ICAgQzM3NS42OCwzMjcuOTY3LDM4MS4yOTQsMzI1Ljk4NSwzODEuMjk0LDMyMC43eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik00MzMuNDczLDMxMy44NzVsLTE2LjA3MywyNy4zMDJjLTAuNzcyLDEuMjExLTIuMzEzLDEuNzYxLTQuMDczLDEuNzYxICAgYy00LjczNSwwLTExLjQ0OS0zLjc0My0xMS40NDktOC40NzZjMC0wLjk5MSwwLjMzLTEuOTgxLDAuOTkxLTMuMDgybDE5LjA0Ni0yOS4zOTNsLTE4LjI3NS0yOS4yODMgICBjLTAuNzcxLTEuMjExLTEuMTAxLTIuMzEyLTEuMTAxLTMuNDEzYzAtNC42MjMsNi4yNzYtOC4xNDgsMTEuMTItOC4xNDhjMi40MjIsMCw0LjA3MywwLjg4MSw1LjE3NSwyLjg2MmwxNC42NDIsMjUuNTQgICBsMTQuNjQyLTI1LjU0YzEuMDk5LTEuOTgxLDIuNzUyLTIuODYyLDUuMTc0LTIuODYyYzQuODQ1LDAsMTEuMTIsMy41MjMsMTEuMTIsOC4xNDhjMCwxLjEwMS0wLjMzLDIuMjAyLTEuMTAxLDMuNDEzICAgbC0xOC4yNzQsMjkuMjgzbDE5LjA0NiwyOS4zOTNjMC42NiwxLjEwMSwwLjk5MSwyLjA5MiwwLjk5MSwzLjA4MmMwLDQuNzM0LTYuNzE3LDguNDc2LTExLjQ0OSw4LjQ3NiAgIGMtMS43NjMsMC0zLjQxNC0wLjU1LTQuMDczLTEuNzYxTDQzMy40NzMsMzEzLjg3NXoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />

class ExportFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // dropdownOpen: false,
      // isClick: false,
      isLoadFinish: false,
      // divpdf: null,
      dataworkbook: null
    }
    this.exportExcelBook = this.exportExcelBook.bind(this)
    // this.toggle = this.toggle.bind(this)
  }

  // toggle() {
  //   this.setState({
  //     dropdownOpen: !this.state.dropdownOpen
  //   });
  // }
  // clearpdf = () => {
  //    this.setState({ isClick: false });
  //    this.setState({ divpdf: null });
  // }
  // onLoadPDF() {
  //   this.setState({ isClick: !this.state.isClick }, () => {
  //     console.log("onLoadPDF");
  //     this.setState({
  //       divpdf: <ExportPDF clearpdf={this.clearpdf} column={this.props.column} dataxls={this.props.dataexp} filename={this.props.filename} autocomp={this.props.autocomp} enum={this.props.enum} />

  //     });
  //   });
  // }
  async queryData() {
    if (this.props.filename) {
      this.setState({
        filename: this.props.filename + "_" + moment().format('DDMMYYYY_HHmm') + ".xlsx"
      })
    } else {
      this.setState({
        filename: moment().format('DDMMYYYY_HHmm') + ".xlsx"
      })
    }
    if(this.props.dataxls){
      this.setState({ dataxls: Clone(this.props.dataxls) }, () => {
        document.getElementById("btnLoad").click();
      })
    }else if (this.props.dataselect) {
      let dataselect = this.props.dataselect
      dataselect["l"] = 0
      let queryString = createQueryString(dataselect)
      await Axios.get(queryString).then(
        (res) => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              let datasbook = res.data.datas
              datasbook.forEach((datarow, index) => {
                for (var xfield in datarow) {
                  if (xfield === "Status") {
                    if (datarow[xfield] === 1)
                      datarow[xfield] = "Active";
                    else
                      datarow[xfield] = "Inactive";
                  }
                  if (xfield !== "Status") {
                    if (!isNaN(datarow[xfield])) {
                      if (datarow[xfield] != null)
                        datarow[xfield] = datarow[xfield].toString();
                    }
                  }
                  if (this.props.enums && this.props.autocomp) {
                    const enums = [...this.props.enum];
                    const autocomps = [...this.props.autocomp];
                    if (enums.length > 0) {
                      enums.map((item) => {
                        if (xfield === item) {
                          const getdatas = autocomps.filter(row => {
                            return row.field === xfield
                          })
                          if ((getdatas[0].data.find(x => x.ID === datarow[xfield])) !== undefined) {
                            datarow[xfield] = getdatas[0].data.find(x => x.ID === datarow[xfield]).Code
                          }
                        }
                      })
                    }
                  }
                  datarow["No."] = (index + 1).toString();
                }
              })
              this.setState({ dataxls: datasbook }, () => {
                document.getElementById("btnLoad").click();
              })
            }
          }
        })
    }
  }

  onHandleClick(event) {
    event.preventDefault();
    console.log("genbtnload");
  }
  exportExcelBook() {
    return (
      <div>
        <Workbook filename={this.state.filename} element={<div id='btnLoad' onclick={this.onHandleClick}></div>}>
          <Workbook.Sheet data={this.state.dataxls} name="Sheet 1">
            {this.props.column.map((item) =>
              <Workbook.Column label={item.Header} value={item.accessor === undefined ? item.Header : item.accessor} />
            )}
          </Workbook.Sheet>
        </Workbook>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.exportExcelBook()}
        <Button color="warning" style={{ width: 130, marginRight: '3px' }} className="float-right" onClick={() => {
          this.queryData()
        }}>{iconprint} Export Excel</Button>
        {/* <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className="float-right">
          <DropdownToggle caret color="warning">{iconprint} Export File</DropdownToggle>
          <DropdownMenu>
           */}
        {/* <ExportXSL column={this.props.column} btnloadfile={divclick} dataxls={this.props.dataexp} dataselect={this.props.dataselect} filename={this.props.filename} autocomp={this.props.autocomp} enum={this.props.enum} /> */}
        {/* <DropdownItem onClick={() => {
              this.queryData()
            }}>{iconxls} EXCEL</DropdownItem> */}
        {/*<DropdownItem onClick={() => {
              this.onLoadPDF()
            }}>{iconpdf} PDF</DropdownItem>*/}
        {/* </DropdownMenu>
        </ButtonDropdown> */}

        {/* <ExportXSL column={this.props.column} dataxls={this.props.dataexp} filename={this.props.filename} autocomp={this.props.autocomp} enum={this.props.enum} />*/}
        {/*<ExportPDF onClick={() => this.setState({ checkclick: true })} load={this.state.checkclick} />*/}
        {/* {this.state.isClick ? this.state.divpdf : null} */}
      </div>
    )
  }

}

export default ExportFile
