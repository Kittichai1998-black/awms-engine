import iconMenuTree from "../components/AmIconMenu";
import React, { useState, useContext, useRef, useEffect } from "react";

const items = menuItems => {
  const jsonresult = JSON.parse(menuItems === "undefined" ? null : menuItems);
  let json = { items: jsonresult };
  let items = [];
  if (json === undefined || json.items === null) {
  } else {
    jsonresult.forEach(row => {
      items.push({
        text: row.name,
        language_code:row.language_code,
        icon: iconMenuTree[row.icon],
        child: row.webPages.map(res => {
          return {
            to: "/" + res.pathLV1 + "/" + res.pathLV2,
            text: res.pageName,
            language_code:res.language_code,
            iconSub: iconMenuTree[res.icon]
          };
        })
      });
    });
  }
  return items;
};

export default items;
