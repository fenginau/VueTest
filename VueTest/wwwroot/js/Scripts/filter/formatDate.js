Vue.filter('formatDate', function(value, format) {
    if (value) {
        return moment(String(value)).format(format);
    }
});