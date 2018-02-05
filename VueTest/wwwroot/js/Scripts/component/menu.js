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