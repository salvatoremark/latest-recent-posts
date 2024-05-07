<?php

/**
 * Plugin Name:       Latest Recent Posts
 * Description:       A new block created by the create-block tool using a custom external project template.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Mark Salvatore
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       latest-recent-posts
 *
 * @package LatestRecentPosts
 */


// Exit if accessed directly
defined('ABSPATH') || exit;

if (!class_exists('Msalv_LatestRecentPosts')) {

  class Msalv_LatestRecentPosts {

    function __construct() {
      add_action('init', array($this, 'block_init'));
    }
    /**
     * Register the block using the metadata loaded from `block.json`.
     * It also registers all assets so they can be enqueued.
     *
     * @see https://developer.wordpress.org/reference/functions/register_block_type/
     */
    function block_init() {
      register_block_type(__DIR__ . '/build', array('render_callback' => array($this, 'render_block')));
    }

    function render_block($attributes) {

      $args = array(
        'posts_per_page' => $attributes['numberOfPosts'],
        'post_status' => 'publish',
        'order' => $attributes['postOrder'],
        'orderby' => $attributes['postOrderBy'],
      );

      if (isset($attributes['selectedCategories'])) {
        $args['category__in'] = array_column($attributes['selectedCategories'], 'id');
      }
      $recent_posts = get_posts($args);

      // Output
      $output = '<ul ' . get_block_wrapper_attributes(
        [
          'class' => 'columns-' . $attributes["numberOfColumns"],
          'style' => 'color: #333',
        ]
      ) . '>';
      foreach ($recent_posts as $post) {
        $title = get_the_title($post);
        $title = $title ? $title : __("(No title)", "msalv-latest-recent-posts");
        $permalink = get_permalink($post);
        $excerpt = get_the_excerpt($post);
        $output .= '<li>';
        if ($attributes['linkToPost']) {
          $output .= '<h3><a href="' . esc_url($permalink) . '">' . $title . '</a></h3>';
        } else {
          $output .= '<h3>' . $title . '</h3>';
        }

        $output .= '<time datetime="' . esc_attr(get_the_date('c', $post))  . '">' . esc_html(get_the_date('', $post)) . '</time>';

        if ($attributes['displayFeaturedImage'] && has_post_thumbnail($post)) {
          $output .= get_the_post_thumbnail($post, 'thumbnail');
        }
        if (!empty($excerpt)) {
          $output .= '<p>' . $excerpt . '</p>';
        }
        $output .= '</li>';
      }
      $output .= '</ul>';

      return $output;
    }
  }
  $msalvLatestRecentPosts = new Msalv_LatestRecentPosts();
}
