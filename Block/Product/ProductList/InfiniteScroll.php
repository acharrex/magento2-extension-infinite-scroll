<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogInfiniteScroll\Block\Product\ProductList;

use Magento\Catalog\Helper\Product\ProductList;
use Magento\Store\Model\ScopeInterface;
use Magento\MediaStorage\Helper\File\Storage\Database as FileStoreHelper;
use Magento\Framework\Filter\RemoveTags;
use Shopigo\CatalogInfiniteScroll\Helper\Data as DataHelper;

class InfiniteScroll extends \Magento\Framework\View\Element\Template
{
    /**
     * Config paths
     */
    const XML_PATH_PRIME_CACHE                   = 'shopigo_cataloginfinitescroll/general/prime_cache';
    const XML_PATH_SCROLL_MODE                   = 'shopigo_cataloginfinitescroll/general/scroll_mode';
    const XML_PATH_SCROLL_PAGE_LIMIT             = 'shopigo_cataloginfinitescroll/general/scroll_page_limit';
    const XML_PATH_CONTINUE_BTN_TEXT             = 'shopigo_cataloginfinitescroll/general/continue_btn_text';
    const XML_PATH_USE_CUSTOM_LOADER             = 'shopigo_cataloginfinitescroll/general/use_custom_loader';
    const XML_PATH_LOADER_IMAGE_SRC              = 'shopigo_cataloginfinitescroll/general/loader_image_src';
    const XML_PATH_SHOW_TEXT_LOADER              = 'shopigo_cataloginfinitescroll/general/show_text_loader';
    const XML_PATH_TEXT_LOADER                   = 'shopigo_cataloginfinitescroll/general/text_loader';
    const XML_PATH_AJAX_REQUEST_TIMEOUT          = 'shopigo_cataloginfinitescroll/general/ajax_request_timeout';
    const XML_PATH_SCROLL_TO_TOP_ENABLED         = 'shopigo_cataloginfinitescroll/general/scroll_to_top_enabled';
    const XML_PATH_SCROLL_TO_TOP_DISTANCE        = 'shopigo_cataloginfinitescroll/general/scroll_to_top_distance';
    const XML_PATH_SCROLL_TO_TOP_EASING          = 'shopigo_cataloginfinitescroll/general/scroll_to_top_easing';
    const XML_PATH_SCROLL_TO_TOP_DURATION        = 'shopigo_cataloginfinitescroll/general/scroll_to_top_duration';
    const XML_PATH_SCROLL_TO_TOP_OFFSET          = 'shopigo_cataloginfinitescroll/general/scroll_to_top_offset';
    const XML_PATH_SCROLL_TO_TOP_BTN_COLOR       = 'shopigo_cataloginfinitescroll/general/scroll_to_top_btn_color';
    const XML_PATH_SCROLL_TO_TOP_BTN_COLOR_HOVER = 'shopigo_cataloginfinitescroll/general/scroll_to_top_btn_color_hover';

    /**
     * Default loader image
     */
    const DEFAULT_LOADER_IMAGE_SRC               = 'Shopigo_CatalogInfiniteScroll::images/ajax-loader.gif';

    /**
     * Pager block
     *
     * @var Magento\Theme\Block\Html\Pager
     */
    protected $pagerBlock;

    /**
     * File storage helper
     *
     * @var \Magento\MediaStorage\Helper\File\Storage\Database
     */
    protected $fileStorageHelper;

    /**
     * Remove tags from string
     *
     * @var \Magento\Framework\Filter\RemoveTags
     */
    protected $removeTags;

    /**
     * Data helper
     *
     * @var \Shopigo\CatalogInfiniteScroll\Helper\Data
     */
    protected $dataHelper;

    /**
     * Retrieve pager block
     *
     * @return \Magento\Theme\Block\Html\Pager|null
     */
    protected function getPagerBlock()
    {
        if (null === $this->pagerBlock) {
            $block = $this->getLayout()->getBlock('product_list_toolbar_pager');
            if ($block) {
                $this->pagerBlock = $block;
            }
        }
        return $this->pagerBlock;
    }

    /**
     * If DB file storage is on - find there, otherwise - just file_exists
     *
     * @param string $filename Relative path
     * @return bool
     */
    protected function isFile($filename)
    {
        if ($this->fileStorageHelper->checkDbUsage() && !$this->getMediaDirectory()->isFile($filename)) {
            $this->fileStorageHelper->saveFileToFilesystem($filename);
        }
        return $this->getMediaDirectory()->isFile($filename);
    }

    /**
     * Check the availability to display the block
     *
     * @return bool
     */
    protected function canDisplay()
    {
        if (!$this->dataHelper->isEnabled()) {
            return false;
        }

        $pager = $this->getPagerBlock();
        if (!$pager) {
            return false;
        }
        if (!$pager->getCollection()) {
            return false;
        }
        return true;
    }

    /**
     * Render block HTML
     *
     * @return string
     */
    protected function _toHtml()
    {
        if (!$this->canDisplay()) {
            return '';
        }
        return parent::_toHtml();
    }

    /**
     * Initialize dependencies
     *
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param FileStoreHelper $fileStorageHelper
     * @param RemoveTags $removeTags
     * @param DataHelper $dataHelper
     * @param array $data
     * @return void
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        FileStoreHelper $fileStorageHelper,
        RemoveTags $removeTags,
        DataHelper $dataHelper,
        array $data = []
    ) {
        $this->fileStorageHelper = $fileStorageHelper;
        $this->removeTags = $removeTags;
        $this->dataHelper = $dataHelper;
        parent::__construct($context, $data);
    }

    /**
     * Retrieve whether the next page must be preloaded
     *
     * @return int
     */
    public function getPrimeCache()
    {
        return (int)$this->_scopeConfig->isSetFlag(
            self::XML_PATH_PRIME_CACHE,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll mode
     *
     * @return string
     */
    public function getScrollMode()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_MODE,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll page limit
     *
     * @return int
     */
    public function getScrollPageLimit()
    {
        return (int)$this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_PAGE_LIMIT,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve continue button text
     *
     * @return string
     */
    public function getContinueBtnText()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_CONTINUE_BTN_TEXT,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve whether the store owner wants to use a custom image loader
     *
     * @return int
     */
    public function getUseCustomLoader()
    {
        return (int)$this->_scopeConfig->isSetFlag(
            self::XML_PATH_USE_CUSTOM_LOADER,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Get loader image URL
     *
     * @return string
     */
    public function getLoaderImageSrc()
    {
        if (!$this->getUseCustomLoader()) {
            return $this->getViewFileUrl(self::DEFAULT_LOADER_IMAGE_SRC);
        }

        $folderName = \Shopigo\CatalogInfiniteScroll\Model\Config\Backend\Image\Loader::UPLOAD_DIR;
        $loaderImagePath = $this->_scopeConfig->getValue(
            self::XML_PATH_LOADER_IMAGE_SRC,
            ScopeInterface::SCOPE_STORES
        );
        $path = $folderName . '/' . $loaderImagePath;
        $loaderImageUrl = $this->_urlBuilder
            ->getBaseUrl(['_type' => \Magento\Framework\UrlInterface::URL_TYPE_MEDIA]) . $path;

        if (null !== $loaderImagePath && $this->isFile($path)) {
            $url = $loaderImageUrl;
        } else {
            $url = $this->getViewFileUrl(self::DEFAULT_LOADER_IMAGE_SRC);
        }
        return $url;
    }

    /**
     * Retrieve whether the store owner wants to show a text loader
     *
     * @return int
     */
    public function getShowTextLoader()
    {
        return (int)$this->_scopeConfig->isSetFlag(
            self::XML_PATH_SHOW_TEXT_LOADER,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve text loader
     *
     * @return string
     */
    public function getTextLoader()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_TEXT_LOADER,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve AJAX request timeout
     *
     * @return int
     */
    public function getAjaxRequestTimeout()
    {
        return (int)$this->_scopeConfig->getValue(
            self::XML_PATH_AJAX_REQUEST_TIMEOUT,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve whether the scroll-to-top button is enabled
     *
     * @return int
     */
    public function getIsScrollToTopEnabled()
    {
        return (int)$this->_scopeConfig->isSetFlag(
            self::XML_PATH_SCROLL_TO_TOP_ENABLED,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top distance
     *
     * @return int
     */
    public function getScrollToTopDistance()
    {
        return (int)$this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_DISTANCE,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top easing
     *
     * @return string
     */
    public function getScrollToTopEasing()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_EASING,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top easing duration
     *
     * @return int
     */
    public function getScrollToTopDuration()
    {
        return (int)$this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_DURATION,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top offset
     *
     * @return int
     */
    public function getScrollToTopOffset()
    {
        return (int)$this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_OFFSET,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top button color
     *
     * @return string
     */
    public function getScrollToTopBtnColor()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_BTN_COLOR,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top button color on hover
     *
     * @return string
     */
    public function getScrollToTopBtnColorOnHover()
    {
        return $this->_scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_BTN_COLOR_HOVER,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve current page URL
     *
     * @return string
     */
    public function getCurrentPageUrl()
    {
        $pager = $this->getPagerBlock();

        if ($pager->isFirstPage()) {
            $pageUrl = $pager->getPageUrl(null);
        } else {
            $pageUrl = $pager->getPageUrl($pager->getCurrentPage());
        }
        return $this->removeTags->filter($pageUrl);
    }

    /**
     * Retrieve next page URL
     *
     * @return string
     */
    public function getNextPageUrl()
    {
        $pager = $this->getPagerBlock();
        if ($pager->isLastPage()) {
            return '';
        }
        return $this->removeTags->filter($pager->getNextPageUrl());
    }

    /**
     * Retrieve total number of pages
     *
     * @return int
     */
    public function getPageTotalNum()
    {
        return $this->getPagerBlock()->getTotalNum();
    }
}
