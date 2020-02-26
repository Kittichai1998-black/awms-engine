import React from 'react'
import { withTranslation } from 'react-i18next'

export default withTranslation()((props) => {
  let textInitial
  if (Array.isArray(props.children)) {
    textInitial = props.children.join("")
  } else {
    textInitial = props.children
  }
  let findColon = textInitial.split(":")
  let textShow = findColon.reduce((textAll, text) => textAll += props.t(text.trim(), text.trim() ? text.trim() + " - Not Translate" : "") + " : ", "")
  textShow = textShow.substring(0, textShow.length - 2);
  // return <label style={props.style}>{props.t(props.code || "", props.children + " - Not Translate")}{props.append}</label>
  return <label style={props.style}>{textShow}</label>
}
)