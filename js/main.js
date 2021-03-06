﻿$(document).ready(function () {

    var $canvas = $('.canvas');
    var $img = $('.canvas img');
    var $chkTouchEmulation = $('#touch-emulation');
    var $chkSkew = $('#options-skew');
    var $chkRotate = $('#options-rotate');
    var $chkZoom = $('#options-zoom');


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

    function createOptions() {
        return {
            skew: $chkSkew.prop('checked'),
            rotate: $chkRotate.prop('checked'),
            scale: $chkZoom.prop('checked')
        };
    }

    function refresh() {
        var m = getResultMatrix();
        $img.css('transform', m.getTransformExpression());
    }

    function processTouches(touches) {
        if (!$canvas) return;
        if (!multitouch) {
            multitouch = new MultiTouch(createOptions());
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

    function process(ev) {
        $canvas = $(ev.target).closest('.canvas');

        var touches = ev.originalEvent.touches;
        processTouches(touches || []);
        return false;
    }

    $(document).on('touchstart touchmove touchend touchcancel', '.canvas', process);

    $('#touch-emulation').change(function () {
        $canvas.toggleClass('touch-emulation', $chkTouchEmulation);
    });

    $('input[type=checkbox]').change(function () {
        $canvas.noTouch().reset();
    });
});