var app = app ?? {};
app.api_url = '/v2/';
app.init = () => {
    app.load_header('menu');
    app.load_footer('cl');
    if (window.location.href.split('?').length >= 2)
        app.load_content(window.location.href.split('?')[1]);
    else
        app.load_content('home');
}

app.load_header = (page) => {
    $('header>.container').load('header.' + page + '.html');
}
app.load_content = (page) => {
    $('content>.container').load('content.' + page + '.html');
    if (page === 'home')
        window.history.pushState({}, 'AWCS : ' + page, window.location.href.split('?')[0]);
    else
        window.history.pushState({}, 'AWCS : ' + page, window.location.href.split('?')[0] + '?' + page);
}
app.load_footer = (page) => {
    $('footer>.container').load('footer.' + page + '.html');
}
app.post = (api, datas, _success, _error) => {
    $.ajax({
        type: "POST",
        url: app.api_url + api,
        data: JSON.stringify(datas),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data._result.status != 1) {
                alert(data._result.message);
                _error && _error(data);
            }
            else
                _success && _success(data);
        }
    });
}
app.get = (api, datas, _success, _error) => {
    $.get(app.api_url + api + '?' + $.param(datas),
        function (data) {
            if (data._result.status != 1) {
                alert(data._result.message);
                _error && _error(data);
            }
            else
                _success && _success(data);
        });
}

app.export_excel = function export_excel(dataExport, headers = {}, title = "") {

    console.log('dataExport', dataExport)
    if (dataExport.length == 0) {
        alert('ไม่พบข้อมูล');
        return;
    }
    
    var EXCEL_EXTENSION = '.xlsx';
    const fileName = title + new Date().toISOString().substring(0, 19).replace("T", " ") + EXCEL_EXTENSION;

    //const headers = headers;

    if (typeof XLSX == 'undefined') XLSX = require('xlsx');
    

    

    var wb = XLSX.utils.book_new();
    var bSkipHeader = Object.keys(headers).length > 0;
    var sOrigin = bSkipHeader ? 'A2' : 'A2';
    //console.log('bSkipHeader', bSkipHeader)
    
    
    if (bSkipHeader) {
        dataExport.unshift(headers);
        const arr = Object.keys(dataExport).map((key) => [key, dataExport[key]]);
        var ws = XLSX.utils.json_to_sheet(dataExport, { origin: sOrigin, skipHeader: bSkipHeader });
        ws['!cols'] = formatExcelCols(dataExport);
        XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
        XLSX.utils.book_append_sheet(wb, ws, title);
    } else {
        var ws = XLSX.utils.json_to_sheet(dataExport, { origin: sOrigin });
        const arr = Object.keys(dataExport).map((key) => [key, dataExport[key]]);
        ws['!cols'] = formatExcelCols(arr);
        XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
        XLSX.utils.book_append_sheet(wb, ws, title);
    }
    
    
    //XLSX.utils.sheet_add_aoa(ws, headers);

    
    XLSX.writeFile(wb, fileName);

}

function formatExcelCols(json) {
    let widthArr = Object.keys(json[0]).map(key=> {
        var n = key == 'rowid' ? 5 : 10;
        return { width: key.length + n } // plus 2 to account for short object keys
    })
    for (let i = 0; i < json.length; i++) {
        let value = Object.values(json[i]);
        for (let j = 0; j < value.length; j++) {
            if (value[j] !== null && value[j].length > widthArr[j].width) {
                widthArr[j].width = value[j].length;
            }
        }
    }
    return widthArr
}




app.init();