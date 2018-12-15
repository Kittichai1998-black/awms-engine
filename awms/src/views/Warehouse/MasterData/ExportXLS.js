import React, { Component } from 'react';
import Workbook from 'react-excel-workbook'
import _ from 'lodash'
import { apicall, Clone } from '../ComponentCore'
import { Button, DropdownItem } from 'reactstrap';
import moment from 'moment';

const iconxls = <img style={{ width: "17px", height: "inherit" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik00MzguNTU3LDUxMkgxOS43ODVjLTguMjE2LDAtMTQuODc2LTYuNjYtMTQuODc2LTE0Ljg3NlYyNTYuOTE2YzAtOC4yMTYsNi42Ni0xNC44NzYsMTQuODc2LTE0Ljg3NiAgczE0Ljg3Niw2LjY2LDE0Ljg3NiwxNC44NzZ2MjI1LjMzMmgzODkuMDIxdi0zMi44MzNjMC04LjIxNiw2LjY2MS0xNC44NzYsMTQuODc2LTE0Ljg3NmM4LjIxNSwwLDE0Ljg3Niw2LjY2LDE0Ljg3NiwxNC44NzZ2NDcuNzA5ICBDNDUzLjQzMyw1MDUuMzQsNDQ2Ljc3Miw1MTIsNDM4LjU1Nyw1MTJ6Ii8+CjxnPgoJPHBvbHlnb24gc3R5bGU9ImZpbGw6I0NGRjA5RTsiIHBvaW50cz0iMTkuNzg1LDE3Ny4xMjIgMTkuNzg1LDE3Mi4zMzIgMTc1LjU4MSwxNC44NzYgMTc1LjU4MSwxNzcuMTIyICAiLz4KCTxyZWN0IHg9IjE5Ni4xNTQiIHk9IjIxOS40MzUiIHN0eWxlPSJmaWxsOiNDRkYwOUU7IiB3aWR0aD0iMjk2LjA2MSIgaGVpZ2h0PSIxNjMuNjUiLz4KPC9nPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiM1MDdDNUM7IiBkPSJNNDkyLjIxNSwyMDQuNTU5aC0zOC43ODJWMTQuODc2QzQ1My40MzMsNi42Niw0NDYuNzcyLDAsNDM4LjU1NywwSDE3NS41ODEgICBjLTAuMTgzLDAtMC4zNjMsMC4wMjEtMC41NDYsMC4wMjdjLTAuMTY3LDAuMDA2LTAuMzMyLDAuMDEzLTAuNDk4LDAuMDI1Yy0wLjY0MywwLjA0Ni0xLjI4MiwwLjExOC0xLjkwOSwwLjI0NSAgIGMtMC4wMTMsMC4wMDMtMC4wMjcsMC4wMDctMC4wNDIsMC4wMWMtMC42MTcsMC4xMjYtMS4yMiwwLjMwNS0xLjgxNSwwLjUwOWMtMC4xNTUsMC4wNTQtMC4zMDksMC4xMDktMC40NjMsMC4xNjcgICBjLTAuNTg1LDAuMjIyLTEuMTU5LDAuNDY5LTEuNzExLDAuNzYyYy0wLjAxOSwwLjAxLTAuMDQyLDAuMDE4LTAuMDYxLDAuMDNjLTAuNTY4LDAuMzA1LTEuMTA4LDAuNjYtMS42MzUsMS4wNCAgIGMtMC4xMzUsMC4wOTgtMC4yNjgsMC4xOTYtMC40LDAuMjk5Yy0wLjUyMiwwLjQwMi0xLjAyOCwwLjgyNy0xLjQ5NywxLjNMOS4yMSwxNjEuODY4Yy0wLjM1LDAuMzUzLTAuNjc4LDAuNzIxLTAuOTg4LDEuMTA0ICAgYy0wLjIwNywwLjI1NC0wLjM4OCwwLjUyMS0wLjU3NiwwLjc4NGMtMC4wOTIsMC4xMzEtMC4xOTUsMC4yNTYtMC4yODMsMC4zODhjLTAuMjE0LDAuMzI0LTAuNDA1LDAuNjYtMC41OTIsMC45OTggICBjLTAuMDQ2LDAuMDgzLTAuMSwwLjE2Mi0wLjE0MywwLjI0NWMtMC4xODMsMC4zNDctMC4zNDIsMC43MDEtMC40OTUsMS4wNTZjLTAuMDM3LDAuMDg2LTAuMDgyLDAuMTY4LTAuMTE2LDAuMjU2ICAgYy0wLjE0LDAuMzQxLTAuMjU2LDAuNjg5LTAuMzY5LDEuMDM4Yy0wLjAzNiwwLjExMi0wLjA4LDAuMjE5LTAuMTEzLDAuMzNjLTAuMDk1LDAuMzIxLTAuMTcsMC42NDYtMC4yNDIsMC45NzEgICBjLTAuMDMzLDAuMTQ3LTAuMDc2LDAuMjkzLTAuMTA2LDAuNDQyYy0wLjA1OCwwLjMtMC4wOTUsMC42MDQtMC4xMzQsMC45MDdjLTAuMDI0LDAuMTc3LTAuMDU3LDAuMzUxLTAuMDc0LDAuNTMgICBjLTAuMDI4LDAuMzAzLTAuMDM0LDAuNjA3LTAuMDQ1LDAuOTEyYy0wLjAwNiwwLjE2Ny0wLjAyNCwwLjMzMi0wLjAyNCwwLjQ5OHY0Ljc5MmMwLDguMjE2LDYuNjYsMTQuODc2LDE0Ljg3NiwxNC44NzZoMTU1Ljc5NiAgIGM4LjIxNiwwLDE0Ljg3Ni02LjY2LDE0Ljg3Ni0xNC44NzZWMjkuNzUyaDIzMy4yMjV2MTc0LjgwN0gxOTYuMTU2Yy04LjIxNiwwLTE0Ljg3Niw2LjY2LTE0Ljg3NiwxNC44NzZ2MTYzLjY0NCAgIGMwLDguMjE2LDYuNjYsMTQuODc2LDE0Ljg3NiwxNC44NzZoMjk2LjA1OWM4LjIxNSwwLDE0Ljg3Ni02LjY2LDE0Ljg3Ni0xNC44NzZWMjE5LjQzNSAgIEM1MDcuMDkxLDIxMS4yMTksNTAwLjQzLDIwNC41NTksNDkyLjIxNSwyMDQuNTU5eiBNNTAuNjkxLDE2Mi4yNDZMMTYwLjcwNSw1MS4wNnYxMTEuMTg2SDUwLjY5MXogTTQ3Ny4zMzksMzY4LjIwM0gyMTEuMDMyICAgVjIzNC4zMTFoMjY2LjMwOFYzNjguMjAzeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik0yNTUuNjkyLDMxMy44NzVsLTE2LjA3MywyNy4zMDJjLTAuNzcxLDEuMjExLTIuMzEyLDEuNzYxLTQuMDczLDEuNzYxICAgYy00LjczNCwwLTExLjQ1LTMuNzQzLTExLjQ1LTguNDc2YzAtMC45OTEsMC4zMy0xLjk4MSwwLjk5Mi0zLjA4MmwxOS4wNDYtMjkuMzkzbC0xOC4yNzUtMjkuMjgzICAgYy0wLjc3MS0xLjIxMS0xLjEwMS0yLjMxMi0xLjEwMS0zLjQxM2MwLTQuNjIzLDYuMjc1LTguMTQ4LDExLjEyLTguMTQ4YzIuNDIyLDAsNC4wNzMsMC44ODEsNS4xNzQsMi44NjJsMTQuNjQyLDI1LjU0ICAgbDE0LjY0MS0yNS41NGMxLjEwMS0xLjk4MSwyLjc1NC0yLjg2Miw1LjE3NS0yLjg2MmM0Ljg0NCwwLDExLjEyLDMuNTIzLDExLjEyLDguMTQ4YzAsMS4xMDEtMC4zMzIsMi4yMDItMS4xMDEsMy40MTMgICBsLTE4LjI3NSwyOS4yODNsMTkuMDQ2LDI5LjM5M2MwLjY2LDEuMTAxLDAuOTkxLDIuMDkyLDAuOTkxLDMuMDgyYzAsNC43MzQtNi43MTUsOC40NzYtMTEuNDQ5LDguNDc2ICAgYy0xLjc2MSwwLTMuNDEzLTAuNTUtNC4wNzMtMS43NjFMMjU1LjY5MiwzMTMuODc1eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik0zMDEuNTk1LDM0Mi4yNzdjLTMuNzQ0LDAtNy40ODctMS43NjEtNy40ODctNS4yODR2LTcwLjAxN2MwLTMuNjMzLDQuMjk1LTUuMTc0LDguNTg2LTUuMTc0ICAgYzQuMjk1LDAsOC41ODYsMS41NDEsOC41ODYsNS4xNzR2NjAuMzI5aDI1LjFjMy4zMDQsMCw0Ljk1NSwzLjc0NCw0Ljk1NSw3LjQ4N2MwLDMuNzQzLTEuNjUxLDcuNDg2LTQuOTU1LDcuNDg2aC0zNC43ODZWMzQyLjI3N3oiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiM1MDdDNUM7IiBkPSJNMzgxLjI5NCwzMjAuN2MwLTEzLjMyMS0zNC44OTktMTEuMDEtMzQuODk5LTM2Ljc3YzAtMTYuNTE0LDE0LjQyMi0yMi43ODgsMjguMTgyLTIyLjc4OCAgIGM1LjgzNiwwLDIxLjkwOSwxLjEwMSwyMS45MDksOS42ODljMCwyLjk3Mi0xLjk4MSw5LjAyNy02LjgyNyw5LjAyN2MtMy45NjMsMC02LjA1NS00LjE4My0xNS4wODMtNC4xODMgICBjLTcuODE2LDAtMTEuMDA4LDMuMTkyLTExLjAwOCw2LjYwNWMwLDExLjAxLDM0Ljg5OSw4LjkxOCwzNC44OTksMzYuNjZjMCwxNS44NTMtMTEuNTYsMjQuNDQtMjcuNTIzLDI0LjQ0ICAgYy0xNC40MjEsMC0yNi41MzEtNy4wNDUtMjYuNTMxLTE0LjMxMmMwLTMuNzQ0LDMuMzA0LTkuMjQ4LDcuNDg2LTkuMjQ4YzUuMTc1LDAsOC40NzYsOC4xNDgsMTguNzE1LDguMTQ4ICAgQzM3NS42OCwzMjcuOTY3LDM4MS4yOTQsMzI1Ljk4NSwzODEuMjk0LDMyMC43eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzUwN0M1QzsiIGQ9Ik00MzMuNDczLDMxMy44NzVsLTE2LjA3MywyNy4zMDJjLTAuNzcyLDEuMjExLTIuMzEzLDEuNzYxLTQuMDczLDEuNzYxICAgYy00LjczNSwwLTExLjQ0OS0zLjc0My0xMS40NDktOC40NzZjMC0wLjk5MSwwLjMzLTEuOTgxLDAuOTkxLTMuMDgybDE5LjA0Ni0yOS4zOTNsLTE4LjI3NS0yOS4yODMgICBjLTAuNzcxLTEuMjExLTEuMTAxLTIuMzEyLTEuMTAxLTMuNDEzYzAtNC42MjMsNi4yNzYtOC4xNDgsMTEuMTItOC4xNDhjMi40MjIsMCw0LjA3MywwLjg4MSw1LjE3NSwyLjg2MmwxNC42NDIsMjUuNTQgICBsMTQuNjQyLTI1LjU0YzEuMDk5LTEuOTgxLDIuNzUyLTIuODYyLDUuMTc0LTIuODYyYzQuODQ1LDAsMTEuMTIsMy41MjMsMTEuMTIsOC4xNDhjMCwxLjEwMS0wLjMzLDIuMjAyLTEuMTAxLDMuNDEzICAgbC0xOC4yNzQsMjkuMjgzbDE5LjA0NiwyOS4zOTNjMC42NiwxLjEwMSwwLjk5MSwyLjA5MiwwLjk5MSwzLjA4MmMwLDQuNzM0LTYuNzE3LDguNDc2LTExLjQ0OSw4LjQ3NiAgIGMtMS43NjMsMC0zLjQxNC0wLjU1LTQuMDczLTEuNzYxTDQzMy40NzMsMzEzLjg3NXoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />

class ExportXLS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: "",
      dataxls: [],
      enum: [],
      autocomp: []
    }
    this.exportExcelBook = this.exportExcelBook.bind(this)
    this.queryInitialData = this.queryInitialData.bind(this)
    this.queryInitialDataStatus = this.queryInitialDataStatus.bind(this)
  }
  componentDidMount() {
    //console.log(this.props.column);
    if (this.props.dataxls) {
      this.setState({ dataxls: Clone(this.props.dataxls) }, () => {
        if (this.props.enum && this.props.autocomp) {
          this.setState({ enum: Clone(this.props.enum) }, () =>
            this.setState({ autocomp: Clone(this.props.autocomp) }, () =>
              this.queryInitialData()))
        } else {
          this.queryInitialDataStatus()
        }
      })
    }

    if (this.props.filename) {
      this.setState({
        filename: this.props.filename + "_" + moment().format('DDMMYYYY_HHmm') + ".xlsx"
      })
    } else {
      this.setState({
        filename: moment().format('DDMMYYYY_HHmm') + ".xlsx"
      })
    }
  }
  queryInitialDataStatus() {
    //console.log("CheckStatus");
    //console.log(this.state.dataxls);
    const datas = [...this.state.dataxls];
    if (datas.length > 0) {
      datas.forEach((datarow) => {
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

        }
      })
      this.setState({ dataxls: datas })
    }
  }
  queryInitialData() {
    //console.log(this.state.dataxls);
    //console.log(this.state.enum);
    //console.log(this.state.autocomp);
    const datas = [...this.state.dataxls];
    const enums = [...this.state.enum];
    const autocomps = [...this.state.autocomp];
    if (datas.length > 0) {
      datas.forEach((datarow) => {
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
      })
      this.setState({ dataxls: datas })
    }
  }

  exportExcelBook() {
    return (
      <div>
        <Workbook filename={this.state.filename} element={<DropdownItem>{iconxls} Excel</DropdownItem>}>
          <Workbook.Sheet data={this.state.dataxls} name="Sheet 1">
            {this.props.column.map((item) =>
              <Workbook.Column label={item.Header} value={item.accessor} />
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
      </div>
    )
  }

}
export default ExportXLS
