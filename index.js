
    "use strict";


    var DCINDEX = Symbol();

    var Luna = require("luna");
    var Colors = require("./CSSColors"),
        CssUnit = require("./CSSConvertPropertyValueToLunaValue"),
     geometry = Luna.Application.getDisplayProperties(),

    RECT =  new Luna.Math.Rect( 10, 10, 100, 100),
    RGBA = new Luna.Math.RgbColor( 0,0,0,255),
    POINT1 = new Luna.Math.Point2();




    function drawBg( element, dc ){

        var css = this[DCINDEX].get( element )[1];
        var pcss = null;
        if ( element.parent ){
             pcss = this[DCINDEX].get( element.parent )[1];
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

    function layout1( node, dc ) {
        drawBg.call( this, node, dc );
    }

    function recursiveElementDraw( node, func ) {

        var dc = this[DCINDEX].get( node )[0];

        dc.beginDraw();

        func.call( this, node, dc );

        if ( node.childNodes ){

            node.childNodes.forEach(function ( child ) {
                if ( child.nodeType === 9 || child.nodeType === 1 ) {
                    dc.drawDrawingContext(0, 0, recursiveElementDraw.call(this, child, func));
                }
            }, this);
        }


        dc.endDraw();

        return dc;

    }





    function EtchStrategy() {

        this[DCINDEX] = new WeakMap();

        this.queue =[];

        Array.observe( this.queue, function( changes ){
            changes.forEach( function( change ) {
                if (change.addedCount) {
                    change.object.forEach( function ( element ) {
                        this.draw.call( this, element  );
                    }, this );
                }
            }, this );
        }.bind( this ));
    }

    EtchStrategy.prototype.seed = function( Element, DrawingContext, CSS ){
        this[DCINDEX].set( Element, [ DrawingContext, CSS ] );
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


    EtchStrategy.prototype.drawTreeFromElement = function( el ){
        return recursiveElementDraw.call( this, el, function( node, dc  ){
            layout1.call(this, node, dc );
        });
    };

    EtchStrategy.prototype.draw = function( element ) {
        Luna.Application.setRoot( this.drawTreeFromElement( element ) );
    };


    EtchStrategy.prototype.enqueue = function( element  ) {
        this.queue.push( element  );
    };

    module.exports = EtchStrategy;