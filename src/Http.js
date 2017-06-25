import $ from '../node_modules/jquery';

export default class Http {
   
    ajax(url, method, data, callback, type) {

        if ($.isFunction(data)) {
            type = type || callback,
                callback = data,
                data = {}
        }

        if (typeof (url) == "object")
            return $.ajax(url);

        return $.ajax({
            url: url,
            type: method,
            success: callback,
            data: data,
            contentType: type
        });
    }

    get(url, data, callback, contentType) {
        return this.ajax(url, 'GET', data, callback, contentType);
    }

    put(url, data, callback, contentType) {
        return this.ajax(url, 'PUT', data, callback, contentType);
    }

    post(url, data, callback, contentType) {
        return this.ajax(url, 'POST', data, callback, contentType);
    }

    delete(url, data, callback, contentType) {
        return this.ajax(url, 'DELETE', data, callback, contentType);
    }
}