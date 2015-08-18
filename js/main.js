$(document).ready(function () {

    $('.canvas').noTouch();


    var multitouch;
    var $img = $('.canvas img');
    var $editor = null;

    function refresh() {
        if (multitouch) {
            var matrix = multitouch.getResultMatrix();
            $img.css('transform', matrix.getTransformExpression());
        }
    }

    function processTouches(touches) {
        if (!$editor) return;
        if (!multitouch) {
            multitouch = new MultiTouch();
        }
        multitouch.acceptTouches(touches);
        refresh();

        $editor.toggleClass('dragging', !!touches.length);

        if (!touches.length) {
            //todo: transformation ended. Now you can use resultMatrix
            multitouch = null;
        }
    }

    $(document).on('touchstart touchmove touchend touchcancel', '.canvas', function (ev) {
        $editor = $(ev.target).closest('.canvas');

        var touches = ev.originalEvent.touches;
        processTouches(touches || []);
        return false;
    });

    function getMouseTouches(ev) {
        return [{
            identifier: 'mouse',
            clientX: ev.clientX,
            clientY: ev.clientY
        }];
    }

    var mouseDown = false;
    $('body').on('mousedown', '.canvas', function (mouseEvent) {
        if (mouseEvent.which !== 1) return true;
        $editor = $(mouseEvent.target).closest('.canvas');
        processTouches(getMouseTouches(mouseEvent));
        mouseDown = true;
        return false;
    }).bind('mousemove', function (ev) {
        if (mouseDown) {
            processTouches(getMouseTouches(ev));
            return false;
        }
        return true;
    }).bind('mouseup mouseleave', function () {
        if (mouseDown) {
            processTouches([]);
            mouseDown = false;
            return false;
        }
        return true;
    });

});