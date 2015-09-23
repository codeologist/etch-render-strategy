    "use strict";

    var CSSLength = require("./CSSLength");
    var CSSColors= require("./CSSColors");

    /**
     * CSSConvertPropertyValueToLunaValue
     */

    var convert = {
        "em":function( prop, length, parentComputedStyle  ){
            if ( !parentComputedStyle){
                return length.computePixelValue( 16 );
            }
            return length.computePixelValue( parentComputedStyle["fontSize"] );
        },
        "rem":function(prop,  length, parentComputedStyle, baseFontSize ){
            return length.computePixelValue(baseFontSize || 16);
        },
        "%":function(prop,  length, parentComputedStyle ){
            if ( !parentComputedStyle){
                if ( prop ==="width"){
                    return length.computePixelValue( 1920 );
                }
                if ( prop ==="height"){
                    return length.computePixelValue( 1080 );
                }
            }
            return length.computePixelValue( parentComputedStyle[prop] );
        },
        "px":function(prop,  length ){
            return length.value;
        },
        "vw":function( prop, length, parentComputedStyle, baseFontSize, width, height ){
            return length.computePixelValue( width );
        },
        "vh":function( prop, length, parentComputedStyle, baseFontSize,  width, height ){
            return length.computePixelValue( height );
        }
    };
//TODO: can this be refactored to be an object rather than a decorator

    function CSSConvertPropertyValueToLunaValue(  parentComputedStyle, baseFontSize,  width, height ){
        this.parentComputedStyle = parentComputedStyle;
        this.baseFontSize = baseFontSize || 16;
        this.width = width;
        this.height = height;
    }

    CSSConvertPropertyValueToLunaValue.prototype.convert = function( prop, val ) {


        if ( prop === "zIndex"){
            var out = val * 1;
            if ( isNaN(out) ){
                return 0;
            }
            return out;
        }

        if ( typeof prop !== "string" ){
            throw  "CSS Property Name is a required value.";
        }

        if ( typeof val !== "string"  && typeof val !== "number" ){
            return undefined;
        }

        if ( val === "inherit") {
            return this.parentComputedStyle[prop];
        }

        var length = new CSSLength( val );

        if ( length.isLength() && length.unit in convert ){
            return convert[length.unit]( prop, length, this.parentComputedStyle, this.baseFontSize, this.width, this.height );
        }

        var color = new CSSColors( val );

        if ( color.isColor() ){
            return color.toRGB();
        }
        return val;
    };

    module.exports = CSSConvertPropertyValueToLunaValue;