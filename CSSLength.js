
    "use strict";

    /**
     *
     * Length units
     * em	Relative to the font-size of the element (2em means 2 times the size of the current font) Try it
     * ex	Relative to the x-height of the current font (rarely used) Try it
     * ch	Relative to width of the "0" (zero)
     * rem	Relative to font-size of the root element
     * vw	Relative to 1% of the width of the viewport
     * vh	Relative to 1% of the height of the viewport
     * vmin	Relative to 1% of viewport's smaller dimension
     * vmax	Relative to 1% of viewport's larger dimension
     * %
     * @param val
     * @param cmp Number - reference value in pixels
     * @constructor
     */
    function CSSLength( val ){

        this.value = 0;
        this.unit= "";

        if ( typeof val === "string"  ){
            this.value = val.replace(/\D/g,'') * 1;
            this.unit= val.replace(/[0-9]/g, "").replace(/\s+/g, "").toLowerCase();
        }
    }

    CSSLength.prototype.isRelativeLength = function(){
        return ["rem","em","%"].indexOf( this.unit )!== -1;
    };

    CSSLength.prototype.isLength = function(){
        return typeof this.value === "number" && typeof this.unit === "string" && this.unit in this;
    };

    CSSLength.prototype.computePixelValue = function( cmp ){
        return this.isLength() ? this[ this.unit ]( cmp ) : 0;
    };

    CSSLength.prototype.em = function( fs ){
        return this.value * fs;
    };

    CSSLength.prototype.px = function(){
        return this.value;
    };

    CSSLength.prototype.rem = function( fs ){
        return  this.value * fs;
    };

    CSSLength.prototype.vw = function( w ){
        return  this.value * ( w / 100 );
    };

    CSSLength.prototype.vh = function(  h ){
        return this.value * ( h / 100 ) ;
    };

    CSSLength.prototype["%"] = function( len ){
        return  len / this.value ;
    };

module.exports = CSSLength;

