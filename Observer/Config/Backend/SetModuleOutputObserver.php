<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogInfiniteScroll\Observer\Config\Backend;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Store\Model\ScopeInterface;
use Shopigo\CatalogInfiniteScroll\Helper\Data as DataHelper;

class SetModuleOutputObserver implements ObserverInterface
{
    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var WriterInterface
     */
    protected $configWriter;

    /**
     * Initialize dependencies
     *
     * @param ScopeConfigInterface $scopeConfig
     * @param WriterInterface $configWriter
     * @return void
     */
    public function __construct(
        ScopeConfigInterface $scopeConfig,
        WriterInterface $configWriter
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->configWriter = $configWriter;
    }

    /**
     * Enable / disable module output
     *
     * @param string $scope
     * @param int $scopeId
     * @return void
     */
    protected function enableDisableModuleOutput($scope, $scopeId = 0)
    {
        // Retrieve the module state (enabled or disabled)
        $value = $this->scopeConfig->isSetFlag(
            DataHelper::XML_PATH_ENABLED,
            $scope,
            $scopeId
        );

        // Enable / disable module output
        $this->configWriter->save(
            DataHelper::XML_PATH_DISABLE_OUTPUT,
            !$value,
            $scope,
            $scopeId
        );
    }

    /**
     * Enable / disable module output when the catalog section is saved
     *
     * @param Observer $observer
     * @return $this
     */
    public function execute(Observer $observer)
    {
        $event = $observer->getEvent();

        $websiteCode = $event->getWebsite();
        if ($websiteCode) {
            $this->enableDisableModuleOutput(
                ScopeInterface::SCOPE_WEBSITES,
                $websiteCode
            );
            return $this;
        }

        $storeCode = $event->getStore();
        if ($storeCode) {
            $this->enableDisableModuleOutput(
                ScopeInterface::SCOPE_STORES,
                $storeCode
            );
            return $this;
        }

        $this->enableDisableModuleOutput(
            ScopeConfigInterface::SCOPE_TYPE_DEFAULT
        );
        return $this;
    }
}
