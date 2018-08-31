<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogInfiniteScroll\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Store\Model\ScopeInterface;

class Data extends AbstractHelper
{
    /**
     * Config paths
     */
    const XML_PATH_ENABLED        = 'shopigo_cataloginfinitescroll/general/enabled';
    const XML_PATH_DISABLE_OUTPUT = 'advanced/modules_disable_output/Shopigo_CatalogInfiniteScroll';

    /**
     * Check if the module is enabled
     *
     * @return bool
     */
    public function isEnabled()
    {
        if (!$this->isModuleOutputEnabled()) {
            return false;
        }
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_ENABLED,
            ScopeInterface::SCOPE_STORES
        );
    }
}
