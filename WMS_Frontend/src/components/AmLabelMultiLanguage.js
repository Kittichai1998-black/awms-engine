import React from 'react'
import { withTranslation } from 'react-i18next'

export default withTranslation()((props) => {
  const { t, style, children, ...other } = props
  let textInitial
  if (Array.isArray(children)) {
    textInitial = children.join("")
  } else {
    textInitial = children
  }
  let findColon = textInitial.split(":")
  let textShow = findColon.reduce((textAll, text) => textAll += t(text.trim(), text.trim() ? text.trim() + " - Not Translate" : "") + " : ", "")
  textShow = textShow.substring(0, textShow.length - 2);
  // return <label style={style}>{t(code || "", children + " - Not Translate")}{append}</label>
  return <label style={style} {...other}>{textShow}</label>
}
)