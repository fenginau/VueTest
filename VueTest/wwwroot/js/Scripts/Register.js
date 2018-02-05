var Register = function() {
    var self = this;
    this.routes = [];
    this.router = null;
    this.modules = ['home', 'chat'];
    this.registeredModules = [];
    this.moduleCount = 0;
    this.registerTimer = setTimeout(function() {
            var missedModule = [];
            if (self.registeredModules.length < self.modules.length) {
                self.modules.forEach((module) => {
                    if (!self.registeredModules.includes(module)) {
                        missedModule.push(module);
                    }
                });
                console.log('Cannot find module(s) [' + missedModule.join(', ') + '].');
            }
        },
        1000);
};
Register.prototype.registerModule = function(module, obj) {
    if (this.modules.includes(module)) {
        this.moduleCount++;
        this.registeredModules.push(module);
        this.routes.push({ path: '/' + module, component: obj });
    } else {
        console.log('Module [' + module + '] is not registered.');
    }
    if (this.moduleCount >= this.modules.length) {
        this.mountVue();
    }
};
Register.prototype.mountVue = function() {
    var routes = this.routes;
    var hubProxy = new HubProxy(g_signalrBaseUrl, g_hardwareId);
    var app = new Vue({
        data: {
            activeIndex: 'home',
            profile: {},
            showLogin: true
        },
        methods: {
            show: function() {
                this.visible = true;
            },
            handleSelect: function(key, keyPath) {
                this.goto(key);
            },
            goBack: function() {
                window.history.length > 1
                    ? this.$router.go(-1)
                    : this.$router.push('/');
            },
            goto: function (key) {
                this.$router.push(key);
                this.activeIndex = key;
            }
        },
        beforeCreate: function () {
            var self = this;
            self.hubProxy = hubProxy;
            self.hubProxy.setScope(self);
            self.hubProxy.startConnection();
            apiFactory.getUserProfile().then(function (response) {
                self.profile = response.data;
            }).catch(function (error) {
                console.log(error);
            });
        },
        mounted: function () {
            var self = this;
            var path = self.$route.path;
            if (path !== undefined && path !== '/' && path !== '' && path !== null) {
                self.goto(path);
                self.activeIndex = path.match(/[^\/]+/g)[0].match(/[^\?]+/g)[0];
            } else {
                self.goto('home');
            }
        },
        router: new VueRouter({
            routes: (function () {
                routes.forEach((route) => {
                    route.props = { hubProxy: hubProxy };
                });
                return routes;
            })()
        })
    }).$mount('#app');
};
Register.prototype.getTemplate = function(path, callback) {
    $.get(path, function(htmlString) {
        callback(htmlString);
    }, 'html');
};
var register = new Register();