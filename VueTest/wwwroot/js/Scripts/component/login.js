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