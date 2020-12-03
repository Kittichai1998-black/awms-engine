import iconMenuTree from "../components/AmIconMenu";

const items = menuItems => {
  const jsonresult = JSON.parse(menuItems === "undefined" ? null : menuItems);
  let json = { items: jsonresult };
  let items = [];
  if (json === undefined || json.items === null) {
  } else {
    jsonresult.forEach(row => {
      items.push({
        text: row.Name,
        language_code: row.language_code,
        icon: iconMenuTree[row.Icon],
        child: row.WebPages.map(res => {
          return {
            to: "/" + res.PathLV1 + "/" + res.PathLV2,
            text: res.pageName,
            language_code: res.language_code,
            iconSub: iconMenuTree[res.Icon],
            visible: res.Visible
          };
        })
      });
    });
  }
  return items;
};

export default items;
