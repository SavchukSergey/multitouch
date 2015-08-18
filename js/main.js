$(document).ready(function () {

    $('.canvas').noTouch();

    var originalTransformation = new Matrix2D();

    var multitouch;
    var $img = $('.canvas img');
    var $editor = null;

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
        if (!$editor) return;
        if (!multitouch) {
            multitouch = new MultiTouch();
        }
        multitouch.acceptTouches(touches);
        refresh();

        $editor.toggleClass('dragging', !!touches.length);

        if (!touches.length) {
            originalTransformation = getResultMatrix();
            multitouch = null;
            //todo: transformation ended. Now you can use resultMatrix
        }
    }

    $(document).on('touchstart touchmove touchend touchcancel', '.canvas', function (ev) {
        $editor = $(ev.target).closest('.canvas');

        var touches = ev.originalEvent.touches;
        processTouches(touches || []);
        return false;
    });

});