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