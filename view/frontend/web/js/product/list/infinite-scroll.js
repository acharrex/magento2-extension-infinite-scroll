/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

define([
    'jquery',
    'Magento_Ui/js/modal/alert',
    'mage/translate',
    'jquery/ui',
    'Shopigo_CatalogInfiniteScroll/js/product/list/continue-btn'
], function ($, alert) {
    'use strict';
    
    /**
     * ProductListCatalogInfiniteScroll Widget
     */
    $.widget('mage.productListCatalogInfiniteScroll', {

        /**
         * Widget options
         */
        options:
        {
            // Elements
            contentContainer: '.column.main',
            productsContainer: '.products.wrapper',
            toolbarContainer: '.toolbar-products',
            toolbarAmountContainer: '.toolbar-amount',
            infiniteScrollContainer: '#infinite-scroll-container',
            loaderContainer: '#infinite-scroll-loader',
            continueBtnContainer: '#infinite-scroll-continue-btn',
            scrollToTopBtn: '#infinite-scroll-to-top-btn',
            pageUrlAttr: 'data-page-url',
            
            // Settings
            primeCache: 0,
            scrollMode: 'auto_up_to',
            scrollPageLimit: 3,
            continueBtnText: 'Load more items',
            showTextLoader: 0,
            textLoader: 'Loading items...',
            ajaxRequestTimeout: 10000, // in milliseconds
            scrollToTopEnabled: 1,
            scrollToTopDistance: 400, // in pixels
            scrollToTopEasing: 'swing',
            scrollToTopDuration: 1200, // in milliseconds
            scrollToTopOffset: 20, // in pixels
            scrollToTopBtnColor: null,
            scrollToTopBtnColorHover: null
        },
        
        /**
         * Pager data
         */
        pager:
        {
            nextPageCache: '',
            loadingLock: 0, // simple lock to prevent loading when loading
            manualLock: 0, // simple lock to prevent auto loading when continue button is shown
            lastScrollPos: 0, // last scroll position
            pageCount: 1, // number of pages scrolled
            processingCacheRequests: [] // processing AJAX requests
        },
        
        /**
         * Handlers
         */
        handler: {},

        /**
         * Create widget
         *
         * @return void
         */
        _create: function () {
            this.hideUnusedElements();
            this.initScrollToTopBtn();

            // If the current page is not the last one
            if (this.options.nextPageUrl) {
                this.primeCache();
                this.initContinueBtn();
                this.initLoader();
                this.initPager();
            }
        },
        
        /**
         * Destroy widget
         *
         * @return void
         */
        _destroy: function () {
            // Unbind custom events
            $(window).unbind('scroll', this.handler.windowScroll);
            $(document).unbind('ready', this.handler.documentReady);
        },
        
        /**
         * Hide unused elements
         * 
         * @return void
         */
        hideUnusedElements: function () {
            this.hideToolbarAmount();
            this.hideBottomToolbar();
        },
        
        /*********************** TOOLBAR *****************************/
        
        /**
         * Hide toolbar amount
         *
         * @return void
         */
        hideToolbarAmount: function () {
            var toolbar = $(this.options.productsContainer).prev(this.options.toolbarContainer);
            if (!toolbar) {
                return;
            }
            
            var toolbarAmount = $(toolbar).find(this.options.toolbarAmountContainer);
            if (toolbarAmount) {
                toolbarAmount.hide();
            }
        },
        
        /**
         * Hide bottom toolbar
         *
         * @return void
         */
        hideBottomToolbar: function () {
            var toolbar = $(this.options.productsContainer).next(this.options.toolbarContainer);
            if (toolbar) {
                toolbar.hide();
            }
        },
        
        /*********************** CACHE *******************************/
        
        /**
         * Abort processing cache requests to avoid performance issue and
         * to don't load twices the same page
         *
         * @return void
         */
        abortProcessingCacheRequests: function () {
            var ajaxRequests = this.pager.processingCacheRequests;
            if (!ajaxRequests.length) {
                return;
            }
            for (var i = 0; i < ajaxRequests.length; i++) {
                ajaxRequests[i].abort();
            }

            // Remove all processing requests
            this.pager.processingCacheRequests = [];
        },
        
        /**
         * Preload a page and save the result got in the 'responseContainer'
         * variable
         *
         * @param string url Page URL
         * @param object responseContainer Response container
         * @return void
         */
        primePageCache: function (url, responseContainer) {
            var self = this;
            this.pager.processingCacheRequests.push($.ajax({
                url: url,
                data: 'ajax=1',
                type: 'get',
                dataType: 'json',
                cache: true,
                timeout: this.options.ajaxRequestTimeout
            }).done(function (response) {
                if (response.success) {
                    self.pager[responseContainer] = response;
                }
            }).fail(function (error) {
                console.log(JSON.stringify(error));
            }));
        },
        
        /**
         * If enabled, preload the next page
         *
         * @return void
         */
        primeCache: function () {
            if (!this.options.primeCache) {
                return;
            }
            
            if (this.options.nextPageUrl) {
                this.primePageCache(this.options.nextPageUrl, 'nextPageCache');
            }
        },
        
        /*********************** SCROLL TO TOP ***********************/
        
        /**
         * Inject CSS styles related to the scroll-to-top button
         * 
         * @return void
         */
        injectScrollToTopBtnCssStyles: function () {
            var cssStyles = [];
            
            if (this.options.scrollToTopBtnColor) {
                cssStyles.push(
                    this.options.scrollToTopBtn + ' { ' +
                        'background-color: ' + this.options.scrollToTopBtnColor + ';' +
                    ' }'
                );
            }
            
            
            if (this.options.scrollToTopBtnColorHover) {
                cssStyles.push(
                    this.options.scrollToTopBtn + ':hover { ' +
                        'background-color: ' + this.options.scrollToTopBtnColorHover + ';' +
                    ' }'
                );
            }
            
            if (cssStyles.length > 0) {
                cssStyles = cssStyles.join("\n");
                
                var style = document.createElement('style');
                if (style.styleSheet) {
                    style.styleSheet.cssText = cssStyles;
                } else {
                    style.appendChild(document.createTextNode(cssStyles));
                }
                
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        },
        
        /**
         * Init scroll-to-top button
         *
         * @return void
         */
        initScrollToTopBtn: function () {
            if (!this.options.scrollToTopEnabled) {
                return;
            }
            
            // Insert button in the HTML DOM
            $('body').append(
                $('<a/>').attr('href', '#').attr('id', this.options.scrollToTopBtn.replace('#', ''))
            );
            
            // Inject CSS styles related to the scroll-to-top button
            this.injectScrollToTopBtnCssStyles();
        
            // Handle scroll events to show / hide button
            $(window).on('scroll', $.proxy(function () {
                if ($(window).scrollTop() > this.options.scrollToTopDistance) {
                    $(this.options.scrollToTopBtn).fadeIn();
                } else {
                    $(this.options.scrollToTopBtn).fadeOut();
                }
            }, this));
            
            // Handle click event
            $(this.options.scrollToTopBtn).on('click', $.proxy(function (event) {
                this.scrollToTop();
                event.preventDefault();
            }, this));
        },
        
        /**
         * Scroll to the top action
         *
         * @return void
         */
        scrollToTop: function () {
            $('html, body').animate(
                {
                    scrollTop: $(this.options.contentContainer).offset().top - this.options.scrollToTopOffset
                },
                this.options.scrollToTopDuration,
                this.options.scrollToTopEasing
            );
        },
        
        /*********************** CONTINUE BUTTON *********************/
        
        /**
         * Init the continue button by building it
         *
         * @return void
         */
        initContinueBtn: function () {
            // Insert button in the HTML DOM
            $(this.options.infiniteScrollContainer).append(
                $('<div/>').attr('id', this.options.continueBtnContainer.replace('#', ''))
            );
            
            // Build button widget
            $(this.options.continueBtnContainer).continueBtn({
                texts: {
                    titleText: this.options.continueBtnText ? this.options.continueBtnText : '',
                    spanText: this.options.continueBtnText ? this.options.continueBtnText : '',
                },
                onclick: $.proxy(this.loadNextPage, this),
                template: '<div class="button-container">' +
                    '<button title="<%- data.texts.titleText %>" type="button" class="action continue primary" data-role="continue-btn">' +
                        '<span><%- data.texts.spanText %></span>' +
                    '</button>' +
                '</div>'
            });
        },
        
        /**
         * Show continue button
         *
         * @return void
         */
        showContinueBtn: function () {
            $(this.options.continueBtnContainer).continueBtn('show');
            this.pager.manualLock = 1;
        },
        
        /**
         * Hide continue button
         *
         * @return void
         */
        hideContinueBtn: function () {
            var btnContainer = $(this.options.continueBtnContainer);
            if (btnContainer.continueBtn('isBuilt')) {
                btnContainer.continueBtn('hide');
                this.pager.manualLock = 0;
            }
        },
        
        /*********************** LOADER ******************************/
        
        /**
         * Init loader
         *
         * @return void
         */
        initLoader: function () {
            // Insert loader in the HTML DOM
            $(this.options.infiniteScrollContainer).append(
                $('<div/>').attr('id', this.options.loaderContainer.replace('#', ''))
            );
            
            // Build loader widget
            $(this.options.loaderContainer).loader({
                icon: this.options.loaderImageSrc,
                texts: {
                    loaderText: this.options.showTextLoader ? this.options.textLoader : '',
                    imgAlt: this.options.showTextLoader ? this.options.textLoader : '',
                },
                template: '<div class="loader-container" data-role="loader">' +
                    '<div class="loader">' +
                        '<img alt="<%- data.texts.imgAlt %>" src="<%- data.icon %>">' +
                        '<p><%- data.texts.loaderText %></p>' +
                    '</div>' +
                '</div>'
            });
        },
        
        /**
         * Show loader
         *
         * @return void
         */
        showLoader: function () {
            $(this.options.loaderContainer).loader('show');
        },
        
        /**
         * Hide loader
         *
         * @return void
         */
        hideLoader: function () {
            $(this.options.loaderContainer).loader('hide');
        },
        
        /*********************** PAGER *******************************/
        
        /**
         * Process response content
         *
         * @param string html HTML content
         * @param string currentPageUrl Current page URL
         * @return object
         */
        processPageContent: function (html, currentPageUrl) {
            if (!html) {
                return;
            }
            
            // Build a new element from the HTML content got through the AJAX request
            // Important: '$(html)' cannot be used with complex HTML because bugged
            var htmlObject = $('<div/>').append(html);
            
            // Get only products wrapper
            htmlObject = htmlObject.find(this.options.productsContainer);
            
            // Bind add to cart buttons
            htmlObject.find('[data-role=tocart-form], .form.map.checkout')
                .attr('data-mage-init', JSON.stringify({'catalogAddToCart': {}}))
            
            // Add page url attribute on products wrapper
            if (currentPageUrl) {
                htmlObject.attr(this.options.pageUrlAttr, currentPageUrl);
            }
            
            return htmlObject;
        },
        
        /**
         * Check if at least 25% of the page is visible
         *
         * @param object element
         * @return bool
         */
        isPageMostlyVisible: function (element) {
            var scrollPos = $(window).scrollTop();
            var windowHeight = $(window).height();
            
            var elTop = $(element).offset().top;
            var elHeight = $(element).height();
            var elBottom = elTop + elHeight;
            
            if (((elBottom - (elHeight * 0.25)) > scrollPos)
                && (elTop < (scrollPos + (0.50 * windowHeight)))
            ) {
                return true;
            }
            return false;
        },

        /**
         * Init pager
         *
         * @return void
         */
        initPager: function () {
            // Re-init pager options
            this.pager = $.extend(true, {}, this.pager);
            
            // Add page url attribute on products wrapper
            if (this.options.currentPageUrl) {
                $(this.options.productsContainer).attr(this.options.pageUrlAttr, this.options.currentPageUrl);
            }
            
            // Handle scroll events to update content
            this.handler.windowScroll = $.proxy(function () {
                var scrollPos = $(window).scrollTop();
                if (scrollPos >= (0.75 * ($(document).height() - $(window).height()))) {
                    if (!this.pager.loadingLock && this.options.nextPageUrl) {
                        if (this.canAutoLoadNextPage()) {
                            this.loadNextPage();
                        } else {
                            this.showContinueBtn();
                        }
                    }
                }
                
                // Adjust the URL based on the top products wrapper shown for reasonable
                // amounts of wrappers
                if (Math.abs(scrollPos - this.pager.lastScrollPos) > ($(window).height() * 0.1)) {
                    this.pager.lastScrollPos = scrollPos;
                    
                    var self = this;
                    $(this.options.productsContainer).each(function () {
                        if (self.isPageMostlyVisible(this)) {
                            if (typeof history.replaceState === 'function') {
                                var pageUrl = $(this).attr(self.options.pageUrlAttr);
                                if (pageUrl != window.location.href) {
                                    history.replaceState(null, null, pageUrl);
                                }
                            }
                            return false;
                        }
                    });
                }
            }, this);
            
            $(window).bind('scroll', this.handler.windowScroll);

            // Handle document load
            this.handler.documentReady = $.proxy(function () {
                var scrollPos = $(window).scrollTop();
                if (scrollPos >= (0.75 * ($(document).height() - $(window).height()))) {
                    if (!this.pager.loadingLock && this.options.nextPageUrl) {
                        if (this.canAutoLoadNextPage()) {
                            this.loadNextPage();
                        } else {
                            this.showContinueBtn();
                        }
                    }
                }
            }, this);
            
            $(document).bind('ready', this.handler.documentReady);
        },
        
        /**
         * Check whether the next page can be automatically loaded
         *
         * @return bool
         */
        canAutoLoadNextPage: function () {
            if (!this.options.scrollMode) {
                return false;
            }
            if (this.pager.manualLock) {
                return false;
            }
            
            var autoLoad;
            
            switch (this.options.scrollMode) {
                // Automatic
                case 'auto':
                    autoLoad = true;
                    break;
                // Automatic up to X pages, then manual
                case 'auto_up_to':
                    if (this.pager.pageCount < this.options.scrollPageLimit) {
                        autoLoad = true;
                    }
                    break;
                // Automatic each X pages
                case 'auto_each':
                    if ((this.pager.pageCount % this.options.scrollPageLimit) !== 0) {
                        autoLoad = true;
                    }
                    break;
                // Manual or unknow mode
                case 'manual':
                default:
                    autoLoad = false;
                    break;
            }
            
            return autoLoad;
        },
        
        /**
         * Show next page and load following page if the 'prime cache'
         * feature is enabled
         *
         * @param object data Page data
         * @return void
         */
        showNextPage: function (data) {
            // Process HTML content and insert it after the last products wrapper
            $(this.options.productsContainer).last()
                .after(this.processPageContent(data.html.content, data.current_page_url))
                .trigger('contentUpdated');
            
            this.options.nextPageUrl = data.next_page_url;
            this.pager.nextPageCache = false;
            
            // Preload the next page cache
            if (this.options.primeCache && this.options.nextPageUrl) {
                this.primePageCache(this.options.nextPageUrl, 'nextPageCache');
            }
        },
        
        /**
         * Load next page
         *
         * @return void
         */
        loadNextPage: function () {
            this.abortProcessingCacheRequests();
            this.hideContinueBtn();
            
            this.pager.loadingLock = 1;
            
            if (this.pager.nextPageCache) {
                this.showNextPage(this.pager.nextPageCache);
                this.pager.loadingLock = 0;
                this.pager.pageCount++;
            } else {
                var self = this;
                $.ajax({
                    url: this.options.nextPageUrl,
                    data: 'ajax=1',
                    type: 'get',
                    dataType: 'json',
                    cache: true,
                    timeout: this.options.ajaxRequestTimeout,
                    beforeSend: function () {
                        self.showLoader();
                    },
                    complete: function () {
                        self.hideLoader();
                        self.pager.loadingLock = 0;
                        self.pager.pageCount++;
                    }
                }).done(function (response) {
                    if (response.success) {
                        self.showNextPage(response);
                    } else {
                        var msg = response.error_message;
                        if (msg) {
                            alert({
                                content: $.mage.__(msg)
                            });
                        }
                    }
                }).fail(function (error) {
                    alert({
                        content: $.mage.__('Sorry, something went wrong. Please try again later.')
                    });
                    console.log(JSON.stringify(error));
                    self.showContinueBtn();
                });
            }
        }
    });

    return $.mage.productListCatalogInfiniteScroll;
});
