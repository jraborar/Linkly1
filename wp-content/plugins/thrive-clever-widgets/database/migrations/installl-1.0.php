<?php

defined( 'THRIVE_CLEVER_WIDGETS_DB_UPDATE' ) or exit();

/**
 * @var $wpdb wpdb
 */
global $wpdb;

$widgets_options_table = Thrive_Clever_Widgets_Database_Manager::tableName( 'widgets_options' );

$sql = "CREATE TABLE IF NOT EXISTS " . $widgets_options_table . " (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `widget` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255),
    `show_widget_options` TEXT NOT NULL,
    `hide_widget_options` TEXT NOT NULL,
    PRIMARY KEY (`id`)
)";
$wpdb->query( $sql );

$saved_widgets_options_table = Thrive_Clever_Widgets_Database_Manager::tableName( "saved_widgets_options" );

$sql = "CREATE TABLE IF NOT EXISTS " . $saved_widgets_options_table . " (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `show_widget_options` TEXT NOT NULL,
    `hide_widget_options` TEXT NOT NULL,
    PRIMARY KEY (`id`)
)";
$wpdb->query( $sql );
