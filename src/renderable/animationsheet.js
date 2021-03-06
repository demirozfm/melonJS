/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * an object to manage animation
     * @class
     * @extends me.Sprite
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the sprite object
     * @param {Number} y the y coordinates of the sprite object
     * @param {Object} settings Contains additional parameters for the animation sheet:
     * <ul>
     * <li>{Image} image to use for the animation</li>
     * <li>{Number} spritewidth - of a single sprite within the spritesheet</li>
     * <li>{Number} spriteheight - height of a single sprite within the spritesheet</li>
     * <li>{Object} region an instance of: me.TextureAtlas#getRegion. The region for when the animation sheet is part of a me.TextureAtlas</li>
     * </ul>
     * @example
     * // standalone image
     * var animationSheet = new me.AnimationSheet(0, 0, {
     *   image: me.loader.getImage('animationsheet'),
     *   spritewidth: 64,
     *   spriteheight: 64
     * });
     * // from a texture
     * var texture = new me.TextureAtlas(me.loader.getJSON('texture'), me.loader.getImage('texture'));
     * var animationSheet = new me.AnimationSheet(0, 0, {
     *   image: texture,
     *   spritewidth: 64,
     *   spriteheight: 64,
     *   region: texture.getRegion('animationsheet')
     * });
     */
    me.AnimationSheet = me.Sprite.extend(
    /** @scope me.AnimationSheet.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            // Spacing and margin
            /** @ignore */
            this.spacing = 0;
            /** @ignore */
            this.margin = 0;

            /**
             * pause and resume animation<br>
             * default value : false;
             * @public
             * @type Boolean
             * @name me.AnimationSheet#animationpause
             */
            this.animationpause = false;

            /**
             * animation cycling speed (delay between frame in ms)<br>
             * default value : 100ms;
             * @public
             * @type Number
             * @name me.AnimationSheet#animationspeed
             */
            this.animationspeed = 100;
            // hold all defined animation
            this.anim = {};

            // a flag to reset animation
            this.resetAnim = null;

            // default animation sequence
            this.current = null;
            // default animation speed (ms)
            this.animationspeed = 100;

            // Spacing and margin

            this.spacing = settings.spacing || 0;
            this.margin = settings.margin || 0;

            var image = settings.region || settings.image;

            // call the constructor
            this._super(me.Sprite, "init", [x, y, settings.image, settings.spritewidth, settings.spriteheight, this.spacing, this.margin]);

            // store the current atlas information
            this.textureAtlas = null;
            this.atlasIndices = null;

            // build the local textureAtlas

            this.buildLocalAtlas(settings.atlas, settings.atlasIndices, image);

            // create a default animation sequence with all sprites
            this.addAnimation("default", null);

            // set as default
            this.setCurrentAnimation("default");
        },
        /**
         * build the local (private) atlas
         * @ignore
         */

        buildLocalAtlas : function (atlas, indices, image) {
            // reinitialze the atlas
            if (image === null || typeof image === "undefined") {
                image = this.image;
            }
            if (typeof(atlas) !== "undefined") {
                this.textureAtlas = atlas;
                this.atlasIndices = indices;
            }
            else {
                // regular spritesheet
                this.textureAtlas = [];
                // calculate the sprite count (line, col)
                var spritecount = new me.Vector2d(
                    ~~((image.width - this.margin) / (this.width + this.spacing)),
                    ~~((image.height - this.margin) / (this.height + this.spacing))
                );
                var offsetX = 0;
                var offsetY = 0;
                if (image.offset) {
                    offsetX = image.offset.x;
                    offsetY = image.offset.y;
                }
                // build the local atlas
                for (var frame = 0, count = spritecount.x * spritecount.y; frame < count ; frame++) {
                    this.textureAtlas[frame] = {
                        name: "" + frame,
                        offset: new me.Vector2d(
                            this.margin + (this.spacing + this.width) * (frame % spritecount.x) + offsetX,
                            this.margin + (this.spacing + this.height) * ~~(frame / spritecount.x) + offsetY
                        ),
                        width: this.width,
                        height: this.height,
                        hWidth: this.width / 2,
                        hHeight: this.height / 2,
                        angle: 0
                    };
                }
            }
        },

        /**
         * add an animation <br>
         * For fixed-sized cell sprite sheet, the index list must follow the
         * logic as per the following example :<br>
         * <img src="images/spritesheet_grid.png"/>
         * @name addAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @param {Number[]|String[]} index list of sprite index or name
         * defining the animation
         * @param {Number} [animationspeed] cycling speed for animation in ms
         * (delay between each frame).
         * @see me.AnimationSheet#animationspeed
         * @example
         * // walking animation
         * this.addAnimation("walk", [ 0, 1, 2, 3, 4, 5 ]);
         * // eating animation
         * this.addAnimation("eat", [ 6, 6 ]);
         * // rolling animation
         * this.addAnimation("roll", [ 7, 8, 9, 10 ]);
         * // slower animation
         * this.addAnimation("roll", [ 7, 8, 9, 10 ], 200);
         */
        addAnimation : function (name, index, animationspeed) {
            this.anim[name] = {
                name : name,
                frame : [],
                idx : 0,
                length : 0,
                animationspeed: animationspeed || this.animationspeed,
                nextFrame : 0
            };

            if (index == null) {
                index = [];
                var j = 0;
                // create a default animation with all frame
                this.textureAtlas.forEach(function () {
                    index[j] = j++;
                });
            }

            // set each frame configuration (offset, size, etc..)
            for (var i = 0, len = index.length; i < len; i++) {
                if (typeof(index[i]) === "number") {
                    this.anim[name].frame[i] = this.textureAtlas[index[i]];
                } else { // string
                    if (this.atlasIndices === null) {
                        throw new me.Renderable.Error("string parameters for addAnimation are only allowed for TextureAtlas");
                    } else {
                        this.anim[name].frame[i] = this.textureAtlas[this.atlasIndices[index[i]]];
                    }
                }
            }
            this.anim[name].length = this.anim[name].frame.length;
        },

        /**
         * set the current animation
         * this will always change the animation & set the frame to zero
         * @name setCurrentAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @param {String|Function} [onComplete] animation id to switch to when
         * complete, or callback
         * @example
         * // set "walk" animation
         * this.setCurrentAnimation("walk");
         *
         * // set "walk" animation if it is not the current animation
         * if (this.isCurrentAnimation("walk")) {
         *   this.setCurrentAnimation("walk");
         * }
         *
         * // set "eat" animation, and switch to "walk" when complete
         * this.setCurrentAnimation("eat", "walk");
         *
         * // set "die" animation, and remove the object when finished
         * this.setCurrentAnimation("die", (function () {
         *    me.game.world.removeChild(this);
         *    return false; // do not reset to first frame
         * }).bind(this));
         *
         * // set "attack" animation, and pause for a short duration
         * this.setCurrentAnimation("die", (function () {
         *    this.animationpause = true;
         *
         *    // back to "standing" animation after 1 second
         *    setTimeout(function () {
         *        this.setCurrentAnimation("standing");
         *    }, 1000);
         *
         *    return false; // do not reset to first frame
         * }).bind(this));
         **/
        setCurrentAnimation : function (name, resetAnim) {
            if (this.anim[name]) {
                this.current = this.anim[name];
                this.resetAnim = resetAnim || null;
                this.setAnimationFrame(this.current.idx); // or 0 ?
                this.current.nextFrame = this.current.animationspeed;
            } else {
                throw new me.Renderable.Error("animation id '" + name + "' not defined");
            }
        },

        /**
         * return true if the specified animation is the current one.
         * @name isCurrentAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @return {Boolean}
         * @example
         * if (!this.isCurrentAnimation("walk")) {
         *    // do something funny...
         * }
         */
        isCurrentAnimation : function (name) {
            return this.current.name === name;
        },

        /**
         * force the current animation frame index.
         * @name setAnimationFrame
         * @memberOf me.AnimationSheet
         * @function
         * @param {Number} [index=0] animation frame index
         * @example
         * //reset the current animation to the first frame
         * this.setAnimationFrame();
         */
        setAnimationFrame : function (idx) {
            this.current.idx = (idx || 0) % this.current.length;
            var frame = this.current.frame[this.current.idx];
            this.offset = frame.offset;
            this.width = frame.width;
            this.height = frame.height;
            this.hWidth = frame.hWidth;
            this.hHeight = frame.hHeight;
            this._sourceAngle = frame.angle;
        },

        /**
         * return the current animation frame index.
         * @name getCurrentAnimationFrame
         * @memberOf me.AnimationSheet
         * @function
         * @return {Number} current animation frame index
         */
        getCurrentAnimationFrame : function () {
            return this.current.idx;
        },

        /**
         * update the animation<br>
         * this is automatically called by the game manager {@link me.game}
         * @name update
         * @memberOf me.AnimationSheet
         * @function
         * @protected
         * @param {Number} dt time since the last update in milliseconds.
         */
        update : function (dt) {
            // update animation if necessary
            if (!this.animationpause) {
                this.current.nextFrame -= dt;
                if (this.current.nextFrame <= 0) {
                    this.setAnimationFrame(++this.current.idx);

                    // switch animation if we reach the end of the strip
                    // and a callback is defined
                    if (this.current.idx === 0 && this.resetAnim)  {
                        // if string, change to the corresponding animation
                        if (typeof this.resetAnim === "string") {
                            this.setCurrentAnimation(this.resetAnim);
                        }
                        // if function (callback) call it
                        else if (typeof this.resetAnim === "function" &&
                                 this.resetAnim() === false) {
                            this.current.idx = this.current.length - 1;
                            this.setAnimationFrame(this.current.idx);
                            this._super(me.Sprite, "update", [dt]);
                            return false;
                        }
                    }

                    // set next frame timestamp
                    this.current.nextFrame = this.current.animationspeed;
                    return this._super(me.Sprite, "update", [dt]) || true;
                }
            }
            return this._super(me.Sprite, "update", [dt]);
        }
    });
})();
