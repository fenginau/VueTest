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