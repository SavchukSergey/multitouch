$.fn.noTouch = function () {

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
        var $draggingHandle;
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

        function createTouch($handle) {
            var key = $handle.attr('id');
            var pos = $handle.position();
            return {
                identifier: key,
                clientX: pos.left,
                clientY: pos.top
            };
        }

        function triggerTouch($handle, touchEventName) {
            var touchEvent = $.Event(touchEventName);
            touchEvent.originalEvent = {
                touches: getTouchList()
            };
            $handle.trigger(touchEvent);
        }

        function untouchHandle($handle) {
            if ($handle.hasClass('touched')) {
                var key = $handle.attr('id');
                $handle.removeClass('touched');
                delete touches[key];
                triggerTouch($handle, 'touchend');
            }
        }

        function touchHandle($handle) {
            if (!$handle.hasClass('touched')) {
                var key = $handle.attr('id');
                $handle.addClass('touched');
                touches[key] = createTouch($handle);
                triggerTouch($handle, 'mousestart');
            }
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

            $draggingHandle.css({
                top: pos.y,
                left: pos.x
            });
        }

        var mouseDown = false;

        function onMouseDown(ev, $handle) {
            mouseDownStart = getMousePosition(ev);
            originalPosition = $handle.position();
            mouseDown = true;
            $draggingHandle = $handle;
        }

        $this.on('mousedown', '.touch-handle', function (ev) {
            onMouseDown(ev, $(ev.target));
            return false;
        }).on('mousedown', function (ev) {
            $this.find('.touch-handle.touched').each(function() {
                untouchHandle($(this));
            });
            var $handle = $this.find('.touch-handle').eq(0);

            var containerPos = $this.offset();
            $handle.css({
                top: ev.clientY - containerPos.top,
                left: ev.clientX - containerPos.left
            });
            touchHandle($handle);
            onMouseDown(ev, $handle);
            return false;
        });

        $(document).bind('mousemove', function (mouseEvent) {
            if (mouseDown) {
                dragMove(mouseEvent);

                var key = $draggingHandle.attr('id');
                if (touches[key]) {
                    touches[key] = createTouch($draggingHandle);

                    triggerTouch($draggingHandle, 'touchmove');
                }
                return false;
            }
            return true;
        }).bind('mouseup', function () {
            if (mouseDown) {
                mouseDown = false;
                return false;
            }
            return true;
        });

        $this.on('click', '.touch-handle .touch', function (mouseEvent) {
            var $lnk = $(mouseEvent.target);
            var $handle = $lnk.closest('.touch-handle');

            if ($handle.hasClass('touched')) {
                untouchHandle($handle);
            } else {
                touchHandle($handle);
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
