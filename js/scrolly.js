(function($){
	$.fn.scrolly = function(spec) {
		"use strict"
		//Values that are similar to all affected objects
		var defaults = { 	"segments" : "article",
							"titles" : "h1",
							"container" : "div",
							"containerClass" : "scrollyContainer",
							"headersContainer" : "div",
							"headersContainerClass" : "headersContainer",
							"headers" : "div",
							"headersClass" : "header",
							"showHeaderPosition" : "topTitleIn", //topTitleIn, topTitleOut, bottomTitleIn, bottomTitleOut
							"clickEasingFunction" : "easeInOutExpo",
							"scrollingElement" : "this",
							"clickEvent" : "both", //none, articleHeaders, topHeaders, both
							"clickEventArticleTime" : 500,
							"clickEventHeaderTime" : 750,
							"enumerateTitleIds" : true,
							"includeSuppliedPrerequisits" : true,
							"setHeadersWidth" : true};

		spec = $.extend({},defaults,spec);
		if (spec.includeSuppliedPrerequisits) {includeLibs();}

		var headers = {};

		return this.each(function(){
			
			var parentElement = $(this),
				scrollingElement;

			var containerGen = genTag(spec.container,spec.containerClass);
			var headerContainerGen = genTag(spec.headersContainer,spec.headersContainerClass);
			var headerGen = genTag(spec.headers,spec.headersClass);

			//Create scrolly, bind handler functions
			if (spec.scrollingElement === "this") {
				scrollingElement = parentElement;
			} else {
				scrollingElement = $(spec.scrollingElement);
			}

			scrollingElement.scroll(function(){scrollyScroll(scrollingElement)});
			
			scrollyCreate(parentElement);
			$(window).resize(function () {scrollyResize(parentElement)});

			function scrollyCreate(that) {
				// container
				that.children().wrapAll(containerGen.tag);
				var container = parentElement.children(containerGen.selector);
				container.css({'position': 'relative'})
				
				// headers container
				parentElement.after(headerContainerGen.tag);
				var headersContainer = parentElement.parent().find(headerContainerGen.selector);
				headersContainer.css({'position' : 'absolute', 'z-index' : 100000, 'top': parentElement.position().top, left: parentElement.position().left});
				
				// Populate with fake headers for each article
				var counter = 1,
					headerContent,
					newHeader;

				container.children(spec.segments).each(function () {
					headersContainer.append(headerGen.tag);
					headerContent = $(this).children(spec.titles).html();
					newHeader = $(headerContainerGen.selector + ' ' + headerGen.selector + ":last-child");
					headers[counter] = {"headerObject" : newHeader, "articleObject" : $(this)};
					newHeader.html(headerContent);

					//Add enumerated IDs if enumerateTitleIds == true
					if (spec.enumerateTitleIds) {newHeader.attr('id',spec.headersClass + counter++);}

					//Bind titles to click versions
					
				})
				
				scrollyResize(that);
			}

			function scrollyResize(that) {
				var newHeaderHeight = 0;
				var newArticleHeight = 0;
				var newHeight = 0;
				
				$.each(headers,(function(index) {
						
						var headerHeight = this.headerObject.height();
						var articleHeight = this.articleObject.height();
						var actualHeaderHeight = this.articleObject.children(spec.titles).height();
						newHeight = newHeaderHeight;

						if (spec.showHeaderPosition === "topTitleOut") {
							newHeight += actualHeaderHeight;
						} else {
							if (spec.showHeaderPosition === "bottomTitleIn") {
								newHeight += articleHeight - headerHeight;
							} else {
								if (spec.showHeaderPosition === "bottomTitleOut")
									newHeight += articleHeight;
								//TODO: error handling
							}
						}

						$.extend(headers[index],{"showHeight" : newHeight, "articleHeight" : newHeaderHeight})
						
						newArticleHeight += this.articleObject.height();
						newHeaderHeight += this.articleObject.height() - this.headerObject.height() * (spec.showHeaderPosition === "bottomTitleOut" ? 0 : 1);

						var headersContainer = parentElement.parent().find(headerContainerGen.selector);
						if (spec.setHeadersWidth) {headersContainer.width(parentElement.children(containerGen.selector).width());}
						
						// Bind click handlers, if so ocnfigured
						var clickableArticleHeaders = false,
							clickableTopHeaders = false;

						if (spec.clickEvent === "articleHeaders" || spec.clickEvent === "both") {clickableArticleHeaders = true;}
						if (spec.clickEvent === "topHeaders" || spec.clickEvent === "both") {clickableTopHeaders = true;}
						if (clickableArticleHeaders) {
							this.articleObject.children(spec.titles).unbind('click').click(function() {
								scrollingElement.scrollTo(headers[index].articleHeight,spec.clickEventArticleTime,{easing:spec.clickEasingFunction})
							})
						}

						if (clickableTopHeaders) {
							this.headerObject.css('cusror','pointer').unbind('click').click(function() {
								scrollingElement.scrollTo(headers[index].articleHeight,spec.clickEventHeaderTime,{easing:spec.clickEasingFunction})
							})
						}
					
				}))

				scrollyScroll(scrollingElement);
			}
			
			
			function scrollyScroll(that) {
				var comp = function(a,b) {return a < b};
				if (spec.showHeaderPosition === "topTitleOut" || spec.showHeaderPosition === "topTitleIn") {comp = function(a,b) {return a < b}}
				else {comp = function(a,b) {return a <= b}}
				
				
				$.each(headers,function() {
					var header = this.headerObject;
					comp(this.showHeight, that.scrollTop()) ? header.show() : header.hide();
				})
			}
		})
	}
})(jQuery)



//Include required libraries
function include(file, type) {
	var script = document.createElement('script');
	script.src = file;
	script.type = type || 'text/javascript';
	document.getElementsByTagName('head').item(0).appendChild(script);
}

function includeLibs() {
	include("js/html5.js")
	include("js/jquery.overscroll.min.js")
	include("js/jquery.easing.1.3.js")
	include("js/jquery.scrollTo-1.4.2-min.js")
}

//Auxiliary

//Input: Tag name, class and containing element.
//Output: An opening tag and a selector for that element.
function genTag(tagName, className) {
	return {"tag" : '<' + tagName + ' class="' + className + '" />',
			"selector" : tagName + '.' + className};
}