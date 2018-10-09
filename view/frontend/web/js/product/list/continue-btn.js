/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

define([
    'jquery',
    'mage/template',
    'jquery/ui',
    'mage/translate'
], function ($, mageTemplate) {
    'use strict';

    /**
     * ContinueBtn Widget
     */
    $.widget('mage.continueBtn', {
        options: {
            texts: {
                titleText: $.mage.__('Continue'),
                spanText: $.mage.__('Continue')
            },
            onclick: null,
            template: '<div class="button-container">' +
                '<button title="<%- data.texts.titleText %>" type="button" class="action continue primary" data-role="continue-btn">' +
                    '<span><%- data.texts.spanText %></span>' +
                '</button>' +
            '</div>'

        },

        /**
         * Initialize button container
         *
         * @return void
         */
        _create: function () {
            this._bind();
        },

        /**
         * Bind button container
         *
         * @return void
         */
        _bind: function () {
            this._on({
                'show.button': 'show',
                'hide.button': 'hide'
            });
        },
        
        /**
         * Bind button
         *
         * @return void
         */
        _bindButton: function () {
            if (!this.options.onclick || !$.isFunction(this.options.onclick)) {
                return;
            }
            this.spinner.find('button')
                .on('click', $.proxy(function (event) {
                    event.preventDefault();
                    this.options.onclick.call(this);
                }, this));
        },

        /**
         * Show button container
         *
         * @param object e
         * @param object ctx
         * @return bool
         */
        show: function (e, ctx) {
            this._render();
            this.spinner.show();

            if (ctx) {
                this.button
                    .css({
                        width: ctx.outerWidth(),
                        height: ctx.outerHeight(),
                        position: 'absolute'
                    })
                    .position({
                        my: 'top left',
                        at: 'top left',
                        of: ctx
                    });
            }

            return false;
        },

        /**
         * Hide button container
         *
         * @return bool
         */
        hide: function () {
            this.spinner.hide();
            return false;
        },
        
        /**
         * Retrieve whether button container is built
         *
         * @return bool
         */
        isBuilt: function () {
            if (this.spinner) {
                return true;
            }
            return false;
        },

        /**
         * Render button container
         *
         * @return void
         */
        _render: function () {
            var html;

            if (!this.spinnerTemplate) {
                this.spinnerTemplate = mageTemplate(this.options.template);

                html = $(this.spinnerTemplate({
                    data: this.options
                }));

                html.prependTo(this.element);

                this.spinner = html;
                
                this._bindButton();
            }
        },

        /**
         * Destroy button container
         *
         * @return void
         */
        _destroy: function () {
            this.spinner.remove();
        }
    });

    return $.mage.continueBtn;
});
