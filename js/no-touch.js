$.fn.noTouch = function() {

    function init($this) {

        (function () {
            for (var i = 0; i < 3; i++) {
                var $handle = $('<div></div>')
                    .addClass('touch-handle')
                    .text(i + 1)
                    .attr('id', 'handle-' + i);
                $handle.append($('<div class="touch"></div>').text('toggle'));
                $this.append($handle);
            }
        })();

        var mouseDownStart;
        var $handle;
        var originalPosition = null;

        var touches = {};

        function getTouchList() {
            var res = [];
            for (var key in touches) {
                if (touches.hasOwnProperty(key)) {
                    res.push(touches[key]);
                }
            }
            return res;
        }

        function triggerTouch($handle, touchEventName) {
            var touchEvent = $.Event(touchEventName);
            touchEvent.originalEvent = {
                touches: getTouchList()
            };
            $handle.trigger(touchEvent);
        }

        function getMousePosition(ev) {
            return {
                x: ev.clientX,
                y: ev.clientY
            };
        }


        function getDragVector(ev) {
            var pos = getMousePosition(ev);

            return {
                x: pos.x - mouseDownStart.x,
                y: pos.y - mouseDownStart.y
            };
        }

        function calcPosition(vector) {
            var res = {
                y: vector.y + originalPosition.top,
                x: vector.x + originalPosition.left
            }

            return res;
        }

        function dragMove(ev) {
            var vector = getDragVector(ev);

            var pos = calcPosition(vector);

            $handle.css({
                top: pos.y,
                left: pos.x
            });
        }

        function createTouch($handle) {
            var key = $handle.attr('id');
            var pos = $handle.position();
            return {
                identifier: key,
                clientX: pos.left,
                clientY: pos.top
            };
        }

        var mouseDown = false;
        $this.on('mousedown', '.touch-handle', function (ev) {
            var $target = $(ev.target);
            mouseDownStart = getMousePosition(ev);
            $handle = $target;
            originalPosition = $handle.position();
            mouseDown = true;
            return false;
        }).bind('mousemove', function (mouseEvent) {
            if (mouseDown) {
                dragMove(mouseEvent);

                var key = $handle.attr('id');
                if (touches[key]) {
                    touches[key] = createTouch($handle);

                    triggerTouch($handle, 'touchmove');
                }
                return false;
            }
        }).bind('mouseup', function () {
            if (mouseDown) {
                mouseDown = false;
                return false;
            }
        });

        $this.on('click', '.touch-handle .touch', function (mouseEvent) {
            var $lnk = $(mouseEvent.target);
            var $handle = $lnk.closest('.touch-handle');
            var key = $handle.attr('id');

            if ($handle.hasClass('touched')) {
                $handle.removeClass('touched');
                delete touches[key];
                triggerTouch($handle, 'touchend');
            } else {
                $handle.addClass('touched');
                touches[key] = createTouch($handle);
                triggerTouch($handle, 'mousestart');
            }

        });

        return {

        };
    }

    var data = $(this).data('notouch');
    if (!data) {
        data = init($(this));
        $(this).data('notouch', data);
    }
    return data;
};
