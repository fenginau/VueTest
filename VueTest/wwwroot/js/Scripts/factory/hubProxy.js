var HubProxy = function (serverUrl, hardwareId, scope) {
    var self = this;
    this.proxyConnection = $.hubConnection();
    this.connectionId = null;
    this.proxyConnection.url = serverUrl;
    this.proxyConnection.qs = 'hardware_id=' + hardwareId + '&connection_type=1';
    this.scope = scope;
    //chat
    this.chatProxy = this.proxyConnection.createHubProxy('notificationHub');

    //listener
    this.chatProxy.on('broadcastMessage', function (message) {
        self.scope.$emit('broadcastMessage', message);
    });
};

HubProxy.prototype.setScope = function(scope) {
    this.scope = scope;
};

HubProxy.prototype.startConnection = function() {
    var self = this;
    this.proxyConnection.start().done(function() {
        console.log('Connected to HubProxy, connection id: ' + self.proxyConnection.id);
        self.connectionId = self.proxyConnection.id;
    }).fail(function() {
        console.log("Could not connect to HubProxy");
        console.log(err);
        self.connectionId = null;
    });
};

HubProxy.prototype.stopConnection = function() {
    console.log('Stop HubProxy connection.');
    this.proxyConnection.stop();
    this.connectionId = null;
};

//chat
//invokers
HubProxy.prototype.sendMessage = function (message, errorCallBack) {
    this.chatProxy.invoke('sendMessageToEtp', g_hardwareId, message).fail(function (err) {
        console.log('Failed to send the mesage.');
        errorCallBack(err);
        this.scope.$message({
            showClose: true,
            message: 'Oops, this is a error message.',
            type: 'error',
            duration: 5000
        });
    });
};

//listeners
HubProxy.prototype.onNewMessage = function (scope, callback) {
    var self = this;
    if (scope.newMessageHandler === undefined || scope.newMessageHandler === null) {
        scope.newMessageHandler = self.chatProxy.on('newMessage', function (data) {
            callback(data);
        });
        scope.$on('destroy', function () {
            self.chatProxy.off('newMessage');
            scope.newMessageHandler = null;
        });
    }
};