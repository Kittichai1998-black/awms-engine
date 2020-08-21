import React from "react";
import SvgIcon from '@material-ui/core/SvgIcon';

function PlaylistPlay(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 30, height: 30 }} {...props}>
      <path d="M19 9H2v2h17V9zm0-4H2v2h17V5zM2 15h13v-2H2v2zm15-2v6l5-3-5-3z" />
    </SvgIcon>
  );
}
function PlaylistArrowPlay(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 30, height: 30 }} {...props}>

      <path d="M8 5v14l11-7z" />
    </SvgIcon >
  );
}
export { PlaylistPlay, PlaylistArrowPlay }
