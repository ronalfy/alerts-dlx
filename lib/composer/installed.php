<?php
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
return array(
    'root' => array(
        'name' => 'dlxplugins/alerts-dlx',
        'pretty_version' => 'dev-main',
        'version' => 'dev-main',
        'reference' => 'e8be60020f0e8752ddfeda7061f25726af040ce1',
        'type' => 'project',
        'install_path' => __DIR__ . '/../../',
        'aliases' => array(),
        'dev' => true,
    ),
    'versions' => array(
        'dlxplugins/alerts-dlx' => array(
            'pretty_version' => 'dev-main',
            'version' => 'dev-main',
            'reference' => 'e8be60020f0e8752ddfeda7061f25726af040ce1',
            'type' => 'project',
            'install_path' => __DIR__ . '/../../',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
    ),
);
