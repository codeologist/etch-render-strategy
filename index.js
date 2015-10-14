
    "use strict";


    var DCINDEX = Symbol();

    var Luna = require("luna");
    var Colors = require("./CSSColors"),
        CssUnit = require("./CSSConvertPropertyValueToLunaValue"),
        StringUtil = require("etch-string-util"),
        geometry = Luna.Application.getDisplayProperties(),

    RECT =  new Luna.Math.Rect( 10, 10, 100, 100),
    RGBA = new Luna.Math.RgbColor( 0,0,0,255),
    POINT1 = new Luna.Math.Point2();


    function draw( element, dc ){

        var tag = element.tagName;

        if ( tag in this.plugins){
            this.plugins[ tag ]( element, dc, this.getComputedStyle(element));
        }

    }

    EtchStrategy.prototype.getComputedStyle = function( el ) {

        /*
        *   return default css
        */
        if ( el === null ){
            return new StringUtil("font-size:16px;background-color:black;color:white;width:1920px;height:1080px;").parseCss();
        }

        var css = {};

        Object.keys( el.style ).forEach( function(key){
            css[key]=el.style[key];
        });

        var pcss = null;

        if ( el.parent ){
            pcss = {};
            Object.keys( el.parent.style ).forEach( function(key){
                css[key]=el.parent.style[key];
            });
        }


        var cssunit = new CssUnit(pcss, 16, geometry.width, geometry.height);

        css.left = cssunit.convert("left", css.left) || 0;
        css.top = cssunit.convert("top", css.top) || 0;
        css.width = cssunit.convert("width", css.width) || geometry.width;
        css.height = cssunit.convert("height", css.height) || geometry.height;
        css.fontSize = cssunit.convert("fontSize", css.fontSize) || 16;
        css.backgroundColor = cssunit.convert("backgroundColor", css.backgroundColor) || {r: 0, g: 0, b: 0, a: 0};
        css.color = cssunit.convert("color", css.color) || {r: 0, g: 0, b: 0, a: 0};

        return css;
    };

    function EtchStrategy() {
        this[DCINDEX] = new WeakMap();
    }

    EtchStrategy.prototype.seed = function( el, CSS ){
         if ( !this[DCINDEX].has( el ) ){
                this[DCINDEX].set( el,  new  Luna.Gfx.DrawingContext()   );
            }

            return this[DCINDEX].get( el );

    };


    //
    //EtchStrategy.prototype.getElementsFromPoint = function( x, y ) {
    //    var out=[];
    //    var r = new Luna.Math.Rect();
    //    posindex.forEach( function( v, key ){
    //        r.setXY( v.x, v.y);
    //        r.setSize(v.w, v.h );
    //        if ( r.isContained( x, y) ){
    //            out.push(key);
    //        }
    //
    //    });
    //    r=null;
    //    return out;
    //};

    //EtchStrategy.prototype.getComputedStyle = function( el ){
    //    return new CssPropertySet( el.style );
    //};

    EtchStrategy.prototype.setRootDocument = function( element ) {
        var dc = this.seed( element );
        dc.beginDraw();
        draw.call( this, element, dc );
        dc.endDraw();
        Luna.Application.setRoot( dc );
    };

    EtchStrategy.prototype.layout = function( e ) {
        var dc,
            element = e.target;

        if ( element.childNodes ){
            dc = this.seed( element );

            dc.beginDraw();
            draw.call( this, e.target, dc );
            element.childNodes.forEach(function ( childElement ) {
                if ( childElement.nodeType === 1 ) {
                    dc.drawDrawingContext(0, 0, this.seed( childElement ) );
                }
            }, this);
            dc.endDraw();
        }
    };

    EtchStrategy.prototype.draw = function( e  ) {
        var element = e.target,
            dc = this.seed( element );

        dc.beginDraw();
        draw.call( this, element, dc  );
        dc.endDraw();
    };

    EtchStrategy.prototype.plugins = {
        "DIV": function( el, dc, css ){
            var text = el.innerText();

            // NOTE TO SELF.  text format width should always be the width of
            // the content box unless the box is less than 0 then it should be infinite?
            // unless overflow hidden is set - how do browsers do it?
            var format= new Luna.Gfx.TextFormat( css.fontSize );
            var texLayout = new Luna.Gfx.TextLayout( text, format, css.width, css.height );

            RECT.setXY( css.left, css.top );
            RECT.setSize( css.width, css.height );

            // posindex.set( element, {x:x,y:y,w:w,h:h});

            RGBA.setRed(   css.backgroundColor.r);
            RGBA.setGreen( css.backgroundColor.g);
            RGBA.setBlue(  css.backgroundColor.b);
            RGBA.setAlpha( css.backgroundColor.a);

            dc.drawBox(RECT, RGBA);


            RGBA.setRed(   css.color.r );
            RGBA.setGreen( css.color.g );
            RGBA.setBlue(  css.color.b );
            RGBA.setAlpha( css.color.a );

            texLayout.setColor(RGBA);

            POINT1.setX( css.left );
            POINT1.setY( css.top );

            dc.drawText( texLayout, POINT1 );


        }
    };

    module.exports = EtchStrategy;