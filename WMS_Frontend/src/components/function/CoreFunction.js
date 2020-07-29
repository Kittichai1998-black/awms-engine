import React, { Component } from "react";
import Axios from "axios";
import { Redirect } from "react-router-dom";
import moment from "moment";
// import * as Status from '../Warehouse/Status';
import queryString from "query-string";

const SettimeAlert = () => {
  //setTimeout(function () {
  //    window.location.replace("/login");
  //}, 2500);
};

class apicall {
  get(url) {
    window.loading.onLoading();
    return Axios.get(url + "&token=" + localStorage.getItem("Token")).then(
      res => {
        window.loading.onLoaded();
        if (res.data._result.status === 0) {
          if (res.data._result.code === "A0001") {
            sessionStorage.clear();
            localStorage.clear();
            SettimeAlert();
          } else {
          }
        }
        return res;
      }
    );
  }
  getload(url, filename, typeLoad) {
    window.loading.onLoading();
    return Axios.get(url + "&token=" + localStorage.getItem("Token"), { responseType: "blob" }).then(
      res => {
        window.loading.onLoaded();
        if (typeLoad === "preview") {
          var file = new Blob([res.data], { type: 'application/pdf' });
          if (file) {
            var fileURL = URL.createObjectURL(file);
            window.open(fileURL);
            window.URL.revokeObjectURL(fileURL);
          }
        } else {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      });
  }
  post(url, dataR) {
    window.loading.onLoading();
    let data = trimObj(dataR);
    if (data !== undefined) {
      data.token = localStorage.getItem("Token");
    }
    return Axios.post(url, data).then(res => {
      window.loading.onLoaded();
      if (res.data._result.status === 0) {
        if (res.data._result.code === "A0001") {
          sessionStorage.clear();
          localStorage.clear();
          SettimeAlert();
        } else {
        }
      }
      return res;
    });
  }
  postload(url, dataR, filename, typeLoad) {
    window.loading.onLoading();
    let data = trimObj(dataR);
    if (data !== undefined) {
      data.token = localStorage.getItem("Token");
    }
    return Axios.post(url, data, { responseType: "blob" }).then(res => {
      window.loading.onLoaded();
      if (typeLoad === "preview") {
        var file = new Blob([res.data], { type: 'application/pdf' });
        if (file) {
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          window.URL.revokeObjectURL(fileURL);
        }
      } else {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  }
  put(url, dataR) {
    window.loading.onLoading();
    let data = trimObj(dataR);
    data.token = localStorage.getItem("Token");
    return Axios.put(url, data).then(res => {
      window.loading.onLoaded();
      if (res.data._result.status === 0) {
        if (res.data._result.code === "A0001") {
          sessionStorage.clear();
          localStorage.clear();
          SettimeAlert();
        } else {
        }
      }
      return res;
    });
  }

  delete(url, dataR) {
    window.loading.onLoading();
    let data = trimObj(dataR);
    data.token = localStorage.getItem("Token");
    return Axios.delete(url, data).then(res => {
      window.loading.onLoaded();
      if (res.data._result.status === 0) {
        if (res.data._result.code === "A0001") {
          sessionStorage.clear();
          localStorage.clear();
          SettimeAlert();
          SettimeAlert();
        } else {
        }
      }
      return res;
    });
  }

  all(utlArray) {
    return Axios.all(utlArray).then(res => {
      return res;
    });
  }
}

const createQueryString = select => {
  let queryS =
    select.queryString +
    (select.t === "" ? "?" : "?t=" + select.t) +
    (select.q === "" ? "" : "&q=" + encodeURIComponent(select.q)) +
    (select.f === "" ? "" : "&f=" + encodeURIComponent(select.f)) +
    (select.g === "" ? "" : "&g=" + encodeURIComponent(select.g)) +
    (select.s === "" ? "" : "&s=" + encodeURIComponent(select.s)) +
    (select.sk === "" ? "" : "&sk=" + encodeURIComponent(select.sk)) +
    (select.l === 0 ? "" : "&l=" + encodeURIComponent(select.l)) +
    (select.all === "" ? "" : "&all=" + encodeURIComponent(select.all)) +
    "&isCounts=true";
  return queryS;
};

const IsEmptyObject = (obj) => {
  if (typeof (obj) === "object")
    return Object.keys(obj).length === 0 && obj.constructor === Object
  else
    return false;
}

const Clone = obj => {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = Clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = Clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

const DateTimeConverter = (value, format) => {
  const date = moment(value);
  return date.format(format);
};

// const GenerateDropDownStatus = (status) => {
//     let statusList = []
//     statusList.push({ 'value': "*", 'label': "All" })
//     Status[status].forEach(row => {
//         statusList.push({ 'value': row.code, 'label': row.status })
//     })
//     return statusList
// }

function FilterURL(seacrhlocation, select) {
  const search = queryString.parse(encodeURI(seacrhlocation));
  var url = select;
  var sel = [];
  if (url.q) {
    sel = JSON.parse(url.q);
  }
  for (let value in search) {
    if (search[value]) {
      if (search[value] !== "") {
        sel.push({
          f: value,
          c: "like",
          v: "*" + encodeURIComponent(search[value]) + "*"
        });
      }
    }
  }
  url["q"] = JSON.stringify(sel);
  return url;
}

function trimObj(obj) {
  if (obj === null) {
    return null;
  }

  if (!Array.isArray(obj) && typeof obj != "object") return obj;
  return Object.keys(obj).reduce(
    function (acc, key) {
      acc[key.trim()] =
        typeof obj[key] == "string" ? obj[key].trim() : trimObj(obj[key]);
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
}

export { apicall, createQueryString, Clone, DateTimeConverter, FilterURL, IsEmptyObject };
