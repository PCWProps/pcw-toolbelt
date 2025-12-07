<?php
/**
 * Example Elementor Widget - FOR TESTING CONTEXT-AWARE AUDITOR
 * This file intentionally contains issues to demonstrate the audit system
 */

namespace MyPlugin\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

// This class will trigger warnings because it's missing some methods
class Example_Widget extends Widget_Base {
    
    public function get_name() {
        return 'example-widget';
    }
    
    // Missing: get_title(), get_icon(), get_categories()
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Bad practice: inline styles
        ?>
        <style>
            .my-widget { color: red; }
        </style>
        
        <div class="my-widget">
            <?php 
            // Security issue: direct echo without escaping
            echo $settings['title']; 
            ?>
        </div>
        <?php
    }
    
    protected function _register_controls() {
        // Deprecated method name!
        $this->start_controls_section(
            'content_section',
            [
                'label' => 'Content',
            ]
        );
        
        $this->add_control(
            'title',
            [
                'label' => 'Title',
                'type' => Controls_Manager::TEXT,
            ]
        );
        
        $this->end_controls_section();
    }
}
