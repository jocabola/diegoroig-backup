$ = function ( id ) { return document.getElementById( id ); };
el = function ( type, cls ) { var e = document.createElement( type ); if ( cls ) e.className = cls; return e; };

Diego = {};

Diego.getHeight = function () {
	return Math.max( 650, window.innerHeight );
}

Diego.loader = el( 'div', 'loader' );

Diego.Project = function ( gallery, nthumbs ) {

	var n = nthumbs ? parseInt(nthumbs) : 7;
	n = Math.max( 5, n );

	this.lightboxMode = false;

	this.lightbox = el( 'div', 'lightbox' );
	this.lightboxImageContainer = el( 'div', 'lightbox-image' );
	this.lightbox.appendChild( this.lightboxImageContainer );
	this.lightboxLoader = el( 'div', 'lightbox-loader' );
	this.lightboxImage = el( 'img' );
	this.lightboxImageContainer.appendChild( this.lightboxImage );
	this.lightboxClose = el( 'div', 'lightbox-close' );
	this.lightbox.appendChild( this.lightboxClose );
	this.lightboxRightArrow = el( 'div', 'lightbox-right' );
	this.lightboxLeftArrow = el( 'div', 'lightbox-left' );

	this.infoContainer = $( 'project-info' );
	this.infoContainer.style.width = ( ( n * 55 ) ) + 'px';

	this.safeMargin = n * 55 + 64;

	this.items = [];
	this.image = $( 'image-view' );
	this.thumbs = $( 'project-thumbs' );

	this.img = el( 'img' );
	this.image.appendChild( this.img );
	this.img.style.marginBottom = '12px';
	this.img.style.cursor = 'pointer';

	this.info = el( 'p' );
	this.image.appendChild( this.info );

	this.magnifier = el( 'div', 'magnifier' );
	this.image.appendChild( this.magnifier );

	var self = this;

	for ( var i=0; i<gallery.length; i++ ) {
		var t = el( 'div', 'thumb' );
		var img = el( 'img' );
		t.appendChild(  img );
		img.src = gallery[i].thumb;
		img.width = img.height = 50;
		this.thumbs.appendChild( t );

		this.setupButton( t, i );

		this.items.push( { thumb: t, src: gallery[i] } );
	}

	if ( this.items.length > 1 ) {
		this.lightbox.appendChild( this.lightboxRightArrow );
		this.lightbox.appendChild( this.lightboxLeftArrow );
	}

	this.selectedItem = 0;
	this.select( 0 );

	this.img.addEventListener( 'click', function ( e ) {
		self.enterLightboxMode();
	}, false );

	this.lightboxImageContainer.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		e.stopPropagation();
	}, false );

	this.lightbox.addEventListener( 'click', function ( e ) {
		self.exitLightboxMopde();
	}, false );

	this.lightboxClose.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		e.stopPropagation();
		self.exitLightboxMopde();
	}, false );

	this.lightboxRightArrow.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		e.stopPropagation();
		self.selectNext();
	}, false );

	this.lightboxLeftArrow.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		e.stopPropagation();
		self.selectPrevious();
	}, false );

	this.magnifier.addEventListener( 'click', function ( e ) {
		self.enterLightboxMode();
	}, false );

	window.addEventListener( 'resize', function ( e ) {
		self.resize();
	}, false );

	window.addEventListener( 'keydown', function ( e ) {
		self.onKeyHandler( e );
	}, false );

}

Diego.Project.prototype = {
	select : function ( i ) {
		var src = this.items[ i ].src;

		this.selectedItem = i;
		
		if ( this.lightboxMode ) {
			this.selectLightbox( i, src );
		}
		this.selectNormal( i, src );
	},

	selectNormal : function ( i, src ) {
		var self = this;

		this.info.innerHTML = src.title + '. ' + src.description;

		this.image.style.display = 'none';
		this.img.src = "";
		document.body.appendChild( Diego.loader );

		this.img.onload = function () {
			document.body.removeChild( Diego.loader );
			self.image.style.display = 'block';
			self.resize();
		}

		this.img.src = src.image.url;

		for ( var j=0; j<this.items.length; j++ ) {
			this.items[j].thumb.className = ( i == j ) ? 'thumb-selected' : 'thumb';
		}
	},

	selectLightbox : function ( i, src ) {
		var self = this;
		this.lightbox.appendChild( this.lightboxLoader );

		this.lightboxImageContainer.style.display = 'none';
		this.lightboxImage.src = "";

		this.lightboxImage.onload = function () {
			self.lightbox.removeChild( self.lightboxLoader );
			self.lightboxImageContainer.style.display = 'block';
			self.resize();
		}

		this.lightboxImage.src = src.image.url;
	},

	setupButton : function ( t, i ) {
		var self = this;
		t.addEventListener( 'click', function () {
			if ( self.selectedItem != i ) self.select( i );
		} );
	},

	enterLightboxMode : function () {
		this.lightboxMode = true;
		document.body.appendChild( this.lightbox );
		this.select( this.selectedItem );
	},

	exitLightboxMopde : function () {
		this.lightboxMode = false;
		document.body.removeChild( this.lightbox );
	},

	onKeyHandler : function ( e ) {
		e.preventDefault();
		if ( this.items.length > 1 ) {
			if ( e.keyCode == 39 ) {
				// RIGHT ARROW
				this.selectNext();
			}
			else if ( e.keyCode == 37 ) {
				// LEFT ARROW
				this.selectPrevious();
			}
		}
		if ( this.lightboxMode ) {
			if ( e.keyCode == 27 ) {
				this.exitLightboxMopde();
			}
		}
	},

	selectNext : function () {
		var nxt = this.selectedItem + 1 < this.items.length ? this.selectedItem + 1 : 0;
		this.select( nxt );
	},

	selectPrevious : function () {
		var nxt = this.selectedItem - 1 > -1 ? this.selectedItem - 1 : this.items.length - 1;
		this.select( nxt );
	},

	resize : function () {
		var r = this.items[ this.selectedItem ].src.image.ratio;
		var w = $( 'container' ).clientWidth - this.safeMargin;
		var h = w / r;
		var t = Diego.getHeight() - 200

		if ( h > t ) {
			h = t;
			w = h * r;
		}

		this.img.width = w;
		this.img.height = h;
		this.info.style.width = w + 'px';
		this.magnifier.style.top = ( h - 28 ) + 'px';

		if ( this.lightboxMode ) {
			this.resizeLightbox();
		}
	},

	resizeLightbox : function () {
		var mw = window.innerWidth - 160;
		var mh = window.innerHeight - 48;
		var r = this.items[ this.selectedItem ].src.image.ratio;
		var w = mw;
		var h = mw / r;

		if ( h > mh ) {
			w = mh * r;
			h = mh;
		}

		this.lightboxImage.width = w;
		this.lightboxImage.height = h;

		this.lightboxImageContainer.style.top = ( 24 + ( mh - h ) * .5 ) + 'px';
		this.lightboxImageContainer.style.left = ( 80 + ( mw - w ) * .5 ) + 'px';

	}
}