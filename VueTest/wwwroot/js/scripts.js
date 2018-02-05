Vue.directive('align', {
    inserted: function (element, binding) {
        // argument take value: flex-start|flex-end|center|space-between|space-around|initial|inherit
        var args = binding.arg.split(',');
        if (element.style.flexDirection) {
            if (args.length > 0) {
                element.style.justifyContent = args[0];
            }
            if (args.length > 1) {
                element.style.alignItems = args[1];
            }
        }
        
    }
});
Vue.directive('bottomScroll', {
    bind: (el, binding) => {
        var duration = binding.value.duration || 500;
        var isAnimated = binding.value.animate;

        var observer = new MutationObserver(scrollToBottom);
        var config = { childList: true, characterData: true };
        observer.observe(el, config);

        function animateScroll(duration) {
            var start = el.scrollTop;
            var end = el.scrollHeight;
            var change = end - start;
            var increment = 20;

            function easeInOut(currentTime, start, change, duration) {
                currentTime /= duration / 2;
                if (currentTime < 1) {
                    return change / 2 * currentTime * currentTime + start;
                }
                currentTime -= 1;
                return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
            }

            function animate(elapsedTime) {
                elapsedTime += increment;
                var position = easeInOut(elapsedTime, start, change, duration);
                el.scrollTop = position;

                if (elapsedTime < duration) {
                    setTimeout(function() {
                            animate(elapsedTime);
                        },
                        increment);
                }
            }

            animate(0);
        }

        function scrollToBottom() {
            if (isAnimated) {
                animateScroll(duration);
            } else {
                el.scrollTop = el.scrollHeight;
            }
        }
    }
});
Vue.directive('flex', {
    inserted: function (element, binding) {
        element.style.display = 'flex';
        if (binding.modifiers.flex) {
            element.style.flex = 1;
        }
        switch (binding.arg) {
            case 'row':
                element.style.flexDirection = 'row';
                break;
            case 'column':
                element.style.flexDirection = 'column';
                break;
            default:
                if (element.parentElement.flexDirection !== '') {
                    element.style.flexDirection = element.parentElement.flexDirection;
                } else {
                    element.style.flexDirection = 'column';
                }
                break;
        }
    }
});
Vue.filter('formatDate', function(value, format) {
    if (value) {
        return moment(String(value)).format(format);
    }
});
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
var login = {
    methods: {
        setLoginWindow: function() {
            
        },
        login: function() {
            console.log(this.loginForm);
        },
        forgetPassword: function() {
            console.log('forget password');
        }
    },
    data: function() {
        return {
            loginForm: {
                account: '',
                password: ''
            }
        };
    },
    mounted: function() {
    }
};

register.getTemplate('../vuetest/component/login.html', function (template) {
    login.template = template;
    Vue.component('login', login);
});
var menu = {
    props: ['menuIndex'],
    methods: {
        handleSelect: function (key, keyPath) {
            this.showMenu = false;
            this.$parent.goto(key);
        },
        setMenu: function () {
            if (window.innerWidth < 600) {
                this.menuMode = 'vertical';
            } else {
                this.menuMode = 'horizontal';
                this.showMenu = false;
            }
        }
    },
    data: function() {
        return {
            showMenu: false,
            menuMode: 'horizontal'
        };
    },
    mounted: function() {
        window.addEventListener('resize', this.setMenu);
        this.setMenu();
    }
};

register.getTemplate('../vuetest/component/menu.html', function (template) {
    menu.template = template;
    Vue.component('main-menu', menu);
});
var chat = {
    props: ['hubProxy', 'profile'],
    methods: {
        send: function () {
            var message = {
                name: this.profile.fName + ' ' + this.profile.lName,
                message: this.message,
                create_Dt: new Date(),
                isMe: true,
                type: 'text'
            };
            if (this.message !== '' && this.message !== null) {
                this.hubProxy.sendMessage(message);
                this.conversations[this.conversations.length - 1].chats.push(message);
                this.message = null;
                this.$refs.message.focus();
            }
            setTimeout(() => {
                this.scrollBottom(this.$refs.chatbox);
            }, 100);
        },
        scrollBottom: function(el) {
            el.scrollTop = el.scrollHeight;
        },
        onresize: function () {
            this.scrollBottom(this.$refs.chatbox);
        },
        enterPress: function() {
            this.send();
        }
    },
    data: function () {
        var data = {
            message: '',
            conversations: [],
            loading: false
        };
        return data;
    },
    created: function () {
        var self = this;
        self.convId = -1;

        self.loadChats = function() {
            self.loading = true;
            apiFactory.getChat(self.convId).then(function(response) {
                var conversation = response.data;
                self.convId = conversation.convId;
                self.conversations.splice(0, 0, conversation);
                conversation.chats.forEach((chat) => {
                    chat.isMe = chat.user_Id === "00000000-0000-0000-0000-000000000000";
                });
                self.loading = false;
            }).catch(function(error) {
                console.log('Could not get chats.');
                console.log(error);
                self.loading = false;
            });
        };

        self.registerEvent = function() {
            self.hubProxy.onNewMessage(self, function(message) {
                message.isMe = false;
                message.create_Dt = new Date();
                self.conversations[self.conversations.length - 1].chats.push(message);
                setTimeout(() => {
                    self.scrollBottom(self.$refs.chatbox);
                }, 100);
            });
        };

        (function() {
            self.loadChats();
            self.registerEvent();
        })();
    },
    mounted: function () {
        window.addEventListener('resize', this.onresize);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.onresize);
    },
    destroyed: function() {
        this.$emit('destroy');
    }
};

register.getTemplate('../vuetest/component/chat.html', function (template) {
    chat.template = template;
    register.registerModule('chat', chat);
});
var home = {
    methods: {
        greet: function() {
            alert('worked');
        }
    }
};

register.getTemplate('../vuetest/component/home.html', function (template) {
    home.template = template;
    register.registerModule('home', home);
});