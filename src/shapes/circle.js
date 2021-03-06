/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * an ellipse Object
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} x the center x coordinate of the ellipse  
     * @param {Number} y the center y coordinate of the ellipse  
     * @param {Number} w width (diameter) of the ellipse
     * @param {Number} h height (diameter) of the ellipse
     */
    me.Ellipse = Object.extend(
    {
        /** @scope me.Ellipse.prototype */
        /** @ignore */
        init : function (x, y, w, h) {
            /**
             * the center coordinates of the ellipse 
             * @public
             * @type {me.Vector2d}
             * @name pos
             * @memberOf me.Ellipse
             */
            this.pos = new me.Vector2d();

            /**
             * The bounding rectangle for this shape
             * @protected
             * @type {me.Rect}
             * @name bounds
             * @memberOf me.Ellipse
             */
            this.bounds = undefined;

            /**
             * radius (x/y) of the ellipse
             * @public
             * @type {me.Vector2d}
             * @name radius
             * @memberOf me.Ellipse
             */
            this.radius = new me.Vector2d();

            // the shape type
            this.shapeType = "Ellipse";
            this.setShape(x, y, w, h);
        },

        /**
         * set new value to the Ellipse shape
         * @name setShape
         * @memberOf me.Ellipse
         * @function
         * @param {Number} x position of the ellipse
         * @param {Number} y position of the ellipse
         * @param {Number} w width (diameter) of the ellipse
         * @param {Number} h height (diameter) of the ellipse
         */
        setShape : function (x, y, w, h) {
            this.pos.set(x, y);
            this.radius.set(w / 2, h / 2);
            this.updateBounds();
            return this;
        },

        /**
         * translate the circle/ellipse by the specified offset
         * @name translate
         * @memberOf me.Ellipse
         * @function
         * @param {Number} x x offset
         * @param {Number} y y offset
         * @return {me.Ellipse} this ellipse
         */
        translate : function (x, y) {
            this.pos.x += x;
            this.pos.y += y;
            this.bounds.translate(x, y);
            return this;
        },

        /**
         * translate the circle/ellipse by the specified vector
         * @name translateV
         * @memberOf me.Ellipse
         * @function
         * @param {me.Vector2d} v vector offset
         * @return {me.Rect} this ellipse
         */
        translateV : function (v) {
            this.pos.add(v);
            this.bounds.translateV(v);
            return this;
        },

        /**
         * check if this circle/ellipse contains the specified point
         * @name containsPointV
         * @memberOf me.Ellipse
         * @function
         * @param  {me.Vector2d} point
         * @return {boolean} true if contains
         */
        containsPointV: function (v) {
            return this.containsPoint(v.x, v.y);
        },

        /**
         * check if this circle/ellipse contains the specified point
         * @name containsPoint
         * @memberOf me.Ellipse
         * @function
         * @param  {Number} x x coordinate
         * @param  {Number} y y coordinate
         * @return {boolean} true if contains
         */
        containsPoint: function (x, y) {
            // Make position relative to object center point.
            x -= this.pos.x;
            y -= this.pos.y;
            // Pythagorean theorem.
            return (
                ((x * x) / (this.radius.x * this.radius.x)) +
                ((y * y) / (this.radius.y * this.radius.y))
            ) <= 1.0;
        },

        /**
         * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
         * @name getBounds
         * @memberOf me.Ellipse
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        getBounds : function () {
            return this.bounds;
        },
        
        /**
         * update the bounding box for this shape.
         * @name updateBounds
         * @memberOf me.Ellipse
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        updateBounds : function () {
            var x = this.pos.x - this.radius.x,
                y = this.pos.y - this.radius.y,
                w = this.radius.x * 2,
                h = this.radius.y * 2;
            
            if (!this.bounds) {
                this.bounds = new me.Rect(x, y, w, h);
            }  else {
                this.bounds.setShape(x, y, w, h);
            }
            return this.bounds;
        },

        /**
         * clone this Ellipse
         * @name clone
         * @memberOf me.Ellipse
         * @function
         * @return {me.Ellipse} new Ellipse
         */
        clone : function () {
            return new me.Ellipse(this.pos.x, this.pos.y, this.radius.x * 2, this.radius.y * 2);
        },

        /**
         * debug purpose
         * @ignore
         */
        draw : function (renderer, color) {
            renderer.strokeArc(this.pos.x - this.radius.x, this.pos.y - this.radius.y, this.radius.x, this.radius.y, 0, 2 * Math.PI, color || "red", false);
        }
    });
})();
