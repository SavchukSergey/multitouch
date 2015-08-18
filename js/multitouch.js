function MultiTouch(options) {

    var self = this;

    options = $.extend({
        translate: true,
        rotate: true,
        scale: true,
        skew: true
    }, options);

    var resultMatrix = new Matrix2D();

    var currentMatrix = new Matrix2D();

    function getTouchPosition(touch) {
        return {
            x: touch.clientX,
            y: touch.clientY,
            identifier: touch.identifier
        }
    }

    function getCoordinateSystem(touches) {
        var items = [];
        for (var i = 0; i < touches.length; i++) {
            items.push(getTouchPosition(touches[i]));
        }
        items = items.sort(function (a, b) {
            if (a.identifier > b.identifier) return 1;
            if (a.identifier < b.identifier) return -1;
            return 0;
        });

        var hash = '';
        var cs = {
            position: { x: 0, y: 0, identifier: null },
            u: { x: 1, y: 0, identifier: null },
            v: { x: 0, y: 1, identifier: null }
        };
        if (items.length > 0) {
            cs.position = items[0];
            hash += items[0].identifier.toString() + ' ';
        }
        if (items.length > 1) {
            var b = items[1];
            cs.u = { x: b.x - cs.position.x, y: b.y - cs.position.y, identifier: b.identifier };
            if (!options.rotate) {
                var uLen = Math.sqrt(cs.u.x * cs.u.x + cs.u.y * cs.u.y);
                cs.u = { x: uLen, y: 0, identifier: b.identifier };
            }
            cs.v = { x: cs.u.y, y: -cs.u.x, identifier: null };
            hash += items[1].identifier.toString() + ' ';
        }
        if (options.skew && items.length > 2) {
            var c = items[2];
            cs.v = { x: c.x - cs.position.x, y: c.y - cs.position.y, identifier: c.identifier };
            hash += items[2].identifier.toString() + ' ';
        }
        cs.hash = hash;
        cs.length = Math.min(3, items.length);
        return cs;
    }

    function coordinateSystemToMatrix(cs) {
        return new Matrix2D([cs.u.x, cs.u.y, 0, cs.v.x, cs.v.y, 0, cs.position.x, cs.position.y, 1]);
    }

    var sourceCoordinateSystem = null;
    var sourceMatrix = null;
    var sourceMatrixReverse = null;

    function setSource(cs) {
        sourceCoordinateSystem = cs;
        sourceMatrix = coordinateSystemToMatrix(cs);
        sourceMatrixReverse = sourceMatrix.reverse();
    }

    setSource(getCoordinateSystem([]));

    function applyCurrent() {
        resultMatrix = resultMatrix.multiply(currentMatrix);
        currentMatrix = new Matrix2D();
    }

    function getTouchesMap(touches) {
        var res = {};
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            var key = touch.identifier;
            res[key] = {
                identifier: key,
                x: touch.clientX,
                y: touch.clientY
            };
        }
        return res;
    }

    function getTouchesMapDistance(mapA, mapB) {
        var res = 0;
        for (var key in mapA) {
            if (mapA.hasOwnProperty(key)) {
                var touchA = mapA[key];
                var touchB = mapB[key];
                var dx = touchA.x - touchB.x;
                var dy = touchA.y - touchB.y;
                res += Math.sqrt(dx * dx + dy * dy);
            }
        }
        return res;
    }

    var state = '';
    var startPositions = {};

    function acceptTouches(touches) {
        var cs = getCoordinateSystem(touches);
        if (sourceCoordinateSystem.hash !== cs.hash) {
            applyCurrent();
            setSource(cs);
            state = 'threshold';
            startPositions = getTouchesMap(touches);
        } else if (cs.length > 0) {
            if (state === 'threshold') {
                var map = getTouchesMap(touches);
                var dist = getTouchesMapDistance(startPositions, map);
                if (dist > 5) {
                    state = 'drag';
                }
            }
            if (state === 'drag') {
                var newMatrix = coordinateSystemToMatrix(cs);
                var m = sourceMatrixReverse.multiply(newMatrix);
                currentMatrix = m;
            }
        }
    }

    function getResultMatrix() {
        return resultMatrix.multiply(currentMatrix);
    }

    self.acceptTouches = acceptTouches;
    self.getResultMatrix = getResultMatrix;
}