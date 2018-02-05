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