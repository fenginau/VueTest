var RestService = function(authString) {
    axios.default.baseURL = g_apiBaseUrl;
    axios.defaults.headers.common['Authorization'] = authString;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    this.http = axios;
};

RestService.prototype.get = function(url) {
    return this.http.get(axios.default.baseURL + url);
};

var restService = new RestService('Basic ' + Base64.encode(g_hardwareId + ':0101'));
var apiFactory = {
    //chat
    getChat: function(convId) {
        return restService.get('messageapi/getchat/' + g_hardwareId + '/' + convId + '?' + new Date().getTime());
    },

    getUserProfile: function() {
        return restService.get('profileapi/getprofile/' + g_hardwareId);
    }
};

//usage
//apiFactory.getUserProfile().then(function (response) {
//    console.log(response);
//}).catch(function (error) {
//    console.log(error);
//});

//apiFactory.getChat().then(function (response) {
//    console.log(response);
//}).catch(function (error) {
//    console.log(error);
//});