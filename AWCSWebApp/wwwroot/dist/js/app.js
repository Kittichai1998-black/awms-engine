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


app.init();