
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
        //console.log("DRAW >>>",element.tagName  )
        var css = this.getComputedStyle( element );
        var pcss = null;
        if ( element.parent ){
             pcss =this.getComputedStyle( element.parent );
        }



        if ( css ) {
            var display = css.display;

            if ( display !== "none") {

                var cssunit = new CssUnit( pcss, 16, geometry.width, geometry.height );

                var x = cssunit.convert( "left",css.left )|| 0 ;

                var y = cssunit.convert( "top",css.top  )|| 0;
                var w = cssunit.convert( "width",css.width )|| geometry.width ;
                var h = cssunit.convert( "height",css.height )|| geometry.height;
                var fs = cssunit.convert( "fontSize",css.fontSize )|| 16;

                var bg = cssunit.convert( "backgroundColor",css.backgroundColor ) || {r:0,g:0,b:0,a:0};
                var color = cssunit.convert( "color",css.color )|| {r:0,g:0,b:0,a:0};

                var text = element.innerText();


                // NOTE TO SELF.  text format width should always be the width of
                // the content box unless the box is less than 0 then it should be infinite?
                // unless overflow hidden is set - how do browsers do it?
                var format= new Luna.Gfx.TextFormat( fs );

                var texLayout = new Luna.Gfx.TextLayout( text, format, w, h );

                RECT.setXY( x, y );
                RECT.setSize( w, h );

                // posindex.set( element, {x:x,y:y,w:w,h:h});
                console.log("*---->",bg)
                RGBA.setRed(bg.r);
                RGBA.setGreen(bg.g);
                RGBA.setBlue(bg.b);
                RGBA.setAlpha(bg.a);

                dc.drawBox(RECT, RGBA);


                if ( color ){
                    RGBA.setRed( color.r );
                    RGBA.setGreen( color.g );
                    RGBA.setBlue( color.b );
                    RGBA.setAlpha( color.a );
                    texLayout.setColor(RGBA);
                }

                POINT1.setX(x);
                POINT1.setY(y);

                dc.drawText( texLayout, POINT1 );

            }
        }

    }

    EtchStrategy.prototype.getComputedStyle = function( el ) {
        if ( el === null ){
            return new StringUtil("font-size:16px;background-color:black;color:white;width:1920px;height:1080px;").parseCss();
        }

        return el.style
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

    module.exports = EtchStrategy;