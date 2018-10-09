<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogInfiniteScroll\Model\Config\Source;

class ScrollMode implements \Magento\Framework\Option\ArrayInterface
{
    /**
     * Scroll modes
     *
     * @var array
     */
    protected $modes = [
        'auto'       => 'Automatic',
        'auto_up_to' => 'Automatic up to X pages, then manual',
        'auto_each'  => 'Automatic each X pages',
        'manual'     => 'Manual'
    ];

    /**
     * Options getter
     *
     * @return array
     */
    public function toOptionArray()
    {
        $options = [];

        foreach ($this->modes as $mode => $label) {
            $options[] = [
                'value' => $mode,
                'label' => __($label)
            ];
        }

        return $options;
    }
}
