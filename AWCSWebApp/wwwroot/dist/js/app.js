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


    if (dataExport.length == 0) {
        alert('ไม่พบข้อมูล');
        return;
    }
    console.log('dataExport', dataExport)
    var EXCEL_EXTENSION = '.xlsx';
    const fileName = title + new Date().toISOString().substring(0, 19).replace("T", " ") + EXCEL_EXTENSION;

    //const headers = headers;

    if (typeof XLSX == 'undefined') XLSX = require('xlsx');
    //var ws = XLSX.utils.json_to_sheet(dataExport);

    dataExport.unshift(headers);

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(dataExport, { origin: 'A2', skipHeader: Object.keys(headers).length > 0 });
    XLSX.utils.sheet_add_aoa(ws, [
        [title]
    ], { origin: 'A1' });
    //XLSX.utils.sheet_add_aoa(ws, headers);

    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, fileName);

}


app.init();