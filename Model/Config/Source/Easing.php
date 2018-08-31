<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogInfiniteScroll\Model\Config\Source;

class Easing implements \Magento\Framework\Option\ArrayInterface
{
    /**
     * Easings
     *
     * @var array
     */
    protected $easings = [
        'linear',
        'easeInQuad',
        'easeOutQuad',
        'easeInOutQuad',
        'easeInCubic',
        'easeOutCubic',
        'easeInOutCubic',
        'easeInQuart',
        'easeOutQuart',
        'easeInOutQuart',
        'easeInQuint',
        'easeOutQuint',
        'easeInOutQuint',
        'easeInExpo',
        'easeOutExpo',
        'easeInOutExpo',
        'easeInSine',
        'easeOutSine',
        'easeInOutSine',
        'easeInCirc',
        'easeOutCirc',
        'easeInOutCirc',
        'easeInElastic',
        'easeOutElastic',
        'easeInOutElastic',
        'easeInBack',
        'easeOutBack',
        'easeInOutBack',
        'easeInBounce',
        'easeOutBounce',
        'easeInOutBounce'
    ];

    /**
     * Options getter
     *
     * @return array
     */
    public function toOptionArray()
    {
        $options = [
            [
                'value' => 'swing',
                'label' => __('Default (%1)', 'swing')
            ]
        ];

        foreach ($this->easings as $easing) {
            $options[] = [
                'value' => $easing,
                'label' => $easing
            ];
        }

        return $options;
    }
}
