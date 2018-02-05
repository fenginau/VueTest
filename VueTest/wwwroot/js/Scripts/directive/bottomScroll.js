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