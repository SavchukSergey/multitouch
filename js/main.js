$(document).ready(function () {

    var $canvas = $('.canvas');
    var $img = $('.canvas img');
    var $chkTouchEmulation = $('#touch-emulation');

    $canvas.noTouch();

    var originalTransformation = new Matrix2D();

    var multitouch;

    function getResultMatrix() {
        var m = originalTransformation;
        if (multitouch) {
            var dragMatrix = multitouch.getResultMatrix();
            m = m.multiply(dragMatrix);
        }
        return m;
    }

    function refresh() {
        var m = getResultMatrix();
        $img.css('transform', m.getTransformExpression());
    }

    function processTouches(touches) {
        if (!$canvas) return;
        if (!multitouch) {
            multitouch = new MultiTouch();
        }
        multitouch.acceptTouches(touches);
        refresh();

        $canvas.toggleClass('dragging', !!touches.length);

        if (!touches.length) {
            originalTransformation = getResultMatrix();
            multitouch = null;
            //todo: transformation ended. Now you can use resultMatrix
        }
    }

    var dragging = false;

    function process(ev) {
        $canvas = $(ev.target).closest('.canvas');

        var touches = ev.originalEvent.touches;
        processTouches(touches || []);
        return false;
    }

    function processStart(ev) {
        console.log('processstart');
        return process(ev);
        dragging = true;
        return process(ev);
    }

    function processEnd(ev) {
        console.log('processend');
        return process(ev);
        if (dragging) {
            dragging = false;
            return process(ev);
        }
        return true;
    }

    function processMove(ev) {
        console.log('processmove ' + dragging);
        return process(ev);
        if (dragging) {
            return process(ev);
        }
        return true;
    }

    $(document).on('touchstart', '.canvas', processStart);
    $(document).on('touchmove', '.canvas', processMove);
    $(document).on('touchend touchcancel', '.canvas', processEnd);

    $('#touch-emulation').change(function () {
        $canvas.toggleClass('touch-emulation', $chkTouchEmulation);
    });
});