import React from 'react'
import styled from 'styled-components'
import { withTranslation } from 'react-i18next'

import AmAux from './AmAux';

const LabelT = styled.label`
font-weight: bold;
  width: 200px;
`;


export default withTranslation()((props) => <LabelT>{props.t(props.code || "", props.children + " - Not Translate")}{props.append}</LabelT>)