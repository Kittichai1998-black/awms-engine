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
function DeleteSweep(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 30, height: 30 }} {...props}>

      <path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z" />
    </SvgIcon >
  );
}
function SkipNext(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 30, height: 30 }} {...props}>

      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </SvgIcon >
  );
}
export { PlaylistPlay, PlaylistArrowPlay, DeleteSweep, SkipNext }
